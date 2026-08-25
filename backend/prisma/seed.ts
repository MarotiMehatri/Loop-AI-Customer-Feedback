

import "dotenv/config";

import {
  PrismaClient,
  Role,
} from "../src/generated/prisma/client.js";

import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("🌱 Starting LOOP database seed...");

  // =========================================================
  // 1. Create / update demo password
  // =========================================================

  const password = "Loop@123";

  const passwordHash = await bcrypt.hash(password, 12);

  // =========================================================
  // 2. Create / update workspace
  // =========================================================

  const workspace = await prisma.workspace.upsert({
    where: {
      slug: "acme-corp",
    },

    update: {
      name: "Acme Corp",
    },

    create: {
      name: "Acme Corp",
      slug: "acme-corp",
    },
  });

  console.log(`✅ Workspace ready: ${workspace.name}`);

  // =========================================================
  // 3. Demo users
  // =========================================================

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

  // =========================================================
  // 4. Create / update users
  // =========================================================

  for (const user of demoUsers) {
    const savedUser = await prisma.user.upsert({
      where: {
        email: user.email,
      },

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
        isActive: true,
      },
    });

    console.log(
      `✅ ${savedUser.role} user ready: ${savedUser.email}`,
    );
  }

  // =========================================================
  // 5. Create default themes
  // =========================================================

  const themes = [
    "Pricing",
    "Product Bug",
    "Feature Request",
    "Customer Support",
    "Product Experience",
  ];

  for (const name of themes) {
    await prisma.theme.upsert({
      where: {
        workspaceId_name: {
          workspaceId: workspace.id,
          name,
        },
      },

      update: {},

      create: {
        name,
        workspaceId: workspace.id,
      },
    });
  }

  console.log(`✅ ${themes.length} themes ready`);

  // =========================================================
  // 6. Create demo feedback only when workspace is empty
  // =========================================================

  /*
   * IMPORTANT:
   *
   * These imports are intentionally not enabled here because
   * your current seed file has them commented out.
   *
   * If your schema contains these enums exactly:
   *
   * FeedbackChannel
   * FeedbackStatus
   * Sentiment
   *
   * you can enable the feedback seed section.
   */

  // =========================================================
  // 7. Final output
  // =========================================================

  console.log("");
  console.log("========================================");
  console.log("🎉 LOOP demo data created successfully");
  console.log("========================================");
  console.log("");

  console.log("ADMIN");
  console.log("Email    : admin@loop.com");
  console.log("Password : Loop@123");
  console.log("");

  console.log("ANALYST");
  console.log("Email    : analyst@loop.com");
  console.log("Password : Loop@123");
  console.log("");

  console.log("VIEWER");
  console.log("Email    : viewer@loop.com");
  console.log("Password : Loop@123");
  console.log("");

  console.log("Workspace");
  console.log("Name : Acme Corp");
  console.log("Slug : acme-corp");
  console.log("");
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error("❌ LOOP seed failed");
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });