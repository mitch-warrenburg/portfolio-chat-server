import dotenv from 'dotenv';
import { Environment } from './types';

export const loadEnv = (): Environment => {
  dotenv.config();
  const {
    WS_PORT,
    HTTP_PORT,
    REDIS_HOST,
    CORS_ORIGINS,
    CORS_METHODS,
    ADMIN_USER_ID,
    ADMIN_PASSWORD,
    ADMIN_USER_NAME,
    ADMIN_SESSION_ID,
  } = process.env;

  const env = {
    wsPort: parseInt(WS_PORT || '9000'),
    httpPort: parseInt(HTTP_PORT || '9001'),
    corsOrigins: CORS_ORIGINS || '*',
    corsMethods: CORS_METHODS || '*',
    redisHost: REDIS_HOST,
    adminUserId: ADMIN_USER_ID,
    adminPassword: ADMIN_PASSWORD,
    adminUsername: ADMIN_USER_NAME,
    adminSessionId: ADMIN_SESSION_ID,
  };

  const missingVariablesMessage = Object.entries(env)
    .filter(([_, value]) => !value)
    .map(([key]) => `Environment variable required but not found: ${key}`)
    .join('\n');

  if (missingVariablesMessage) {
    console.error(missingVariablesMessage);
    console.error(`
      All required environment variables must be present.
      Aborting application start.`);
    process.exit(1);
  }

  console.log('Starting application with env:\n', env);

  return env;
};

const env = loadEnv();

export default env;
