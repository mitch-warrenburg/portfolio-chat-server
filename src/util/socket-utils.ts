import { USER_CONNECTED, USER_DISCONNECTED } from '../constants';
import { SessionSocket, SessionWithMessages } from '../types';

export const joinRoom = (socket: SessionSocket) => {
  return socket.join(socket.userID);
};

export const emitSessionDetails = ({
  userID,
  sessionID,
  emit,
}: SessionSocket) => {
  return emit('session', {
    userID,
    sessionID,
  });
};

export const emitUserSessionsWithMessages = (
  socket: SessionSocket,
  sessions: Array<SessionWithMessages>,
) => socket.emit('users', sessions);

export const broadcastUserSessionConnected = (socket: SessionSocket) => {
  return socket.broadcast.emit(USER_CONNECTED, {
    messages: [],
    connected: true,
    userID: socket.userID,
    username: socket.username,
  });
};

export const broadcastUserSessionDisconnected = (socket: SessionSocket) => {
  return socket.broadcast.emit(USER_DISCONNECTED, socket.userID);
};
