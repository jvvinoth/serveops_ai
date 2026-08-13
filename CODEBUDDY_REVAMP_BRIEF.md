# CodeBuddy Revamp Brief: ServeOps AI

## 1. Product Direction

Revamp ServeOps AI from an F&B-heavy operations assistant into a broader SME business execution product.

New positioning:

> ServeOps AI is a WhatsApp-first AI Operating Team for SMEs.

Core promise:

> Turn customer messages into calls, proposals, pitch decks, invoices, and follow-ups.

Short blurb:

> Turns customer messages into business deliverables.

Important:

- Do not position this as a CRM.
- Do not use heavy enterprise language.
- Do not make the product feel like it only serves F&B.
- F&B can remain as one example, but not the main identity.
- SMEs usually do not have CRM systems. They work through WhatsApp, email, documents, invoices, calendars, and manual follow-ups.

## 2. Why We Are Changing

The current product feels too focused on restaurant/F&B operations, such as stock checks and catering workflows.

The better hackathon product is broader and more agentic:

```text
Customer message
→ AI understands the request
→ AI asks missing questions
→ AI schedules a call or appointment
→ AI creates a proposal or pitch deck
→ AI generates quote/invoice
→ AI drafts follow-up
→ Owner approves
```

This better demonstrates a real AI Business Agent because it creates useful business outputs, not only message classification.

## 3. Target User

Primary target:

- SME owner
- freelancer
- small agency
- tuition centre owner
- salon/spa owner
- clinic admin
- renovation contractor
- small F&B/catering operator

They usually manage work through:

- WhatsApp
- email
- calendar
- PDFs/docs
- invoices
- spreadsheets
- memory and manual reminders

## 4. Main Problem Statement

SME owners lose time and money because every customer inquiry creates many manual tasks.

Example:

A customer asks:

> "Hi, I am opening a cafe next month. Need logo, Instagram launch campaign, and a simple website. Can you send pricing and proposal?"

The owner now has to:

- understand the request
- ask missing questions
- schedule a discovery call
- prepare proposal
- create pitch deck
- estimate pricing
- create invoice or deposit request
- send follow-up
- remember next actions

ServeOps AI should do this work as an AI operating team.

## 5. New Core Workflow

Use this workflow across the product and demo:

```text
1. Customer sends WhatsApp message
2. Inbox Agent understands request
3. Sales Agent qualifies the opportunity
4. Call Agent schedules appointment and prepares script
5. Proposal Agent creates proposal / pitch deck
6. Invoice Agent creates invoice / deposit request
7. Admin Agent creates follow-up tasks and reminders
8. Owner approves everything before it is sent
```

## 6. Agent Team

### 6.1 Inbox Agent

Purpose:

Reads incoming customer messages and understands what work needs to be done.

Outputs:

- message summary
- customer type
- request type
- urgency
- missing information
- recommended next agents

Example:

```text
New business inquiry detected.
Customer needs branding, social launch campaign, and website.
Missing: budget, launch date, preferred call time.
Recommended agents: Sales, Call, Proposal, Invoice, Admin.
```

### 6.2 Sales Agent

Purpose:

Turns customer inquiry into a clear sales response.

Outputs:

- lead qualification
- service package recommendation
- pricing estimate
- WhatsApp reply draft
- missing questions

Example:

```text
Suggested package: Brand Launch Starter
Estimated project value: SGD 2,800-4,500
Reply draft prepared with 3 discovery questions.
```

### 6.3 Call Agent

Purpose:

Schedules appointments and prepares the owner for calls.

Outputs:

- appointment time suggestions
- call script
- questions to ask
- meeting agenda
- post-call summary template

For demo:

- Do not require real autonomous phone calling.
- Show "Call Agent recommends a call" and "Owner approves appointment reply."
- Optional future path: voice API for real calls.

Example:

```text
Recommend a 20-minute discovery call.
Suggested slots: Tue 2 PM, Wed 11 AM, Thu 4 PM.
Call script prepared.
```

### 6.4 Proposal / Pitch Deck Agent

Purpose:

Creates a proposal or pitch deck from the customer request.

Outputs:

