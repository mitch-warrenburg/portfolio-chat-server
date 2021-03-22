import { Session } from '../../types';
import { SessionRepository } from './types';

export default class MemorySessionRepository implements SessionRepository {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  async findSession(id: string): Promise<Session> {
    return this.sessions.get(id);
  }

  async saveSession(session: Session): Promise<Session> {
    this.sessions.set(session.id, session);
    return session;
  }

  async findAllSessions(): Promise<Array<Session>> {
    return [...this.sessions.values()];
  }

  async deleteKeysMatching(_: string): Promise<Array<string> | undefined> {
    return [];
  }
}
