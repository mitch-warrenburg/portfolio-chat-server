import { Socket } from 'socket.io';
import { Redis, RedisOptions } from 'ioredis';

export interface AdminUser {
  password: string;
  username: string;
  secret: string;
}

export interface SessionSocket extends Socket {
  uid: string;
  isAdmin: boolean;
  username: string;
  sessionId: string;
}

export type PrincipalRole =
  | 'ROLE_USER'
  | 'ROLE_ADMIN'
  | 'ROLE_SYSTEM'
  | 'ROLE_ANONYMOUS';

export interface UserResponse {
  uid: string;
  username: string;
  roles: Array<PrincipalRole>;
}

export interface DefaultUserResponse {
  uid: string;
  username: string;
  sessionId: string;
}

export interface AuthenticatedUser {
  uid: string;
  isAdmin: boolean;
  username: string;
  roles: Array<PrincipalRole>;
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
  uid: string;
  username: string;
  connected: boolean;
  eternal?: boolean;
}

export interface User {
  uid: string;
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
  authServerUrl: string;
  authServerUser: string;
  authServerPassword: string;
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
