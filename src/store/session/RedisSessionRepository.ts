import { SessionRepository } from './types';
import { SESSION_TTL } from '../../constants';
import { Session, RedisExtended } from '../../types';

const mapSession = ([id, userId, username, connected, eternal]):
  | Session
  | undefined => {
  return userId
    ? {
        id,
        userId,
        username,
        connected: connected === 'true',
        eternal: eternal === 'true',
      }
    : undefined;
};

export default class RedisSessionRepository implements SessionRepository {
  private redisClient: RedisExtended;

  constructor(redisClient: RedisExtended) {
    this.redisClient = redisClient;
  }

  async findSession(id: string): Promise<Session> {
    return this.redisClient
      .hmget(
        `session:${id}`,
        'id',
        'userId',
        'username',
        'connected',
        'eternal',
      )
      .then(mapSession);
  }

  async saveSession(session: Session): Promise<Session> {
    const { id, userId, username, connected, eternal = false } = session;

    const command = await this.redisClient
      .multi()
      .hset(
        `session:${id}`,
        'id',
        id,
        'userId',
        userId,
        'username',
        username,
        'connected',
        `${connected}`,
        'eternal',
        `${eternal}`,
      );

    eternal
      ? await command.exec()
      : await command.expire(`session:${id}`, SESSION_TTL).exec();

    return session;
  }

  async findAllSessions(): Promise<Array<Session>> {
    const keys = new Set();
    let nextIndex = 0;

    do {
      const [nextIndexAsStr, results] = await this.redisClient.scan(
        nextIndex,
        'MATCH',
        'session:*',
        'COUNT',
        100,
      );

      nextIndex = parseInt(nextIndexAsStr, 10);
      results.forEach((s) => keys.add(s));
    } while (nextIndex !== 0);

    const commands = [];
    keys.forEach((key) => {
      commands.push(['hmget', key, 'id', 'userId', 'username', 'connected', 'eternal']);
    });

    return await this.redisClient
      .multi(commands)
      .exec()
      .then((results) =>
        results
          .map(([err, session]) => (err ? undefined : mapSession(session)))
          .filter((v) => !!v),
      );
  }

  async deleteKeysMatching(
    pattern: string,
  ): Promise<Array<string> | undefined> {
    return await this.redisClient.deleteMatching(pattern);
  }
}
