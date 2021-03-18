import { v4 as uuid } from 'uuid';
import { SessionSocket } from '../types';
import { StorageService } from '../store';


const _syncSessionIfExists = async (
  socket: SessionSocket,
  next: (e?: any) => any,
  storageService: StorageService,
) => {
  const { sessionId } = socket.handshake.auth;
  if (sessionId) {
    const session = await storageService.findSession(sessionId);
    if (session) {
      socket.sessionId = sessionId;
      socket.userId = session.userId;
      socket.username = session.username;
      return next();
    }
  }
};

const _createSession = async (
  socket: SessionSocket,
  next: (e?: any) => any,
) => {
  const { username } = socket.handshake.auth;
  if (!username) {
    return next(new Error('invalid username'));
  }
  socket.userId = uuid();
  socket.sessionId = uuid();
  socket.username = username;
  next();
};

export const createSessionMiddleware = (
  storageService: StorageService,
) => async (socket: SessionSocket, next: (e: any) => any) => {
  await _syncSessionIfExists(socket, next, storageService);
  await _createSession(socket, next);
};
