import { chain } from 'lodash';
import { groupBy } from 'lodash';
import { AxiosResponse } from 'axios';
import { client } from '../../server';
import RedisSessionRepository from '../session/RedisSessionRepository';
import RedisMessageRepository from '../messaging/RedisMessageRepository';
import {
  User,
  Session,
  ChatMessage,
  SessionSocket,
  RedisExtended,
  DefaultUserResponse,
} from '../../types';

export default class StorageService {
  private readonly _messageRepository: RedisMessageRepository;
  private readonly _sessionRepository: RedisSessionRepository;

  constructor(redisClient: RedisExtended) {
    this._messageRepository = new RedisMessageRepository(
      redisClient.duplicate(),
    );
    this._sessionRepository = new RedisSessionRepository(
      redisClient.duplicate(),
    );
  }

  async createDefaultSession(): Promise<Session> {
    const {
      data: { sessionId: id, uid, username },
    }: AxiosResponse<DefaultUserResponse> = await client.post(
      `/api/v1/admin/chat/login`,
    );
    const defaultSession: Session = {
      id,
      uid,
      username,
      eternal: true,
      connected: true,
    };
    await this.createSession(defaultSession);
    console.log('Created default admin session:\n', defaultSession);
    return defaultSession;
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

  async findMessagesForUser(uid: string): Promise<Array<ChatMessage>> {
    return this._messageRepository.findMessagesForUser(uid);
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
      uid: socket.uid,
      username: socket.username,
    });
  }

  async getUserSessionsWithMessages(
    socket: SessionSocket,
    adminSession: Session,
  ): Promise<Array<User>> {
    const [messages, sessions] = await Promise.all([
      this.findMessagesForUser(socket.uid),
      this._sessionRepository.findAllSessions(),
    ]);

    const messagesByUserSession = groupBy(messages, ({ from, to }) =>
      socket.uid === from ? to : from,
    );

    return chain(sessions)
      .filter(
        (session) =>
          socket.isAdmin ||
          [adminSession.uid, socket.uid].includes(session.uid),
      )
      .uniqBy('uid')
      .map((session: Session) => ({
        uid: session.uid,
        username: session.username,
        connected: session.connected,
        messages: messagesByUserSession[session.uid] || [],
      }))
      .value();
  }
}
