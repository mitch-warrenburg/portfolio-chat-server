import { SessionSocket, User } from '../types';
import {
  NEW_SESSION,
  USER_SESSIONS,
  USER_CONNECTED,
  USER_DISCONNECTED,
} from '../constants';

export const joinRoom = (socket: SessionSocket) => {
  return socket.join(socket.uid);
};

export const emitNewSessionDetails = (socket: SessionSocket) => {
  const { uid, sessionId } = socket;
  return socket.emit(NEW_SESSION, { uid, sessionId });
};

export const emitUserSessionsWithMessages = (
  socket: SessionSocket,
  sessions: Array<User>,
) => socket.emit(USER_SESSIONS, sessions);

export const broadcastUserSessionConnected = (socket: SessionSocket) => {
  const { uid, username } = socket;
  return socket.broadcast.emit(USER_CONNECTED, { uid, username });
};

export const broadcastUserSessionDisconnected = (socket: SessionSocket) => {
  const { uid } = socket;
  return socket.broadcast.emit(USER_DISCONNECTED, { uid });
};
