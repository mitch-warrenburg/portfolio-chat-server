import env from '../env';
import { v4 as uuid } from 'uuid';
import { SessionSocket } from '../types';
import { StorageService } from '../store';
import { authenticateAdmin } from '../auth';

const _handleAdminConnection = async (
  socket: SessionSocket,
  storageService: StorageService,
) => {
  const { adminPassword, username } = socket.handshake.auth;
  const isValid = await authenticateAdmin(
    storageService,
    username,
    adminPassword,
  );

  if (isValid) {
    socket.userId = env.adminUserId;
    socket.username = env.adminUsername;
    socket.sessionId = env.adminSessionId;
  }

  return isValid;
};

const _handleExistingConnection = async (
  socket: SessionSocket,
  storageService: StorageService,
) => {
  const { sessionId } = socket.handshake.auth;

  if (sessionId) {
    const session = await storageService.findSession(sessionId);
    if (session) {
      socket.sessionId = sessionId;
      socket.userId = session.userId;
      socket.username = session.username;
      return true;
    }
  }
  return false;
};

const _handleFirstConnection = (socket: SessionSocket, username: string) => {
  socket.userId = uuid();
  socket.sessionId = uuid();
  socket.username = username;
};

export const createSessionMiddleware = (
  storageService: StorageService,
) => async (socket: SessionSocket, next: (e?: any) => any) => {
  const { username } = socket.handshake.auth;

  if (!username) {
    return next(new Error('invalid username'));
  }

  if (await _handleAdminConnection(socket, storageService)) {
    return next();
  }

  if (await _handleExistingConnection(socket, storageService)) {
    return next();
  }

  _handleFirstConnection(socket, username);
  next();
};
