import { Socket } from 'socket.io';
import { Redis, RedisOptions } from 'ioredis';

export interface User {
  password: string;
  username: string;
}

export interface SessionSocket extends Socket {
  userId: string;
  username: string;
  sessionId: string;
}

export interface ChatMessage {
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
  messages: Array<ChatMessage>;
}

export interface Environment {
  wsPort: number;
  httpPort: number;
  corsOrigins: string;
  corsMethods: string;
  adminUserId: string;
  adminUsername: string;
  adminPassword: string;
  adminSessionId: string;
}

export interface RedisExtended extends Redis {
  new (options?: RedisOptions): RedisExtended;

  new (port?: number, host?: string, options?: RedisOptions): RedisExtended;

  new (host?: string, options?: RedisOptions): RedisExtended;

  deleteMatching(pattern: string): Promise<void>;
}
