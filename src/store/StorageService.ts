import { groupBy } from 'lodash';
import { Redis } from 'ioredis';
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
    await this.sessionRepository.saveSession(socket.sessionID, {
      connected,
      userID: socket.userID,
      username: socket.username,
    });
  }

  async getUserSessionsWithMessages(
    socket: SessionSocket,
  ): Promise<Array<SessionWithMessages>> {
    const [messages, sessions] = await Promise.all([
      this.findMessagesForUser(socket.userID),
      this.sessionRepository.findAllSessions(),
    ]);

    const messagesByUserSession = groupBy(messages, ({ from, to }) =>
      socket.userID === from ? to : from,
    );

    return sessions.map((session: Session) => ({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      messages: messagesByUserSession[session.userID] || [],
    }));
  }
}
