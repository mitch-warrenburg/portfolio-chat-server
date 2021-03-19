import { Session } from '../../types';

export interface SessionRepository {
  findSession(id: string): Promise<Session | undefined>;

  saveSession(id: string, session: Session, eternal?: boolean): void;

  findAllSessions(): Promise<Array<Session>>;
}
