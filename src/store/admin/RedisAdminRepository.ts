import bcrypt from 'bcrypt';
import { AdminRepository } from './types';
import { User, RedisExtended } from '../../types';

export default class RedisAdminRepository implements AdminRepository {
  private redisClient: RedisExtended;

  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  async saveUser(username: string, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);

    await this.redisClient
      .multi()
      .hset(`admin:${username}`, 'username', username, 'password', passwordHash)
      .exec();
  }

  async findUser(username: string): Promise<User | undefined> {
    return this.redisClient
      .hmget(`admin:${username}`, 'username', 'password')
      .then(([username, password]) =>
        username ? { username, password } : undefined,
      );
  }

  async deleteKeysMatching(pattern: string): Promise<void> {
    await this.redisClient.deleteMatching(pattern);
  }
}
