import { Environment } from './types';
import dotenv from 'dotenv';

export const loadEnv = (): Environment => {
  process.env.NODE_ENV === 'development' && dotenv.config();
  const {
    WS_PORT,
    HTTP_PORT,
    CORS_ORIGINS,
    CORS_METHODS,
    ADMIN_USER_ID,
    ADMIN_PASSWORD,
    ADMIN_USER_NAME,
    ADMIN_SESSION_ID,
  } = process.env;

  const env = {
    wsPort: parseInt(WS_PORT),
    httpPort: parseInt(HTTP_PORT),
    corsOrigins: CORS_ORIGINS,
    corsMethods: CORS_METHODS,
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

  return env;
};

const env = loadEnv();

export default env;
