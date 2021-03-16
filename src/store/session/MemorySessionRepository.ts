import { SessionRepository } from './types';
import { Session } from '../../types';

export default class MemorySessionRepository implements SessionRepository {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  async findSession(id: string): Promise<Session> {
    return this.sessions.get(id);
  }

  saveSession(id: string, session: Session) {
    this.sessions.set(id, session);
  }

  async findAllSessions(): Promise<Array<Session>> {
    return [...this.sessions.values()];
  }
}
