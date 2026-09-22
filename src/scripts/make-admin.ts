import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error("❌ ADMIN_EMAIL environment variable is not set.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");

  console.log(`🔍 Looking for user with email: ${adminEmail}`);
  const user = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!user) {
    console.error("❌ User not found. They must register first.");
    process.exit(1);
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    console.log(`✅ User ${user.email} is already ${user.role}.`);
    process.exit(0);
  }

  console.log(`Found user: ${user.name} (${user.email}) with role ${user.role}`);

  if (isApply) {
    console.log(`🔄 Updating role to ADMIN...`);
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN" },
    });
    console.log(`✅ Success! ${user.email} is now an ADMIN.`);
  } else {
    console.log(`\n⚠️ DRY RUN: User found but no changes made.`);
    console.log(`Run with --apply to actually make them an ADMIN.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

