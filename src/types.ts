import { Socket } from 'socket.io';

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
