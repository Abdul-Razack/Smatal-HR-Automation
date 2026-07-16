import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Check all permissions in DB
  const perms = await prisma.permission.findMany();
  console.log('All permissions:', perms.map(p => p.name));
  
  // Check roles
  const roles = await prisma.role.findMany({ include: { rolePermissions: { include: { permission: true } } } });
  console.log('Roles & perms:', roles.map(r => ({ name: r.name, perms: r.rolePermissions.map(rp => rp.permission.name) })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
