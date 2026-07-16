export const config = {
  env: process.env.NODE_ENV || 'development',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Smatal HR System',
};

export const isDev = config.env === 'development';
export const isProd = config.env === 'production';
export const isTest = config.env === 'test';
