import { Socket } from 'socket.io';

export interface SessionSocket extends Socket {
  userID: string;
  sessionID: string;
  username: string;
}

export interface Message {
  to: string;
  from: string;
  content: string;
}

export interface Session {
  userID: string;
  username: string;
  connected: boolean;
}

export interface SessionWithMessages extends Session {
  userID: string;
  username: string;
  connected: boolean;
  messages: Array<Message>;
}
