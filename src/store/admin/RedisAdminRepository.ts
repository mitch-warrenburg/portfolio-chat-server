import bcrypt from 'bcrypt';
import { AdminRepository } from './types';
import { AdminUser, RedisExtended } from '../../types';

export default class RedisAdminRepository implements AdminRepository {
  private redisClient: RedisExtended;

  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  async saveUser(
    username: string,
    password: string,
    secret: string,
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.redisClient
      .multi()
      .hset(
        `admin:${username}`,
        'username',
        username,
        'password',
        hashedPassword,
        'secret',
        secret,
      )
      .exec();
  }

  async findUser(username: string): Promise<AdminUser | undefined> {
    return this.redisClient
      .hmget(`admin:${username}`, 'username', 'password', 'secret')
      .then(([username, password, secret]) =>
        username ? { username, password, secret } : undefined,
      );
  }

  async deleteKeysMatching(pattern: string): Promise<void> {
    await this.redisClient.deleteMatching(pattern);
  }
}