- proposal summary
- pitch deck outline
- generated slide preview
- project timeline
- package/pricing slide
- next steps slide

Example pitch deck:

1. Client Goal
2. Proposed Solution
3. Scope of Work
4. Timeline
5. Pricing Options
6. Next Steps

This should be a major demo highlight.

### 6.5 Invoice Agent

Purpose:

Turns approved pricing into an invoice or deposit request.

Outputs:

- invoice number
- customer details
- line items
- subtotal
- GST/tax if needed
- deposit amount
- payment instructions
- PDF-like invoice preview

Example:

```text
Invoice draft created:
Brand Launch Starter Package
Total: SGD 3,200
Deposit due: SGD 1,600
Payment terms: 50% upfront, 50% before launch
```

### 6.6 Admin Agent

Purpose:

Creates internal tasks and reminders.

Outputs:

- follow-up task
- proposal deadline
- call reminder
- invoice follow-up
- owner task list

Example:

```text
Tasks:
- Confirm discovery call time
- Prepare proposal by Thursday
- Follow up if no reply after 24 hours
```

### 6.7 Marketing Agent

Purpose:

Creates helpful follow-up or promotional content when relevant.

Outputs:

- follow-up WhatsApp message
- intro email
- social campaign ideas
- launch copy

Example:

```text
Drafted a friendly follow-up message and 3 launch campaign ideas for the client's cafe opening.
```

## 7. Demo Scenario

Use a small digital/business services agency as the main demo tenant.

Demo business:

**BrightLane Studio**

Business type:

Small design and marketing agency for local SMEs.

Incoming WhatsApp message:

```text
Hi, I am opening a cafe next month. Need help with logo, Instagram launch campaign, and a simple website. Can you send pricing and proposal?
```

Customer:

**Amelia Tan**

Company:

**Morning Nest Cafe**

Expected AI flow:

1. Inbox Agent identifies new project inquiry.
2. Sales Agent suggests a Brand Launch Starter package.
3. Call Agent proposes call slots and creates call script.
4. Proposal Agent creates a 6-slide pitch deck preview.
5. Invoice Agent creates a 50% deposit invoice draft.
6. Admin Agent creates follow-up tasks.
7. Owner approves reply, appointment options, proposal, and invoice.

## 8. App UX Direction

The app should feel like a simple SME workbench, not an enterprise CRM.

Use these labels:

- Inbox
- Requests
- Jobs
- Proposals
- Invoices
- Tasks
- Follow-ups
- Approvals

Avoid these labels:

- CRM
- Pipeline
- Deals
- Enterprise workflow
- Account management
- Lead lifecycle

## 9. Main App Pages

### 9.1 Command Center

Purpose:

Show today’s incoming requests and what the AI operating team prepared.

Content:

- new customer requests
- pending approvals
- generated proposals
- invoice drafts
- scheduled calls
- follow-up reminders

Primary demo CTA:

> Send Sample Customer Inquiry

### 9.2 Inbox

Purpose:

Show WhatsApp-style conversation and agent analysis.

Content:

- incoming customer message
- AI summary
- missing info
- selected agents
- generated response draft

### 9.3 Approvals

Purpose:

Owner reviews before anything is sent or finalized.

Approval cards:

- WhatsApp reply
- appointment schedule message
- proposal/pitch deck
- invoice
- task list
- follow-up message

### 9.4 Proposal / Pitch Deck Page

Purpose:

Show generated business deliverables.

Content:

- proposal title
- customer problem
- recommended solution
- service package
- timeline
- pricing
- next steps
- slide preview cards

This is important for the demo video.

### 9.5 Invoice Page

Purpose:

Show invoice generation.

Content:

- invoice number
- customer
- line items
- subtotal
- tax/GST field
- deposit amount
- payment terms
- status: draft / approved

### 9.6 Tasks / Follow-Ups

Purpose:

Show owner execution list.

Content:

- call customer
- send proposal
- follow up tomorrow
- prepare final invoice
- schedule kickoff

### 9.7 WhatsApp Connect

Purpose:

Show demo connector and production path.

Copy:

