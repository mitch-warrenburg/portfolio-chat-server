import { Socket } from 'socket.io';
import { Redis, RedisOptions } from 'ioredis';

export interface AdminUser {
  password: string;
  username: string;
  secret: string;
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

export interface TypingEvent {
  to: string;
  from: string;
  typing: boolean;
}

export interface Session {
  id: string;
  userId: string;
  username: string;
  connected: boolean;
  eternal?: boolean;
}

export interface User {
  userId: string;
  username: string;
  connected: boolean;
  messages: Array<ChatMessage>;
}

export interface Environment {
  wsPort: number;
  httpPort: number;
  redisHost: string;
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

  duplicate(): RedisExtended;

  deleteMatching(pattern: string): Promise<Array<string> | undefined>;
}

export type ChatEventType =
  | 'NEW_SESSION'
  | 'USER_SESSIONS'
  | 'TYPING_STATUS'
  | 'USER_CONNECTED'
  | 'PRIVATE_MESSAGE'
  | 'SOCKET_CONNECTED'
  | 'USER_DISCONNECTED'
  | 'SOCKET_DISCONNECTED'
  | 'connection'
  | 'disconnect';
