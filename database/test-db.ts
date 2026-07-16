import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.identityUser.count();
  console.log('Total users:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
