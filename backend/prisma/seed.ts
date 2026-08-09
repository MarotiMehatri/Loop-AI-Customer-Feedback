import "dotenv/config";

import {
  //FeedbackChannel,
  //FeedbackStatus,
  PrismaClient,
  Role,
  //Sentiment
} from "../src/generated/prisma/client.js";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash("Loop@123", 12);

  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-corp" },
    update: { name: "Acme Corp" },
    create: {
      name: "Acme Corp",
      slug: "acme-corp",
    },
  });

  const demoUsers = [
    {
      name: "John Admin",
      email: "admin@loop.com",
      role: Role.ADMIN,
    },
    {
      name: "Anita Analyst",
      email: "analyst@loop.com",
      role: Role.ANALYST,
    },
    {
      name: "Vijay Viewer",
      email: "viewer@loop.com",
      role: Role.VIEWER,
    },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        workspaceId: workspace.id,
        isActive: true,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        workspaceId: workspace.id,
      },
    });
  }

  // for (const name of [
  //   "Pricing",
  //   "Product Bug",
  //   "Feature Request",
  //   "Customer Support",
  //   "Product Experience",
  // ]) {
  //   await prisma.theme.upsert({
  //     where: {
  //       workspaceId_name: {
  //         workspaceId: workspace.id,
  //         name,
  //       },
  //     },
  //     update: {},
  //     create: {
  //       name,
  //       workspaceId: workspace.id,
  //     },
  //   });
  // }

  // const feedbackCount = await prisma.feedback.count({
  //   where: { workspaceId: workspace.id },
  // });

  // if (feedbackCount === 0) {
  //   await prisma.feedback.createMany({
  //     data: [
  //       {
  //         content: "The new dashboard is amazing and easy to use.",
  //         channel: FeedbackChannel.APP_STORE,
  //         sentiment: Sentiment.POS,
  //         sentimentScore: 0.92,
  //         status: FeedbackStatus.NEW,
  //         customerName: "Priya",
  //         tags: ["dashboard", "ui"],
  //         workspaceId: workspace.id,
  //       },
  //       {
  //         content: "I am facing issues while logging in. Please fix this.",
  //         channel: FeedbackChannel.SUPPORT,
  //         sentiment: Sentiment.NEG,
  //         sentimentScore: -0.88,
  //         status: FeedbackStatus.REVIEWED,
  //         customerName: "Rahul",
  //         tags: ["login", "bug"],
  //         workspaceId: workspace.id,
  //       },
  //       {
  //         content: "Please add PDF export for weekly reports.",
  //         channel: FeedbackChannel.SURVEY,
  //         sentiment: Sentiment.NEU,
  //         sentimentScore: 0.1,
  //         status: FeedbackStatus.NEW,
  //         customerName: "Neha",
  //         tags: ["reports", "feature"],
  //         workspaceId: workspace.id,
  //       },
  //       {
  //         content: "The pricing is too expensive compared with other tools.",
  //         channel: FeedbackChannel.EMAIL,
  //         sentiment: Sentiment.NEG,
  //         sentimentScore: -0.75,
  //         status: FeedbackStatus.ACTIONED,
  //         customerName: "Amit",
  //         tags: ["pricing"],
  //         workspaceId: workspace.id,
  //       },
  //       {
  //         content: "Customer support solved my issue very quickly.",
  //         channel: FeedbackChannel.SUPPORT,
  //         sentiment: Sentiment.POS,
  //         sentimentScore: 0.86,
  //         status: FeedbackStatus.ACTIONED,
  //         customerName: "Sneha",
  //         tags: ["support"],
  //         workspaceId: workspace.id,
  //       },
  //     ],
  //   });
  // }

  console.log("✅ LOOP demo data created");
  console.log("Admin   : admin@loop.com / Loop@123");
  console.log("Analyst : analyst@loop.com / Loop@123");
  console.log("Viewer  : viewer@loop.com / Loop@123");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
