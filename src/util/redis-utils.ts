import IORedis from 'ioredis';
import { RedisExtended } from '../types';

IORedis.prototype.deleteMatching = async function (pattern: string) {
  const redis = this;

  const keys = await redis.keys(pattern);
  return Promise.all(
    keys.map(async (key) => {
      console.log('deleting', key);
      return redis.del(key);
    }),
  );
};

// @ts-ignore
export const Redis: RedisExtended = IORedis;