> Prototype uses a demo WhatsApp connector for fast testing. Production uses Meta WhatsApp Business Cloud API.

## 10. Website Revamp Requirements

The website should explain the broader SME workflow clearly.

### 10.1 Hero

Headline:

> ServeOps AI

Subheadline:

> AI Operating Team for SMEs

Supporting copy:

> Turn customer messages into calls, proposals, pitch decks, invoices, and follow-ups — all owner-approved.

Primary CTA:

> Try Live Demo

Secondary CTA:

> See Workflow

### 10.2 Problem Section

Headline:

> SMEs run on messages. Work gets lost between replies.

Body:

> Every customer inquiry creates hidden work: questions, calls, proposals, quotes, invoices, follow-ups, and reminders. Most SME owners handle it manually across WhatsApp, documents, calendars, and spreadsheets.

Pain points:

- slow replies
- missed follow-ups
- manual proposal writing
- manual invoice creation
- forgotten appointments
- no clear next action

### 10.3 Solution Section

Headline:

> One AI team that turns messages into completed business work.

Explain:

> ServeOps AI reads a customer message, understands the request, routes it to the right agents, prepares business deliverables, and waits for owner approval.

### 10.4 Agent Team Section

Show cards for:

- Inbox Agent
- Sales Agent
- Call Agent
- Proposal Agent
- Invoice Agent
- Admin Agent
- Marketing Agent

Each card should show:

- role
- what it creates
- example output

### 10.5 Workflow Section

Visual flow:

```text
WhatsApp inquiry
→ Understand request
→ Schedule call
→ Generate proposal
→ Create invoice
→ Draft follow-up
→ Owner approves
```

### 10.6 Demo Scenario Section

Headline:

> Demo: From WhatsApp inquiry to proposal and invoice

Use BrightLane Studio example:

Customer wants logo, Instagram launch campaign, and website.

Show:

- inbound message
- call schedule draft
- pitch deck preview
- invoice preview
- approval queue

### 10.7 Industry Examples Section

Show that the same system works across SMEs.

Cards:

#### Digital Agency

Message becomes proposal, pitch deck, invoice, and kickoff tasks.

#### Tuition Centre

Parent inquiry becomes trial class scheduling, fee quote, and reminder.

#### Salon / Spa

Customer message becomes appointment, package recommendation, deposit invoice, and follow-up.

#### Renovation Contractor

Renovation inquiry becomes site visit booking, quotation, proposal, and material checklist.

#### Clinic

Patient inquiry becomes appointment scheduling, preparation checklist, and follow-up reminder.

#### F&B / Catering

Catering inquiry becomes quote, prep tasks, invoice, and delivery reminder.

### 10.8 Architecture Section

Show:

```text
Customer Message
→ WhatsApp / Demo Connector
→ ServeOps Backend
→ AI Router
→ Specialist Agents
→ Approval Queue
→ Business Deliverables
```

Mention:

> Prototype uses demo WhatsApp connector. Production path uses Meta WhatsApp Business Cloud API.

### 10.9 Closing CTA

Headline:

> Give every SME an AI operating team.

CTA:

> Open Demo

## 11. Demo Video Flow

Target duration: 3-5 minutes.

### 0:00-0:30 Problem

Say:

> SMEs do not have time to turn every customer message into calls, proposals, invoices, and follow-ups. Most of this work happens manually.

### 0:30-1:00 Product

Say:

> ServeOps AI is a WhatsApp-first AI Operating Team for SMEs. It turns customer messages into business deliverables.

### 1:00-2:30 Live Demo

Show:

1. Send sample WhatsApp inquiry.
2. Inbox Agent summarizes request.
3. Sales Agent qualifies package and pricing.
4. Call Agent proposes meeting slots.
5. Proposal Agent generates pitch deck preview.
6. Invoice Agent creates deposit invoice.
7. Admin Agent creates tasks.

### 2:30-3:30 Approval Flow

Show:

- owner approves reply
- owner approves proposal
- owner approves invoice
- task list is created

Say:

> The AI prepares the work, but the owner stays in control.

### 3:30-4:20 Multi-SME Expansion

Show industry cards:

