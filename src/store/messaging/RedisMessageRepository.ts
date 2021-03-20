import { Redis } from 'ioredis';
import { MessageRepository } from './types';
import { ChatMessage } from '../../types';
import { CONVERSATION_TTL } from '../../constants';

export default class RedisMessageRepository implements MessageRepository {
  private redisClient: Redis;

  constructor(redisClient) {
    this.redisClient = redisClient;
  }

  async saveMessage(message): Promise<void> {
    const value = JSON.stringify(message);
    await this.redisClient
      .multi()
      .rpush(`messages:${message.from}`, value)
      .rpush(`messages:${message.to}`, value)
      .expire(`messages:${message.from}`, CONVERSATION_TTL)
      .expire(`messages:${message.to}`, CONVERSATION_TTL)
      .exec();
  }

  async findMessagesForUser(userId: string): Promise<Array<ChatMessage>> {
    return await this.redisClient
      .lrange(`messages:${userId}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result));
      });
  }
}
