import { v4 as uuid } from 'uuid';
import { SessionSocket } from '../types';
import { StorageService } from '../store';


const _syncSessionIfExists = async (
  socket: SessionSocket,
  next: (e?: any) => any,
  storageService: StorageService,
) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = await storageService.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
};

const _createSession = async (
  socket: SessionSocket,
  next: (e?: any) => any,
) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('invalid username'));
  }
  socket.userID = uuid();
  socket.sessionID = uuid();
  socket.username = username;
  next();
};

export const createSessionMiddleware = (
  storageService: StorageService,
) => async (socket: SessionSocket, next: (e: any) => any) => {
  await _syncSessionIfExists(socket, next, storageService);
  await _createSession(socket, next);
};
