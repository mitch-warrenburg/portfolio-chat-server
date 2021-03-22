import IORedis from 'ioredis';
import { RedisExtended } from '../types';

IORedis.prototype.deleteMatching = async function (
  pattern: string,
): Promise<Array<string> | undefined> {
  const redis = this;

  const keys = await redis.keys(pattern);
  await Promise.all(keys.map(async (key) => redis.del(key)));

  return keys?.length ? keys : undefined;
};

// @ts-ignore
export const Redis: RedisExtended = IORedis;
