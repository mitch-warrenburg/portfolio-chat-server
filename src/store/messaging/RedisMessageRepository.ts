import { MessageRepository } from './types';
import { CONVERSATION_TTL } from '../../constants';
import { ChatMessage, RedisExtended } from '../../types';

export default class RedisMessageRepository implements MessageRepository {
  private redisClient: RedisExtended;

  constructor(redisClient: RedisExtended) {
    this.redisClient = redisClient;
  }

  async saveMessage(message): Promise<ChatMessage> {
    const value = JSON.stringify(message);
    await this.redisClient
      .multi()
      .rpush(`messages:${message.from}`, value)
      .rpush(`messages:${message.to}`, value)
      .expire(`messages:${message.from}`, CONVERSATION_TTL)
      .expire(`messages:${message.to}`, CONVERSATION_TTL)
      .exec();
    return message;
  }

  async findMessagesForUser(uid: string): Promise<Array<ChatMessage>> {
    return await this.redisClient
      .lrange(`messages:${uid}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result));
      });
  }
}
