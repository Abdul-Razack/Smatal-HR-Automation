export const TestConstants = {
  API_PREFIX: 'api',
  API_VERSION: '1',
  AUTH: {
    LOGIN_ROUTE: '/api/v1/auth/login',
    ME_ROUTE: '/api/v1/users/me',
    ROLES_ROUTE: '/api/v1/roles',
  },
  CANDIDATE: {
    BASE_ROUTE: '/api/v1/candidates',
  },
  EMPLOYEE: {
    BASE_ROUTE: '/api/v1/employees',
  },
  WORKFLOW: {
    BASE_ROUTE: '/api/v1/workflow-instances',
  },
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    TENANT_ID: 'x-tenant-id',
  },
  SEED_DATA: {
    SUPER_ADMIN_EMAIL: 'admin@smatal.com',
    DEFAULT_PASSWORD: 'Admin@123!',
    TENANT_CODE: 'CMP-001',
    SYSTEM_UUID: '00000000-0000-0000-0000-000000000000',
  },
};
