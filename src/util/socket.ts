import { SessionSocket, SessionWithMessages } from '../types';
import {
  NEW_SESSION,
  USER_SESSIONS,
  USER_CONNECTED,
  USER_DISCONNECTED,
} from '../constants';

export const joinRoom = (socket: SessionSocket) => {
  return socket.join(socket.userId);
};

export const emitNewSessionDetails = (socket: SessionSocket) => {
  const { userId, sessionId } = socket;
  return socket.emit(NEW_SESSION, { userId, sessionId });
};

export const emitUserSessionsWithMessages = (
  socket: SessionSocket,
  sessions: Array<SessionWithMessages>,
) => socket.emit(USER_SESSIONS, sessions);

export const broadcastUserSessionConnected = (socket: SessionSocket) => {
  const { userId, username } = socket;
  return socket.broadcast.emit(USER_CONNECTED, { userId, username });
};

export const broadcastUserSessionDisconnected = (socket: SessionSocket) => {
  const { userId } = socket;
  return socket.broadcast.emit(USER_DISCONNECTED, { userId });
};
