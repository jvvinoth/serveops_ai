import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Kopi & Bowl Cafe demo data...");

  // Clean existing data
  await prisma.approvalItem.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.task.deleteMany();
  await prisma.staffShift.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.business.deleteMany();

  // Create business
  const business = await prisma.business.create({
    data: {
      id: "biz_kopibowl",
      name: "Kopi & Bowl Cafe",
      type: "cafe",
      waNumber: "+6591234567",
      waConnected: false,
    },
  });

  // Menu items
  await prisma.menuItem.createMany({
    data: [
      { businessId: business.id, name: "Kaya Toast Set", category: "Breakfast", priceSgd: 5.5, available: true },
      { businessId: business.id, name: "Nasi Lemak", category: "Mains", priceSgd: 8.0, available: true },
      { businessId: business.id, name: "Chicken Rice", category: "Mains", priceSgd: 7.5, available: true },
      { businessId: business.id, name: "Mee Goreng", category: "Mains", priceSgd: 7.0, available: true },
      { businessId: business.id, name: "Laksa", category: "Mains", priceSgd: 9.0, available: true },
      { businessId: business.id, name: "Char Kway Teow", category: "Mains", priceSgd: 8.5, available: true },
      { businessId: business.id, name: "Vegetarian Bee Hoon", category: "Vegetarian", priceSgd: 7.0, available: true },
      { businessId: business.id, name: "Tofu Curry", category: "Vegetarian", priceSgd: 8.0, available: true },
      { businessId: business.id, name: "Kopi O", category: "Beverages", priceSgd: 1.8, available: true },
      { businessId: business.id, name: "Teh Tarik", category: "Beverages", priceSgd: 2.0, available: true },
      { businessId: business.id, name: "Fresh Lime Juice", category: "Beverages", priceSgd: 3.0, available: true },
      { businessId: business.id, name: "Bandung", category: "Beverages", priceSgd: 2.5, available: true },
      // Catering set menus
      { businessId: business.id, name: "Catering Set A (Mixed)", category: "Catering", priceSgd: 12.0, available: true },
      { businessId: business.id, name: "Catering Set B (Vegetarian)", category: "Catering", priceSgd: 12.0, available: true },
      { businessId: business.id, name: "Catering Set C (Halal)", category: "Catering", priceSgd: 13.0, available: true },
    ],
  });

  // Inventory
  await prisma.inventoryItem.createMany({
    data: [
      { businessId: business.id, name: "Rice", unit: "kg", quantity: 45, reorderLevel: 20 },
      { businessId: business.id, name: "Chicken", unit: "kg", quantity: 18, reorderLevel: 15 },
      { businessId: business.id, name: "Tofu", unit: "pcs", quantity: 60, reorderLevel: 30 },
      { businessId: business.id, name: "Coconut Milk", unit: "litre", quantity: 12, reorderLevel: 10 },
      { businessId: business.id, name: "Kopi Beans", unit: "kg", quantity: 8, reorderLevel: 5 },
      { businessId: business.id, name: "Eggs", unit: "tray", quantity: 4, reorderLevel: 3 },
      { businessId: business.id, name: "Chili Paste", unit: "kg", quantity: 6, reorderLevel: 4 },
      { businessId: business.id, name: "Noodles", unit: "kg", quantity: 14, reorderLevel: 10 },
      { businessId: business.id, name: "Vegetables (mixed)", unit: "kg", quantity: 9, reorderLevel: 8 },
      { businessId: business.id, name: "Cooking Oil", unit: "litre", quantity: 11, reorderLevel: 5 },
    ],
  });

  // Staff shifts (next 3 days)
  const today = new Date();
  const dates = [0, 1, 2].map((d) => {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    return date.toISOString().split("T")[0];
  });

  const staff = [
    { name: "Ahmad", role: "Chef" },
    { name: "Mei Lin", role: "Chef" },
    { name: "Ravi", role: "Service" },
    { name: "Sarah", role: "Service" },
    { name: "Kumar", role: "Delivery" },
  ];

  for (const date of dates) {
    for (const s of staff) {
      await prisma.staffShift.create({
        data: {
          businessId: business.id,
          staffName: s.name,
          role: s.role,
          date,
          startTime: "08:00",
          endTime: "16:00",
          available: true,
        },
      });
    }
  }

  // Suppliers
  await prisma.supplier.createMany({
    data: [
      { businessId: business.id, name: "Sheng Siong Wholesale", contact: "+6598765432", items: "Rice, Vegetables, Eggs, Cooking Oil", notes: "Delivers Mon/Wed/Fri" },
      { businessId: business.id, name: "Prima Chicken Farm", contact: "+6597654321", items: "Chicken, Eggs", notes: "Min order 10kg chicken" },
      { businessId: business.id, name: "Teck Sang Trading", contact: "+6596543210", items: "Kopi Beans, Tea, Coconut Milk", notes: "Specialty ingredients" },
      { businessId: business.id, name: "FoodXervices Inc", contact: "+6595432109", items: "Noodles, Chili Paste, Tofu", notes: "Island-wide delivery" },
    ],
  });

  // Demo customer
  const customer = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "David Tan",
      phone: "+6581234567",
      company: "Tech Corp SG",
      notes: "Regular corporate client",
    },
  });

  // Demo conversation with catering inquiry
  const conversation = await prisma.conversation.create({
    data: {
      businessId: business.id,
      customerId: customer.id,
      status: "open",
    },
  });

  // The key demo message — 40 pax catering inquiry
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "inbound",
      body: "Hi, I'm David from Tech Corp. We're planning a team lunch on 15 Aug for 40 pax. Can you cater? We need vegetarian options — about 30% of the group. Budget is around $12/pax. Please send a quote.",
      source: "simulator",
    },
  });

  // Existing tasks
  await prisma.task.createMany({
    data: [
      { businessId: business.id, title: "Restock chicken from Prima Farm", body: "Current stock 18kg, running low for weekend", assignee: "Ahmad", status: "open" },
      { businessId: business.id, title: "Fix broken table fan in dining area", body: "Customer complained about heat", assignee: "Kumar", status: "open" },
      { businessId: business.id, title: "Update menu board for new prices", body: "Price increase effective Aug 10", assignee: "Sarah", status: "open" },
    ],
  });

  console.log("✅ Seed complete!");
  console.log(`   Business: ${business.name}`);
  console.log(`   Menu items: 15`);
  console.log(`   Inventory items: 10`);
  console.log(`   Staff: 5 (across 3 days)`);
  console.log(`   Suppliers: 4`);
  console.log(`   Demo customer: ${customer.name} (${customer.company})`);
  console.log(`   Demo conversation: ${conversation.id}`);
  console.log(`   Demo message: 40 pax catering inquiry`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
