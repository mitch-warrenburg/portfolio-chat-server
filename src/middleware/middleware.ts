import { v4 as uuid } from 'uuid';
import { SessionSocket } from '../types';
import { StorageService } from '../store';

export const createSessionMiddleware = (
  storageService: StorageService,
) => async (socket: SessionSocket, next: (e?: any) => any) => {
  const { sessionId, username } = socket.handshake.auth;

  if (sessionId) {
    const session = await storageService.findSession(sessionId);
    if (session) {
      socket.sessionId = sessionId;
      socket.userId = session.userId;
      socket.username = session.username;
      return next();
    }
  }
  if (!username) {
    return next(new Error('invalid username'));
  }

  socket.userId = uuid();
  socket.sessionId = uuid();
  socket.username = username;
  next();
};
