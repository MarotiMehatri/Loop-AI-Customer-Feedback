import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

const FEEDBACK_SEED = [
  {
    content: "The new analytics dashboard is amazing and super easy to use.",
    source: "APP_STORE",
    sentiment: "POSITIVE",
    status: "REVIEWED",
    category: "Product Experience",
    customerName: "Priya Sharma",
    customerEmail: "priya@example.com",
    isImportant: true,
    daysAgo: 0,
  },
  {
    content: "I am facing issues while logging in after the latest update. Please fix this.",
    source: "SUPPORT",
    sentiment: "NEGATIVE",
    status: "NEW",
    category: "Product Bug",
    customerName: "Rahul Verma",
    customerEmail: "rahul@example.com",
    isImportant: true,
    daysAgo: 0,
  },
  {
    content: "Please add PDF export for the weekly reports.",
    source: "SURVEY",
    sentiment: "NEUTRAL",
    status: "NEW",
    category: "Feature Request",
    customerName: "Neha Gupta",
    customerEmail: "neha@example.com",
    daysAgo: 1,
  },
  {
    content: "The pricing is too expensive compared to other tools in the market.",
    source: "EMAIL",
    sentiment: "NEGATIVE",
    status: "ACTIONED",
    category: "Pricing",
    customerName: "Amit Patel",
    customerEmail: "amit@example.com",
    isImportant: true,
    daysAgo: 1,
  },
  {
    content: "Customer support solved my issue very quickly. Great experience!",
    source: "SUPPORT",
    sentiment: "POSITIVE",
    status: "ACTIONED",
    category: "Customer Support",
    customerName: "Sneha Kulkarni",
    customerEmail: "sneha@example.com",
    daysAgo: 1,
  },
  {
    content: "The mobile app keeps crashing when I upload a large file.",
    source: "APP_STORE",
    sentiment: "NEGATIVE",
    status: "REVIEWED",
    category: "Product Bug",
    customerName: "Vikram Singh",
    customerEmail: "vikram@example.com",
    daysAgo: 2,
  },
  {
    content: "I love the new dark mode, it is very easy on the eyes.",
    source: "SOCIAL",
    sentiment: "POSITIVE",
    status: "REVIEWED",
    category: "UI / UX",
    customerName: "Ananya Iyer",
    customerEmail: "ananya@example.com",
    daysAgo: 2,
  },
  {
    content: "Can you add a Slack integration for real-time notifications?",
    source: "WEBSITE",
    sentiment: "NEUTRAL",
    status: "NEW",
    category: "Feature Request",
    customerName: "Karan Mehta",
    customerEmail: "karan@example.com",
    daysAgo: 2,
  },
  {
    content: "The onboarding flow is confusing, I did not know where to start.",
    source: "SURVEY",
    sentiment: "NEGATIVE",
    status: "REVIEWED",
    category: "UI / UX",
    customerName: "Divya Nair",
    customerEmail: "divya@example.com",
    daysAgo: 3,
  },
  {
    content: "Billing summary emails are clear and helpful.",
    source: "EMAIL",
    sentiment: "POSITIVE",
    status: "ACTIONED",
    category: "Customer Support",
    customerName: "Rohit Malhotra",
    customerEmail: "rohit@example.com",
    daysAgo: 3,
  },
  {
    content: "Loading times are too slow during peak hours.",
    source: "SUPPORT",
    sentiment: "NEGATIVE",
    status: "NEW",
    category: "Product Bug",
    customerName: "Pooja Desai",
    customerEmail: "pooja@example.com",
    daysAgo: 3,
  },
  {
    content: "Team seats are too limited on the basic plan.",
    source: "EMAIL",
    sentiment: "NEGATIVE",
    status: "REVIEWED",
    category: "Pricing",
    customerName: "Suresh Menon",
    customerEmail: "suresh@example.com",
    daysAgo: 4,
  },
  {
    content: "The export to Excel feature works flawlessly.",
    source: "WEBSITE",
    sentiment: "POSITIVE",
    status: "ACTIONED",
    category: "Feature Request",
    customerName: "Meera Krishnan",
    customerEmail: "meera@example.com",
    daysAgo: 4,
  },
  {
    content: "Please allow custom report scheduling.",
    source: "SURVEY",
    sentiment: "NEUTRAL",
    status: "NEW",
    category: "Feature Request",
    customerName: "Arjun Reddy",
    customerEmail: "arjun@example.com",
    daysAgo: 4,
  },
  {
    content: "The support team responded within minutes, very impressive!",
    source: "SOCIAL",
    sentiment: "POSITIVE",
    status: "REVIEWED",
    category: "Customer Support",
    customerName: "Kavita Joshi",
    customerEmail: "kavita@example.com",
    daysAgo: 5,
  },
  {
    content: "Notifications are too noisy, I want to control which ones I get.",
    source: "WEBSITE",
    sentiment: "NEUTRAL",
    status: "REVIEWED",
    category: "Feature Request",
    customerName: "Gaurav Bansal",
    customerEmail: "gaurav@example.com",
    daysAgo: 5,
  },
  {
    content: "The dashboard reports show stale data after refresh.",
    source: "SUPPORT",
    sentiment: "NEGATIVE",
    status: "NEW",
    category: "Product Bug",
    customerName: "Tanvi Agarwal",
    customerEmail: "tanvi@example.com",
    isImportant: true,
    daysAgo: 5,
  },
  {
    content: "Yearly pricing discount is very attractive, we upgraded.",
    source: "EMAIL",
    sentiment: "POSITIVE",
    status: "ACTIONED",
    category: "Pricing",
    customerName: "Nikhil Bhave",
    customerEmail: "nikhil@example.com",
    daysAgo: 6,
  },
  {
    content: "I would like a mobile app for iOS as well.",
    source: "SURVEY",
    sentiment: "NEUTRAL",
    status: "NEW",
    category: "Feature Request",
    customerName: "Isha Anand",
    customerEmail: "isha@example.com",
    daysAgo: 6,
  },
  {
    content: "The search filters are not returning the right results.",
    source: "SUPPORT",
    sentiment: "NEGATIVE",
    status: "REVIEWED",
    category: "Product Bug",
    customerName: "Manish Tripathi",
    customerEmail: "manish@example.com",
    daysAgo: 7,
  },
  {
    content: "Great value for money, our whole team uses it daily.",
    source: "APP_STORE",
    sentiment: "POSITIVE",
    status: "ACTIONED",
    category: "Pricing",
    customerName: "Ritika Saxena",
    customerEmail: "ritika@example.com",
    daysAgo: 7,
  },
  {
    content: "I cannot change my profile picture from the mobile view.",
    source: "SOCIAL",
    sentiment: "NEGATIVE",
    status: "NEW",
    category: "Product Bug",
    customerName: "Aditya Kulkarni",
    customerEmail: "aditya@example.com",
    daysAgo: 8,
  },
  {
    content: "The colour scheme of the new UI is refreshing.",
    source: "WEBSITE",
    sentiment: "POSITIVE",
    status: "REVIEWED",
    category: "UI / UX",
    customerName: "Shreya Bhatt",
    customerEmail: "shreya@example.com",
    daysAgo: 8,
  },
  {
    content: "Auto-suggest while creating reports would save a lot of time.",
    source: "SURVEY",
    sentiment: "NEUTRAL",
    status: "NEW",
    category: "Feature Request",
    customerName: "Harsh Wadhwa",
    customerEmail: "harsh@example.com",
    daysAgo: 9,
  },
  {
    content: "I was charged twice last month, need a refund.",
    source: "EMAIL",
    sentiment: "NEGATIVE",
    status: "ACTIONED",
    category: "Customer Support",
    customerName: "Nandini Rao",
    customerEmail: "nandini@example.com",
    isImportant: true,
    daysAgo: 9,
  },
  {
    content: "The new chart types are beautiful and informative.",
    source: "SOCIAL",
    sentiment: "POSITIVE",
    status: "REVIEWED",
    category: "Product Experience",
    customerName: "Farhan Khan",
    customerEmail: "farhan@example.com",
    daysAgo: 9,
  },
  {
    content: "The weekly digest email is very well summarised.",
    source: "WEBSITE",
    sentiment: "POSITIVE",
    status: "REVIEWED",
    category: "Customer Support",
    customerName: "Rashi Jain",
    customerEmail: "rashi@example.com",
    daysAgo: 10,
  },
  {
    content: "Integration with Zapier fails intermittently.",
    source: "SUPPORT",
    sentiment: "NEGATIVE",
    status: "NEW",
    category: "Product Bug",
    customerName: "Abhishek Yadav",
    customerEmail: "abhishek@example.com",
    daysAgo: 10,
  },
  {
    content: "Adding a compare feature between time periods would be great.",
    source: "SURVEY",
    sentiment: "NEUTRAL",
    status: "NEW",
    category: "Feature Request",
    customerName: "Lakshmi Pillai",
    customerEmail: "lakshmi@example.com",
    daysAgo: 11,
  },
  {
    content: "I feel the annual plan should include priority support.",
    source: "EMAIL",
    sentiment: "NEGATIVE",
    status: "REVIEWED",
    category: "Pricing",
    customerName: "Devansh Shah",
    customerEmail: "devansh@example.com",
    daysAgo: 11,
  },
  {
    content: "The tool is intuitive and the learning curve is small.",
    source: "APP_STORE",
    sentiment: "POSITIVE",
    status: "ACTIONED",
    category: "UI / UX",
    customerName: "Sakshi Pandey",
    customerEmail: "sakshi@example.com",
    daysAgo: 12,
  },
  {
    content: "Date range picker on the dashboard stops at this week only.",
    source: "SUPPORT",
    sentiment: "NEGATIVE",
    status: "REVIEWED",
    category: "Product Bug",
    customerName: "Rohan Gupta",
    customerEmail: "rohan@example.com",
    daysAgo: 12,
  },
  {
    content: "Exporting the sentiment report to PDF is very handy.",
    source: "WEBSITE",
    sentiment: "POSITIVE",
    status: "ACTIONED",
    category: "Feature Request",
    customerName: "Nikita D'souza",
    customerEmail: "nikita@example.com",
    daysAgo: 13,
  },
  {
    content: "Some of the labels on the charts are truncated.",
    source: "SURVEY",
    sentiment: "NEUTRAL",
    status: "NEW",
    category: "UI / UX",
    customerName: "Manoj Pillai",
    customerEmail: "manoj@example.com",
    daysAgo: 13,
  },
] as const;

