import { Socket } from 'socket.io';
import { Redis, RedisOptions } from 'ioredis';

export interface AdminUser {
  password: string;
  username: string;
}

export interface SessionSocket extends Socket {
  userId: string;
  sessionId: string;
  username: string;
}

export interface Message {
  to: string;
  from: string;
  content: string;
}

export interface Session {
  userId: string;
  username: string;
  connected: boolean;
}

export interface SessionWithMessages extends Session {
  userId: string;
  username: string;
  connected: boolean;
  messages: Array<Message>;
}

export interface RedisExtended extends Redis {
  new (options?: RedisOptions): RedisExtended;

  new (port?: number, host?: string, options?: RedisOptions): RedisExtended;

  new (host?: string, options?: RedisOptions): RedisExtended;

  deleteMatching(pattern: string): Promise<void>;
}
