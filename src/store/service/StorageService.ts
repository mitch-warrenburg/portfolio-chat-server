import { Redis } from 'ioredis';
import { groupBy } from 'lodash';
import { RedisAdminRepository } from '../admin';
import RedisSessionRepository from '../session/RedisSessionRepository';
import RedisMessageRepository from '../messaging/RedisMessageRepository';
import {
  Session,
  ChatMessage,
  AdminUser,
  SessionSocket,
  User,
} from '../../types';

export default class StorageService {
  private readonly _adminRepository: RedisAdminRepository;
  private readonly _messageRepository: RedisMessageRepository;
  private readonly _sessionRepository: RedisSessionRepository;

  constructor(redisClient: Redis) {
    this._messageRepository = new RedisMessageRepository(
      redisClient.duplicate(),
    );
    this._sessionRepository = new RedisSessionRepository(
      redisClient.duplicate(),
    );
    this._adminRepository = new RedisAdminRepository(redisClient.duplicate());
  }

  get messageRepository(): RedisMessageRepository {
    return this._messageRepository;
  }

  get sessionRepository(): RedisSessionRepository {
    return this._sessionRepository;
  }

  get adminRepository(): RedisAdminRepository {
    return this._adminRepository;
  }

  async saveAdminUser(
    username: string,
    password: string,
    secret: string,
  ): Promise<void> {
    await this._adminRepository.saveUser(username, password, secret);
  }

  async findAdminUser(username: string): Promise<AdminUser | undefined> {
    return this._adminRepository.findUser(username);
  }

  async deleteAllAdminUsers(): Promise<void> {
    await this._adminRepository.deleteKeysMatching('admin:*');
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    await this._messageRepository.saveMessage(message);
  }

  async findMessagesForUser(userId: string): Promise<Array<ChatMessage>> {
    return this._messageRepository.findMessagesForUser(userId);
  }

  async findSession(id: string): Promise<Session | undefined> {
    return this._sessionRepository.findSession(id);
  }

  async saveSession(
    socket: SessionSocket,
    connected: boolean,
    eternal = false,
  ) {
    await this._sessionRepository.saveSession(
      socket.sessionId,
      {
        connected,
        userId: socket.userId,
        username: socket.username,
      },
      eternal,
    );
  }

  async getUserSessionsWithMessages(
    socket: SessionSocket,
  ): Promise<Array<User>> {
    const [messages, sessions] = await Promise.all([
      this.findMessagesForUser(socket.userId),
      this._sessionRepository.findAllSessions(),
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