- digital agency
- tuition centre
- salon
- renovation contractor
- clinic
- F&B

Say:

> The first demo is a service business, but the same workflow applies to many SMEs.

### 4:20-5:00 CodeBuddy and Closing

Say:

> We used CodeBuddy to build the product end to end: planning, architecture, UI, backend, AI prompts, and demo workflow.

Close with:

> ServeOps AI gives every SME an AI team that turns messages into business work.

## 12. Required Code Changes

### 12.1 Update Website Copy

Revise landing page so it is not F&B-first.

Use:

> Turn customer messages into calls, proposals, pitch decks, invoices, and follow-ups.

Remove or reduce:

- restaurant-heavy copy
- stock-heavy copy
- catering-only positioning

### 12.2 Update Demo Scenarios

Primary scenario should be:

```text
Digital agency receives WhatsApp inquiry from cafe owner.
```

Keep F&B as one secondary example.

### 12.3 Add Proposal Agent

Create prompt:

`src/ai/prompts/proposal-agent.md`

Expected output:

```json
{
  "type": "proposal",
  "title": "Brand Launch Proposal for Morning Nest Cafe",
  "priority": "high",
  "proposalSummary": "Short proposal summary",
  "slides": [
    {
      "title": "Client Goal",
      "bullets": ["Launch new cafe next month", "Need brand identity and online presence"]
    },
    {
      "title": "Recommended Solution",
      "bullets": ["Logo system", "Instagram launch campaign", "Simple landing page"]
    }
  ],
  "timeline": [
    { "phase": "Discovery", "duration": "2 days" },
    { "phase": "Brand design", "duration": "1 week" }
  ],
  "notes": "Owner notes"
}
```

### 12.4 Add Invoice Agent

Create prompt:

`src/ai/prompts/invoice-agent.md`

Expected output:

```json
{
  "type": "invoice",
  "title": "Deposit Invoice Draft",
  "priority": "high",
  "invoiceNumber": "INV-2026-001",
  "customerName": "Amelia Tan",
  "company": "Morning Nest Cafe",
  "items": [
    { "name": "Brand Launch Starter Package", "qty": 1, "unitPrice": 3200, "total": 3200 }
  ],
  "subtotal": 3200,
  "tax": 0,
  "total": 3200,
  "depositDue": 1600,
  "paymentTerms": "50% upfront, 50% before launch",
  "notes": "Draft invoice pending owner approval"
}
```

### 12.5 Update Router

Router should support:

```json
{
  "agents": ["sales", "call", "proposal", "invoice", "admin"]
}
```

Add routing rules:

- Include `proposal` when the message asks for proposal, pitch, package, scope, or pricing.
- Include `invoice` when a quote/deposit/payment can be generated.
- Include `call` when customer needs appointment, discovery, consultation, or clarification.

### 12.6 Update UI Types

Approval cards should support:

- `reply`
- `appointment`
- `proposal`
- `pitch_deck`
- `invoice`
- `tasks`
- `follow_up`

Proposal card should show slide previews.

Invoice card should show invoice table.

Appointment card should show proposed time slots and call script.

### 12.7 Remove CRM Concepts

Do not add CRM page.

If existing copy says CRM, replace with:

- customer requests
- conversations
- jobs
- follow-ups
- approvals

## 13. Submission Positioning

Use this in the hackathon submission:

Project title:

> ServeOps AI

Direction:

> Business Agent

Product used:

> CodeBuddy

Short blurb:

> Turns customer messages into business deliverables.

Project summary:

> ServeOps AI is a WhatsApp-first AI Operating Team for SMEs. It helps business owners turn customer messages into calls, proposals, pitch decks, invoices, follow-ups, and owner-approved actions. The demo shows a small agency receiving a WhatsApp inquiry and using AI agents to prepare a call, proposal, invoice, and tasks end to end.

## 14. Non-Negotiables

- Do not make this an F&B-only product.
- Do not make this a CRM.
- Do not use enterprise-heavy language.
- The demo must show generated business deliverables.
- Proposal/pitch deck and invoice generation should be visible.
- Owner approval must remain central.
- WhatsApp is the front door, but the value is the business work generated after the message.

