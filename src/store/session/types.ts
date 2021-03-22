import { Session } from '../../types';

export interface SessionRepository {
  findSession(id: string): Promise<Session | undefined>;

  saveSession(session: Session, eternal?: boolean): Promise<Session>;

  findAllSessions(): Promise<Array<Session>>;

  deleteKeysMatching(pattern: string): Promise<Array<string> | undefined>;
}
