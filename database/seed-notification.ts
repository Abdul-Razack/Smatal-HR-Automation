import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.identityUser.findFirst();
  if (!user) {
    console.log("No user found.");
    return;
  }
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log("No company found.");
    return;
  }

  const notification = await prisma.notification.create({
    data: {
      businessId: 'NOT-100' + Math.floor(Math.random() * 1000),
      companyId: company.id,
      title: 'Welcome to Smatal HR',
      message: 'Your system setup is complete. You can now explore all the modules.',
      notificationType: 'SYSTEM_ALERT',
      priority: 'HIGH',
      recipient: user.id, // Assuming recipient is identity user ID
      readStatus: false
    }
  });

  console.log("Notification seeded for user:", user.email, "Notification ID:", notification.id);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
