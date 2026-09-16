import { PrismaClient, Role, Priority, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@taskflow.dev",
      passwordHash: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@taskflow.dev",
      passwordHash: hashedPassword,
      firstName: "Natdanai",
      lastName: "Jansomboon",
      role: Role.USER,
    },
  });

  const today = new Date();

  // Create Seed Tasks with Explicit Due Dates
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: "Prepare Monthly Report",
        description: "Prepare production and yield statistics report.",
        category: "Work",
        priority: Priority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 5,
        ),
      },
      {
        userId: user.id,
        title: "Database Index Tuning",
        description: "Review query performance on PostgreSQL tables.",
        category: "Engineering",
        priority: Priority.URGENT,
        status: TaskStatus.TODO,
        dueDate: today, // Due Today
      },
      {
        userId: user.id,
        title: "Update Project Documentation",
        description: "Write deployment guide for Vercel deployment.",
        category: "Documentation",
        priority: Priority.MEDIUM,
        status: TaskStatus.COMPLETED,
        dueDate: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 3,
        ),
        completedAt: new Date(),
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
