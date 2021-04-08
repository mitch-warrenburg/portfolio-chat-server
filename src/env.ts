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
    AUTH_SERVER_URL,
    AUTH_SERVER_USER,
    AUTH_SERVER_PASSWORD,
  } = process.env;

  const env: Environment = {
    wsPort: parseInt(WS_PORT || '9000'),
    httpPort: parseInt(HTTP_PORT || '9001'),
    corsOrigins: CORS_ORIGINS || '*',
    corsMethods: CORS_METHODS || '*',
    redisHost: REDIS_HOST,
    authServerUrl: AUTH_SERVER_URL,
    authServerUser: AUTH_SERVER_USER,
    authServerPassword: AUTH_SERVER_PASSWORD,
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
