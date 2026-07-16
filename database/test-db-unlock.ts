import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.identityUser.updateMany({
    where: { email: 'admin@smatal.com' },
    data: { loginAttempts: 0, lockedUntil: null }
  });
  console.log('User has been unlocked!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