async function main(): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { slug: "acme-corp" },
  });

  if (!workspace) {
    throw new Error("Workspace not found. Run `npm run seed` first.");
  }

  const admin = await prisma.user.findFirst({
    where: { workspaceId: workspace.id, role: "ADMIN" },
  });

  if (!admin) {
    throw new Error("Admin user not found. Run `npm run seed` first.");
  }

  const themes = [
    { name: "Pricing", color: "#5b2cf0" },
    { name: "Product Bug", color: "#2563eb" },
    { name: "Feature Request", color: "#22a66d" },
    { name: "Customer Support", color: "#f59e0b" },
    { name: "UI / UX", color: "#e45bb9" },
    { name: "Product Experience", color: "#b771d2" },
  ];

  const themeMap = new Map<string, string>();

  for (const theme of themes) {
    const record = await prisma.theme.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: theme.name } },
      update: { color: theme.color, status: "ACTIVE" },
      create: {
        name: theme.name,
        color: theme.color,
        workspaceId: workspace.id,
        status: "ACTIVE",
      },
    });
    themeMap.set(theme.name, record.id);
  }

  const existing = await prisma.feedback.count({ where: { workspaceId: workspace.id } });

  if (existing > 0) {
    console.log(`ℹ️  Skipping demo feedback: workspace already has ${existing} feedback records.`);
    return;
  }

  const now = new Date();

  const created: { id: string; category: string | null }[] = [];

  for (const item of FEEDBACK_SEED) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - item.daysAgo);
    createdAt.setHours(9 + (item.daysAgo % 9), (item.daysAgo * 13) % 60, 0, 0);

    const feedback = await prisma.feedback.create({
      data: {
        content: item.content,
        source: item.source as never,
        sentiment: item.sentiment as never,
        status: item.status as never,
        category: item.category,
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        isImportant: "isImportant" in item ? item.isImportant : false,
        isRead: item.status !== "NEW",
        isClassified: true,
        aiCategory: item.category,
        aiConfidence: 0.88 + ((item.daysAgo % 10) / 100),
        aiSummary: item.content.slice(0, 120),
        aiProcessedAt: createdAt,
        tags: [item.category],
        createdById: admin.id,
        workspaceId: workspace.id,
        createdAt,
      },
      select: { id: true, category: true },
    });

    created.push(feedback);
  }

  for (const feedback of created) {
    if (!feedback.category) continue;

    const themeId = themeMap.get(feedback.category);
    if (!themeId) continue;

    await prisma.feedbackTheme.create({
      data: {
        feedbackId: feedback.id,
        themeId,
        confidence: 0.9,
        isPrimary: true,
      },
    });
  }

  console.log(`✅ Created ${created.length} demo feedback records with themes.`);
}

main()
  .catch((error) => {
    console.error("❌ Demo data seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
