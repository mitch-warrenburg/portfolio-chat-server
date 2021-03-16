import { Redis } from 'ioredis';
import { Session } from '../../types';
import { SessionRepository } from './types';
import { SESSION_TTL } from '../../constants';

const mapSession = ([userID, username, connected]): Session | undefined => {
  return userID
    ? { userID, username, connected: connected === 'true' }
    : undefined;
};

export default class RedisSessionRepository implements SessionRepository {
  private redisClient: Redis;

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  async findSession(id: string): Promise<Session> {
    return this.redisClient
      .hmget(`session:${id}`, 'userID', 'username', 'connected')
      .then(mapSession);
  }

  async saveSession(id: string, { userID, username, connected }: Session) {
    await this.redisClient
      .multi()
      .hset(
        `session:${id}`,
        'userID',
        userID,
        'username',
        username,
        'connected',
        `${connected}`,
      )
      .expire(`session:${id}`, SESSION_TTL)
      .exec();
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
      commands.push(['hmget', key, 'userID', 'username', 'connected']);
    });

    return await this.redisClient
      .multi(commands)
      .exec()
      .then((results) => {
        return results
          .map(([err, session]) => (err ? undefined : mapSession(session)))
          .filter((v) => !!v);
      });
  }
}
