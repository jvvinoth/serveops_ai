import fs from "fs";
import path from "path";
import { callLLM } from "@/lib/llm";
import { prisma } from "@/lib/db";

function loadPrompt(name: string): string {
  const filePath = path.join(process.cwd(), "src/ai/prompts", `${name}.md`);
  return fs.readFileSync(filePath, "utf-8");
}

export interface RouterOutput {
  intent: string;
  urgency: string;
  estimatedValue: number;
  currency: string;
  summary: string;
  customerType: string;
  missingInfo: string[];
  agents: string[];
  notes: string;
}

type CustomerContext = {
  name: string;
  phone: string;
  company?: string | null;
};

export type BusinessProfile = {
  businessName?: string;
  industry?: string;
  offerSummary?: string;
  paymentTerms?: string;
  availability?: string;
  tone?: string;
  services?: Array<{
    name: string;
    priceSgd: number;
    description?: string;
  }>;
};

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function extractBusinessName(messageBody: string, customer?: CustomerContext): string {
  const patterns = [
    /called\s+([A-Z][A-Za-z0-9 '&-]{2,40})/i,
    /business\s+is\s+([A-Z][A-Za-z0-9 '&-]{2,40})/i,
    /company\s+is\s+([A-Z][A-Za-z0-9 '&-]{2,40})/i,
    /for\s+my\s+([A-Za-z0-9 '&-]{2,40})/i,
  ];

  for (const pattern of patterns) {
    const match = messageBody.match(pattern);
    if (match?.[1]) return match[1].replace(/[.?!,].*$/, "").trim();
  }

  return customer?.company || "Client SME";
}

function extractCustomerNeed(messageBody: string): string {
  const cleaned = messageBody.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 180) return cleaned;
  return `${cleaned.slice(0, 177)}...`;
}

function parseJsonObject(raw: string): object {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("LLM response was not valid JSON");
  }
}

function pickProfileService(messageBody: string, businessProfile?: BusinessProfile) {
  const services = businessProfile?.services?.filter((service) => service.name && Number(service.priceSgd) > 0) ?? [];
  if (!services.length) return null;

  const lower = messageBody.toLowerCase();
  const scored = services
    .map((service) => {
      const words = `${service.name} ${service.description ?? ""}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2);
      const score = words.reduce((count, word) => count + (lower.includes(word) ? 1 : 0), 0);
      return { service, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].service : services[0];
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  once: 1,
  two: 2,
  twice: 2,
  twise: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function numberFromText(value: string | undefined): number | null {
  if (!value) return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  return NUMBER_WORDS[value.toLowerCase()] ?? null;
}

function countMentionedDays(lower: string) {
  const dayPatterns = [
    /\bmon(?:day)?\b/,
    /\btue(?:s|sday)?\b/,
    /\bwed(?:nesday)?\b/,
    /\bthu(?:rs|rsday)?\b/,
    /\bfri(?:day)?\b/,
    /\bsat(?:urday)?\b|\bsatuday\b/,
    /\bsun(?:day)?\b/,
  ];
  return dayPatterns.reduce((count, pattern) => count + (pattern.test(lower) ? 1 : 0), 0);
}

function inferQuantityFromMessage(messageBody: string, service?: { name?: string; description?: string }) {
  const lower = messageBody.toLowerCase();
  const serviceText = `${service?.name ?? ""} ${service?.description ?? ""}`.toLowerCase();
  const hourlyService = /\bhourly\b|\bper hour\b|\b\/hr\b|\bhr\b|\bhour\b/.test(serviceText);
  const hourMatch = lower.match(/\b(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:hours?|hrs?|hr)\b/);
  const hours = numberFromText(hourMatch?.[1]);
  const frequencyMatch = lower.match(/\b(\d+(?:\.\d+)?|once|twice|twise|one|two|three|four|five|six|seven)\s*(?:times?|sessions?|bookings?)\b/);
  const weeklyFrequencyMatch = lower.match(/\b(?:weekly|week)\s+(\d+(?:\.\d+)?|once|twice|twise|one|two|three|four|five|six|seven)\b/);
  const explicitFrequency = numberFromText(frequencyMatch?.[1]) ?? numberFromText(weeklyFrequencyMatch?.[1]);
  const dayCount = countMentionedDays(lower);
  const frequency = Math.max(explicitFrequency ?? 0, dayCount || 0, /\bweekends?\b/.test(lower) ? 2 : 0, 1);

  if (hourlyService || hours) {
    return {
      qty: Math.max(1, (hours ?? 1) * frequency),
      unitLabel: "hour",
      explanation: hours && frequency > 1 ? `${frequency} booking days × ${hours} hours` : hours ? `${hours} hours` : `${frequency} booking hours`,
    };
  }

  return {
    qty: Math.max(1, explicitFrequency ?? 1),
    unitLabel: "package",
    explanation: explicitFrequency && explicitFrequency > 1 ? `${explicitFrequency} sessions/packages` : "1 package",
  };
}

function estimatePricingFromMessage(messageBody: string, businessProfile?: BusinessProfile) {
  const service = pickProfileService(messageBody, businessProfile);
  if (!service) return null;
  const quantity = inferQuantityFromMessage(messageBody, service);
  const unitPrice = Number(service.priceSgd);
  const totalSgd = Math.round(unitPrice * quantity.qty * 100) / 100;

  return {
    service,
    qty: quantity.qty,
    unitLabel: quantity.unitLabel,
    explanation: quantity.explanation,
    unitPrice,
    totalSgd,
  };
}

function estimateValueFromMessage(messageBody: string, businessProfile?: BusinessProfile): number {
  const profilePricing = estimatePricingFromMessage(messageBody, businessProfile);
  if (profilePricing) return profilePricing.totalSgd;

  const lower = messageBody.toLowerCase();

  if (/\btuition\b|\btrial class\b|\bprimary\b|\bmath\b|\bregistration\b|\bstudent\b|\bparent\b/.test(lower)) {
    return 480;
  }

  if (/\brenovation\b|\bbto\b|\bsite visit\b|\bkitchen\b|\bbathroom\b/.test(lower)) {
    return 12000;
  }

  if (/\bbridal\b|\bfacial\b|\bmakeup\b|\bsalon\b|\bspa\b/.test(lower)) {
    return 680;
  }

  if (/\bcafe\b|\blogo\b|\binstagram\b|\bwebsite\b|\bcampaign\b|\blaunch\b/.test(lower)) {
    return 3200;
  }

  if (/\bcater\b|\blunch\b|\bpax\b|\bteam meal\b|\bdelivery\b/.test(lower)) {
    return 720;
  }

  return 1500;
}

function demoPackageForMessage(messageBody: string, businessProfile?: BusinessProfile) {
  const profilePricing = estimatePricingFromMessage(messageBody, businessProfile);
  const profileService = profilePricing?.service;
  if (profileService) {
    const industry = businessProfile?.industry || "SME service";
    const packageName = profileService.name;
    const description = profileService.description || businessProfile?.offerSummary || `${packageName} for ${industry}`;

    return {
      packageName,
      lineItem: `${packageName} - ${description}${profilePricing ? ` (${profilePricing.explanation})` : ""}`,
      titlePrefix: `${packageName} Proposal`,
      solution: `We will handle the customer's request using ${packageName}, with clear scope, timing, price, and owner approval before anything is sent.`,
      solutionBullets: [
        `Match the customer request to ${packageName}`,
        "Confirm timing, requirements, and fit",
        "Prepare quote, proposal, invoice, call plan, and follow-up tasks",
      ],
      scopeBullets: [
        description,
        "Customer requirement clarification",
        "Package pricing and payment terms",
        "Owner approval before sending",
        "WhatsApp reply draft",
        "Follow-up task checklist",
      ],
      timelineBullets: [
        "Step 1: confirm customer requirement and timing",
        "Step 2: review package, pricing, and proposal",
        "Step 3: approve invoice or next appointment",
      ],
      paymentTerms: businessProfile?.paymentTerms || "50% deposit upfront, balance before delivery",
      upsell: `Offer a relevant add-on or recurring package for ${industry}.`,
    };
  }

  const lower = messageBody.toLowerCase();

  if (/\btuition\b|\btrial class\b|\bprimary\b|\bmath\b|\bregistration\b|\bstudent\b|\bparent\b/.test(lower)) {
    return {
      packageName: "Primary 6 Math Trial and Registration Package",
      lineItem: "Primary 6 Math tuition package - trial class, diagnostic review, and first month registration",
      titlePrefix: "Tuition Trial and Registration Proposal",
      solution: "We will help the parent evaluate fit through a trial class, clear fee structure, and simple registration flow.",
      solutionBullets: ["Trial class booking", "Monthly lesson fee breakdown", "Registration and onboarding checklist"],
      scopeBullets: [
        "1 trial class for Primary 6 Math",
        "Short diagnostic review after the class",
        "Monthly fee and lesson schedule summary",
        "Registration form and payment instructions",
        "Parent WhatsApp follow-up template",
        "Teacher notes for first lesson planning",
      ],
      timelineBullets: [
        "Day 1: confirm student level and preferred trial slot",
        "Weekend: conduct trial class and diagnostic review",
        "Next day: send registration details and first-month invoice",
      ],
      paymentTerms: "Trial fee or 50% registration deposit upfront, balance before first month starts",
      upsell: "Offer a 3-month PSLE preparation bundle after the trial class.",
    };
  }

  if (/\brenovation\b|\bbto\b|\bsite visit\b|\bkitchen\b|\bbathroom\b/.test(lower)) {
    return {
      packageName: "BTO Renovation Site Visit and Concept Package",
      lineItem: "BTO renovation package - site visit, concept plan, and preliminary quotation",
      titlePrefix: "Renovation Proposal",
      solution: "We will start with a site visit, clarify scope, and prepare a phased renovation estimate for owner approval.",
      solutionBullets: ["Site visit scheduling", "Room-by-room scope planning", "Preliminary budget and timeline"],
      scopeBullets: [
        "On-site measurement and requirement check",
        "Living room, kitchen, bedroom, and bathroom scope notes",
        "Material and carpentry assumptions",
        "Estimated project timeline",
        "Preliminary quotation",
        "Next-step consultation checklist",
      ],
      timelineBullets: [
        "Day 1-2: confirm site visit slot",
        "Week 1: site visit and measurements",
        "Week 2: proposal, estimate, and revision discussion",
      ],
      paymentTerms: "Consultation deposit upfront, renovation deposit after final scope approval",
      upsell: "Offer 3D visualisation as an add-on before final renovation sign-off.",
    };
  }

  if (/\bbridal\b|\bfacial\b|\bmakeup\b|\bsalon\b|\bspa\b/.test(lower)) {
    return {
      packageName: "Bridal Beauty Consultation and Deposit Package",
      lineItem: "Bridal facial and makeup package - consultation, treatment plan, and booking deposit",
      titlePrefix: "Bridal Beauty Package Proposal",
      solution: "We will recommend suitable bridal beauty options, schedule a consultation, and reserve the package with a deposit.",
      solutionBullets: ["Consultation booking", "Package recommendation", "Deposit invoice and appointment plan"],
      scopeBullets: [
        "Bridal facial consultation",
        "Makeup package recommendation",
        "Treatment timeline before event date",
        "Appointment booking support",
        "Deposit and balance payment schedule",
        "WhatsApp confirmation message",
      ],
      timelineBullets: [
        "Day 1: confirm wedding month and skin concerns",
        "Week 1: consultation and package selection",
        "After approval: reserve appointment with deposit",
      ],
      paymentTerms: "50% deposit to reserve package, balance due before appointment",
      upsell: "Offer mother-of-bride or bridesmaid makeup add-ons.",
    };
  }

  return {
    packageName: "Brand Launch Starter Package",
    lineItem: "Brand Launch Starter Package - logo, launch campaign, and one-page website",
    titlePrefix: "Growth Launch Proposal",
    solution: "We will package the launch into a focused brand, content, and website sprint with owner approval at each milestone.",
    solutionBullets: ["Logo direction and visual identity kit", "Launch campaign plan with ready-to-post content", "One-page website with contact and WhatsApp CTA"],
    scopeBullets: [
      "2 logo concepts with 2 revision rounds",
      "10 Instagram launch posts and caption drafts",
      "Responsive landing page copy and layout",
      "WhatsApp inquiry response template",
      "Basic launch checklist for opening week",
      "Final files exported for web and social use",
    ],
    timelineBullets: [
      "Week 1: discovery, brand direction, and content pillars",
      "Week 2: logo concepts, website copy, and campaign calendar",
      "Week 3: final design, landing page build, and revisions",
      "Week 4: launch handover, QA, and WhatsApp follow-up setup",
    ],
    paymentTerms: "50% upfront, 50% before final launch handover",
    upsell: "Offer a monthly social content retainer after launch week.",
  };
}

function fallbackRouterOutput(messageBody: string, businessProfile?: BusinessProfile): RouterOutput {
  const lower = messageBody.toLowerCase();
  const asksForPricing = /\bfee\b|\bfees\b|\bprice\b|\bpricing\b|\bcost\b|\bcosts\b|\brate\b|\brates\b|\bquote\b|\bestimate\b|\bpackage\b|\bpackages\b/.test(lower);
  const asksForInvoice = /\binvoice\b|\bbill\b|\bdeposit\b|\bpayment\b|\bpay\b|\bregistration\b|\bsign up\b|\benrol\b|\benroll\b|\bdecide to start\b/.test(lower);
  const asksForProposal = asksForPricing || /\bproposal\b|\bdeck\b|\bpitch\b|\bwebsite\b|\bcampaign\b|\blaunch\b|\btrial class\b|\btuition\b|\bsite visit\b|\bconsultation\b|\bbridal\b/.test(lower);
  const wantsCall = /\bcall\b|\bappointment\b|\bschedule\b|\bmeet\b|\bthis week\b|\btrial class\b|\bsite visit\b|\bconsultation\b/.test(lower);
  const estimatedValue = estimateValueFromMessage(messageBody, businessProfile);

  return {
    intent: asksForProposal ? "quote_request" : "service_inquiry",
    urgency: asksForProposal || asksForInvoice ? "high" : "normal",
    estimatedValue,
    currency: "SGD",
    summary: `Customer needs SME services: ${extractCustomerNeed(messageBody)}`,
    customerType: "new_lead",
    missingInfo: [
      "Exact preferred start date",
      "Final package confirmation",
      "Preferred call time",
    ],
    agents: [
      "sales",
      ...(asksForProposal ? ["proposal"] : []),
      ...(asksForInvoice ? ["invoice"] : []),
      ...(wantsCall || asksForProposal ? ["call"] : []),
      "admin",
    ],
    notes: "Deterministic demo routing used when model output is unavailable or invalid.",
  };
}

function normalizeRouterOutput(routerOutput: RouterOutput, messageBody: string, businessProfile?: BusinessProfile): RouterOutput {
  const inferred = fallbackRouterOutput(messageBody, businessProfile);
  const estimatedValue = Number(routerOutput.estimatedValue ?? 0);
  const profilePricing = estimatePricingFromMessage(messageBody, businessProfile);

  return {
    ...routerOutput,
    estimatedValue: profilePricing ? inferred.estimatedValue : estimatedValue > 0 ? estimatedValue : inferred.estimatedValue,
    currency: routerOutput.currency || inferred.currency,
    urgency: routerOutput.urgency === "high" || inferred.urgency === "high" ? "high" : routerOutput.urgency || inferred.urgency,
    agents: Array.from(new Set([...(routerOutput.agents ?? []), ...inferred.agents])),
    missingInfo: Array.from(new Set([...(routerOutput.missingInfo ?? []), ...inferred.missingInfo])).slice(0, 6),
    notes: [routerOutput.notes, inferred.notes].filter(Boolean).join(" "),
  };
}

function hasWeakMoneyResult(type: string, result: object, routerOutput: RouterOutput): boolean {
  const body = result as Record<string, unknown>;
  const expectedValue = Number(routerOutput.estimatedValue ?? 0);
  const minimumUsefulValue = expectedValue > 0 ? expectedValue * 0.75 : 1;
  const maximumUsefulValue = expectedValue > 0 ? expectedValue * 1.5 : Number.POSITIVE_INFINITY;

  function isSuspicious(value: number) {
    return value < minimumUsefulValue || value > maximumUsefulValue;
  }

  if (type === "sales") {
    const quote = body.quote as { totalSgd?: unknown } | undefined;
    return isSuspicious(Number(quote?.totalSgd ?? 0));
  }

  if (type === "proposal") {
    const pricing = body.pricingSummary as { totalSgd?: unknown } | undefined;
    return isSuspicious(Number(pricing?.totalSgd ?? 0));
  }

  if (type === "invoice") {
    return isSuspicious(Number(body.totalSgd ?? 0));
  }

  return false;
}

function fallbackAgentResult(
  type: string,
  messageBody: string,
  routerOutput: RouterOutput,
  customer?: CustomerContext,
  businessProfile?: BusinessProfile
): Record<string, unknown> {
  const clientName = customer?.name || "Customer";
  const clientPhone = customer?.phone || "+65 demo";
  const clientBusiness = extractBusinessName(messageBody, customer);
  const need = extractCustomerNeed(messageBody);
  const demoPackage = demoPackageForMessage(messageBody, businessProfile);
  const profilePricing = estimatePricingFromMessage(messageBody, businessProfile);
  const providerName = businessProfile?.businessName || "BrightLane Studio";
  const totalSgd = routerOutput.estimatedValue > 0 ? routerOutput.estimatedValue : 3200;
  const depositSgd = totalSgd / 2;
  const validUntil = addDays(7);
  const dueDate = addDays(14);

  if (type === "proposal") {
    return {
      type: "proposal",
      title: `${demoPackage.titlePrefix} for ${clientBusiness}`,
      priority: "high",
      client: {
        name: clientName,
        business: clientBusiness,
        requirement: need,
      },
      proposedBy: {
        business: providerName,
        contactName: "ServeOps AI Operating Team",
        date: addDays(0),
        validUntil,
      },
      slides: [
        {
          slideNumber: 1,
          title: "About Us",
          content: `${providerName} uses ServeOps AI to turn WhatsApp inquiries into clear replies, proposals, invoices, call plans, and follow-up tasks.`,
          bullets: [
            businessProfile?.offerSummary || "SME-focused service delivery",
            businessProfile?.industry ? `${businessProfile.industry} operating context` : "Works across SME industries",
            "Clear approval points before anything is sent",
          ],
        },
        {
          slideNumber: 2,
          title: "Understanding Your Goals",
          content: `${clientBusiness} needs a practical package that answers the customer's request clearly and helps them decide the next step with confidence.`,
          bullets: [
            "Create a clear brand identity customers can recognise",
            "Prepare launch content for Instagram and WhatsApp",
            "Publish a simple website customers can trust",
          ],
        },
        {
          slideNumber: 3,
          title: "Our Solution",
          content: demoPackage.solution,
          bullets: demoPackage.solutionBullets,
        },
        {
          slideNumber: 4,
          title: "Scope & Deliverables",
          content: "The package is designed for a small team that needs speed, clarity, and reusable assets.",
          bullets: demoPackage.scopeBullets,
        },
        {
          slideNumber: 5,
          title: "Timeline",
          content: "A simple staged timeline keeps the owner and customer aligned before payment or delivery starts.",
          bullets: demoPackage.timelineBullets,
        },
        {
          slideNumber: 6,
          title: "Investment",
          content: "A simple package with clear payment terms so the project can start quickly.",
          bullets: [
            `${demoPackage.packageName}: SGD ${totalSgd.toLocaleString()}`,
            `Deposit to start: SGD ${depositSgd.toLocaleString()}`,
            demoPackage.paymentTerms,
          ],
        },
      ],
      pricingSummary: {
        packageName: demoPackage.packageName,
        totalSgd,
        depositSgd,
        paymentTerms: demoPackage.paymentTerms,
        notes: "Prices exclude GST unless otherwise stated.",
      },
      nextSteps: [
        "Review this proposal and confirm the package scope",
        "Schedule a 30-minute discovery call this week",
        "Approve the deposit invoice so the launch sprint can begin",
      ],
      whatsappMessage: `Hi ${clientName}, I prepared a proposal for ${clientBusiness} with the package, timeline, and pricing. Please review it and share a good time for a quick call this week.`,
      notes: "Generated by fallback proposal flow to keep the live demo reliable.",
    };
  }

  if (type === "invoice") {
    return {
      type: "invoice",
      title: `Deposit Invoice for ${clientBusiness} - ${demoPackage.packageName}`,
      priority: "high",
      invoiceNumber: `INV-${new Date().getFullYear()}-001`,
      status: "draft",
      issueDate: addDays(0),
      dueDate,
      billFrom: {
        businessName: providerName,
        address: "Singapore",
        email: "hello@brightlane.studio",
        phone: "+65 9000 0000",
      },
      billTo: {
        name: clientName,
        businessName: clientBusiness,
        phone: clientPhone,
      },
      lineItems: [
        {
          description: demoPackage.lineItem,
          qty: profilePricing?.qty ?? 1,
          unitPrice: profilePricing?.unitPrice ?? totalSgd,
          subtotal: totalSgd,
        },
      ],
      subtotalSgd: totalSgd,
      discountSgd: 0,
      gstSgd: 0,
      totalSgd,
      depositDueSgd: depositSgd,
      balanceDueSgd: totalSgd - depositSgd,
      paymentInstructions: "PayNow / bank transfer. Reference invoice number when making payment.",
      notes: "Draft invoice for owner approval before sending to customer.",
      whatsappMessage: `Hi ${clientName}, here is the draft deposit invoice for the ${demoPackage.packageName}. The deposit is SGD ${depositSgd.toLocaleString()} to start, with the balance due before final handover.`,
    };
  }

  if (type === "call") {
    return {
      type: "call_script",
      title: `Discovery Call Plan for ${clientBusiness}`,
      priority: "high",
      shouldCall: true,
      reason: "The request includes multiple deliverables and payment discussion, so a short call will reduce back-and-forth.",
      bestTimeToCall: "Afternoon (2-4pm)",
      suggestedAppointmentSlots: [
        { date: addDays(1), time: "14:30", label: "Tomorrow 2:30pm" },
        { date: addDays(3), time: "10:00", label: "Next available morning 10am" },
      ],
      script: {
        opening: `Hi ${clientName}, this is ${providerName}. I saw your message about ${clientBusiness} and wanted to quickly understand what you need and the timing.`,
        keyPoints: [
          "Confirm the exact requirement and preferred timing",
          `Walk through the ${demoPackage.packageName}`,
          "Confirm budget comfort and deposit timing",
          "Agree on the next approval step after the proposal or invoice",
        ],
        objectionHandlers: {
          "too expensive": "We can split the package into launch-critical items first, then phase the remaining assets after opening.",
          "need more time": "No problem. I can keep the proposal valid for seven days and we can lock the timeline once you are ready.",
          "not sure yet": "That is fair. I can send a short package summary and we can decide after a 15-minute call.",
        },
        closing: "Great, I will send the proposal and draft deposit invoice here on WhatsApp for your review.",
      },
      notes: "Owner should call before sending the invoice if the customer has not fully confirmed scope.",
    };
  }

  if (type === "admin") {
    return {
      type: "tasks",
      title: `Follow-up Tasks for ${clientBusiness}`,
      priority: "high",
      tasks: [
        {
          title: "Review generated proposal deck",
          body: `Check the package scope, timeline, and pricing for ${clientBusiness} before sending.`,
          assignee: "Owner",
          dueDate: addDays(1),
          dueTime: "10:00",
          category: "preparation",
        },
        {
          title: "Confirm discovery call slot",
          body: `Ask ${clientName} for a preferred call time this week and confirm the meeting.`,
          assignee: "Owner",
          dueDate: addDays(1),
          dueTime: "15:00",
          category: "follow_up",
        },
        {
          title: "Approve deposit invoice",
          body: "Verify invoice amount and payment terms before sending the payment link or PDF.",
          assignee: "Owner",
          dueDate: addDays(2),
          dueTime: "11:00",
          category: "finance",
        },
      ],
      calendarBlock: {
        title: `Discovery call - ${clientBusiness}`,
        date: addDays(1),
        startTime: "14:30",
        endTime: "15:00",
        notes: "Confirm final scope, launch date, and deposit timing.",
      },
      notes: "Tasks generated from WhatsApp inquiry.",
    };
  }

  return {
    type: "quote",
    title: `Quote Reply for ${clientBusiness}`,
    priority: "high",
    whatsappReply: `Hi ${clientName}, thanks for sharing the details for ${clientBusiness}. I can help with the ${demoPackage.packageName}. I will send a proposal and draft deposit invoice for your review, then we can jump on a quick call to finalise scope.`,
    leadScore: "hot",
    leadSummary: `${clientName} is asking for launch support and pricing for ${clientBusiness}.`,
    quote: {
      items: [
        {
          name: demoPackage.packageName,
          qty: profilePricing?.qty ?? 1,
          unitPriceSgd: profilePricing?.unitPrice ?? totalSgd,
          subtotalSgd: totalSgd,
        },
      ],
      subtotalSgd: totalSgd,
      gstSgd: 0,
      totalSgd,
      notes: "Excludes GST unless BrightLane Studio confirms GST registration.",
      validUntil,
    },
    upsellSuggestion: demoPackage.upsell,
    notes: "High-intent SME lead. Recommend a personal follow-up call before sending final invoice.",
  };
}

async function runAgent(
  promptFile: string,
  messageBody: string,
  businessContext: string,
  routerOutput: RouterOutput
): Promise<object> {
  const systemPrompt = loadPrompt(promptFile);
  const userMessage = [
    `Customer message: "${messageBody}"`,
    `Business context:\n${businessContext}`,
    `Router analysis:\n${JSON.stringify(routerOutput, null, 2)}`,
  ].join("\n\n");
  const raw = await callLLM(systemPrompt, userMessage);
  return parseJsonObject(raw);
}

export async function runRouter(
  messageBody: string,
  businessContext: string
): Promise<RouterOutput> {
  const systemPrompt = loadPrompt("router");
  const userMessage = `Customer message: "${messageBody}"\n\nBusiness context:\n${businessContext}`;
  const raw = await callLLM(systemPrompt, userMessage);
  return parseJsonObject(raw) as RouterOutput;
}

export async function buildBusinessContext(businessId: string, businessProfile?: BusinessProfile): Promise<string> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, type: true, waNumber: true },
  });
  const businessName = businessProfile?.businessName?.trim() || "BrightLane Studio";
  const businessType = businessProfile?.industry?.trim() || "SME design, marketing, and business services agency";

  // Build a generic SME business profile that works for any industry
  return JSON.stringify(
    {
      businessName,
      businessType,
      actualTenantRecord: business?.name ?? "ServeOps Demo Business",
      whatsappNumber: business?.waNumber ?? null,
      currency: "SGD",
      country: "Singapore",
      timezone: "Asia/Singapore",
      today: new Date().toISOString().split("T")[0],
      services: businessProfile?.services ?? [],
      offerSummary: businessProfile?.offerSummary ?? null,
      paymentTerms: businessProfile?.paymentTerms ?? "PayNow / bank transfer. Reference the invoice number when making payment.",
      callAvailability: businessProfile?.availability ?? "Tomorrow 2:30pm or the next available weekday morning",
      brandVoice: businessProfile?.tone ?? "warm, concise, professional",
      demoPositioning:
        `${businessName} uses ServeOps AI to turn customer demand into replies, proposals, invoices, call plans, and follow-up workflows.`,
      paymentInstructions:
        businessProfile?.paymentTerms ?? "PayNow / bank transfer. Reference the invoice number when making payment.",
    },
    null,
    2
  );
}

const AGENT_PROMPT_MAP: Record<string, string> = {
  sales: "sales-agent",
  proposal: "proposal-agent",
  invoice: "invoice-agent",
  admin: "admin-agent",
  call: "call-agent",
  marketing: "marketing-agent",
};

export async function runFullPipeline(
  conversationId: string,
  messageBody: string,
  businessId: string,
  businessProfile?: BusinessProfile
): Promise<string> {
  const agentRun = await prisma.agentRun.create({
    data: { conversationId, status: "running" },
  });

  try {
    const businessContext = await buildBusinessContext(businessId, businessProfile);
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { customer: true },
    });
    const customer = conversation?.customer
      ? {
          name: conversation.customer.name,
          phone: conversation.customer.phone,
          company: conversation.customer.company,
        }
      : undefined;
    let routerOutput: RouterOutput;

    try {
      routerOutput = await runRouter(messageBody, businessContext);
    } catch (error) {
      console.error("Router fallback used:", error);
      routerOutput = fallbackRouterOutput(messageBody, businessProfile);
    }

    routerOutput = normalizeRouterOutput(routerOutput, messageBody, businessProfile);

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { routerOutput: routerOutput as object },
    });

    const agentsToRun = Array.from(new Set((routerOutput.agents ?? []).filter((a) => AGENT_PROMPT_MAP[a])));

    const agentResults = await Promise.all(
      agentsToRun.map(async (type) => {
        try {
          return {
            type,
            result: await runAgent(AGENT_PROMPT_MAP[type], messageBody, businessContext, routerOutput).then((result) =>
              hasWeakMoneyResult(type, result, routerOutput) ? fallbackAgentResult(type, messageBody, routerOutput, customer, businessProfile) : result
            ),
          };
        } catch (error) {
          console.error(`${type} agent fallback used:`, error);
          return {
            type,
            result: fallbackAgentResult(type, messageBody, routerOutput, customer, businessProfile),
          };
        }
      })
    );

    for (const { type, result } of agentResults) {
      const body = result as Record<string, unknown>;

      await Promise.all([
        prisma.recommendation.create({
          data: {
            agentRunId: agentRun.id,
            agentType: type,
            type: (body.type as string) || type,
            title: (body.title as string) || `${type} recommendation`,
            body: result,
            priority: (body.priority as string) || "normal",
          },
        }),
        prisma.approvalItem.create({
          data: {
            agentRunId: agentRun.id,
            type: (body.type as string) || type,
            title: (body.title as string) || `${type} recommendation`,
            content: result,
            status: "pending",
          },
        }),
      ]);
    }

    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { status: "complete" },
    });

    return agentRun.id;
  } catch (error) {
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { status: "failed" },
    });
    throw error;
  }
}
