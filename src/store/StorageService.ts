import { Redis } from 'ioredis';
import { groupBy } from 'lodash';
import RedisSessionRepository from './session/RedisSessionRepository';
import RedisMessageRepository from './messaging/RedisMessageRepository';
import { SessionSocket, Session, Message, SessionWithMessages } from '../types';

export default class StorageService {
  private messageRepository: RedisMessageRepository;
  private sessionRepository: RedisSessionRepository;

  constructor(redisClient: Redis) {
    this.messageRepository = new RedisMessageRepository(
      redisClient.duplicate(),
    );
    this.sessionRepository = new RedisSessionRepository(
      redisClient.duplicate(),
    );
  }

  async saveMessage(message: Message): Promise<void> {
    await this.messageRepository.saveMessage(message);
  }

  async findMessagesForUser(userId: string): Promise<Array<Message>> {
    return this.messageRepository.findMessagesForUser(userId);
  }

  async findSession(id: string): Promise<Session | undefined> {
    return this.sessionRepository.findSession(id);
  }

  async saveSession(socket: SessionSocket, connected: boolean) {
    await this.sessionRepository.saveSession(socket.sessionId, {
      connected,
      userId: socket.userId,
      username: socket.username,
    });
  }

  async getUserSessionsWithMessages(
    socket: SessionSocket,
  ): Promise<Array<SessionWithMessages>> {
    const [messages, sessions] = await Promise.all([
      this.findMessagesForUser(socket.userId),
      this.sessionRepository.findAllSessions(),
    ]);

    const messagesByUserSession = groupBy(messages, ({ from, to }) =>
      socket.userId === from ? to : from,
    );

    return sessions.map((session: Session) => ({
      userId: session.userId,
      username: session.username,
      connected: session.connected,
      messages: messagesByUserSession[session.userId] || [],
    }));
  }
}
