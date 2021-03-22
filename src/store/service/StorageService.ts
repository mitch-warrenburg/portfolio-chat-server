import { groupBy } from 'lodash';
import { RedisAdminRepository } from '../admin';
import RedisSessionRepository from '../session/RedisSessionRepository';
import RedisMessageRepository from '../messaging/RedisMessageRepository';
import {
  User,
  Session,
  AdminUser,
  ChatMessage,
  SessionSocket,
  RedisExtended,
} from '../../types';

export default class StorageService {
  private readonly _adminRepository: RedisAdminRepository;
  private readonly _messageRepository: RedisMessageRepository;
  private readonly _sessionRepository: RedisSessionRepository;

  constructor(redisClient: RedisExtended) {
    this._messageRepository = new RedisMessageRepository(
      redisClient.duplicate(),
    );
    this._sessionRepository = new RedisSessionRepository(
      redisClient.duplicate(),
    );
    this._adminRepository = new RedisAdminRepository(redisClient.duplicate());
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

  async deleteAllSessions(): Promise<Array<string> | undefined> {
    return await this._sessionRepository.deleteKeysMatching('session:*');
  }

  async findAllSessions(): Promise<Array<Session>> {
    return await this._sessionRepository.findAllSessions();
  }

  async createSession(session: Session): Promise<Session> {
    return this._sessionRepository.saveSession(session);
  }

  async deleteSession(sessionId: string): Promise<string | undefined> {
    const result = await this._sessionRepository.deleteKeysMatching(
      `session:${sessionId}`,
    );
    return result?.length ? result[0] : undefined;
  }

  async findSession(id: string): Promise<Session | undefined> {
    return this._sessionRepository.findSession(id);
  }

  async saveMessage(message: ChatMessage): Promise<ChatMessage> {
    return this._messageRepository.saveMessage(message);
  }

  async findMessagesForUser(userId: string): Promise<Array<ChatMessage>> {
    return this._messageRepository.findMessagesForUser(userId);
  }

  async saveSession(
    socket: SessionSocket,
    connected: boolean,
    eternal = false,
  ) {
    await this._sessionRepository.saveSession({
      eternal,
      connected,
      id: socket.sessionId,
      userId: socket.userId,
      username: socket.username,
    });
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
