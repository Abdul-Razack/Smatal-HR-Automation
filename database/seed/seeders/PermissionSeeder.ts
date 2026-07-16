import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { PermissionAction } from '@prisma/client';

export class PermissionSeeder extends BaseSeeder {
  readonly name = 'PermissionSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma } = context;

    const permissions = [
      { resource: 'User', action: PermissionAction.CREATE, description: 'Create users' },
      { resource: 'User', action: PermissionAction.READ, description: 'Read users' },
      { resource: 'User', action: PermissionAction.UPDATE, description: 'Update users' },
      { resource: 'User', action: PermissionAction.DELETE, description: 'Delete users' },
      
      { resource: 'Employee', action: PermissionAction.CREATE, description: 'Create employees' },
      { resource: 'Employee', action: PermissionAction.READ, description: 'View employees' },
      { resource: 'Employee', action: PermissionAction.UPDATE, description: 'Update employees' },
      { resource: 'Employee', action: PermissionAction.DELETE, description: 'Delete employees' },
      { resource: 'Employee', action: PermissionAction.ACTIVATE, description: 'Activate employees' },
      { resource: 'Employee', action: PermissionAction.TERMINATE, description: 'Terminate employees' },
      { resource: 'Employee', action: PermissionAction.ADMIN, description: 'Administer all employees' },

      { resource: 'Role', action: PermissionAction.CREATE, description: 'Create roles' },
      { resource: 'Role', action: PermissionAction.READ, description: 'Read roles' },
      { resource: 'Role', action: PermissionAction.UPDATE, description: 'Update roles' },
      { resource: 'Role', action: PermissionAction.DELETE, description: 'Delete roles' },
      
      { resource: 'Document', action: PermissionAction.CREATE, description: 'Create documents' },
      { resource: 'Document', action: PermissionAction.READ, description: 'Read documents' },
      
      { resource: 'Workflow', action: PermissionAction.CREATE, description: 'Create workflows' },
      { resource: 'Workflow', action: PermissionAction.READ, description: 'Read workflows' },
      { resource: 'Workflow', action: PermissionAction.MANAGE, description: 'Manage workflows' },
      { resource: 'Workflow', action: PermissionAction.APPROVE, description: 'Approve workflows' },

      { resource: 'Leave', action: PermissionAction.READ, description: 'View leaves' },
      { resource: 'Leave', action: PermissionAction.CREATE, description: 'Create leave requests' },
      { resource: 'Leave', action: PermissionAction.UPDATE, description: 'Update leave requests' },
      { resource: 'Leave', action: PermissionAction.DELETE, description: 'Delete leave requests' },
      { resource: 'Leave', action: PermissionAction.APPROVE, description: 'Approve leave requests' },
      { resource: 'Leave', action: PermissionAction.REJECT, description: 'Reject leave requests' },
      { resource: 'Leave', action: PermissionAction.ADMIN, description: 'Administer all leaves and balances' },
    ];

    let count = 0;
    
    // Using transaction for atomic seed
    await prisma.$transaction(async (tx) => {
      for (const perm of permissions) {
        await tx.permission.upsert({
          where: {
            resource_action: {
              resource: perm.resource,
              action: perm.action,
            }
          },
          update: {
            description: perm.description,
            isDeleted: false,
          },
          create: {
            resource: perm.resource,
            action: perm.action,
            description: perm.description,
          },
        });
        count++;
      }
    });

    console.log(`  -> Upserted ${count} permissions.`);
  }
}
