import env from '../env';
import { v4 as uuid } from 'uuid';
import { SessionSocket } from '../types';
import { StorageService } from '../store';
import { verifyAdminJwt } from '../auth';
import { TokenAuthError } from '../errors';

const _isAdminUser = (socket: SessionSocket) => {
  return socket.handshake.auth.userId === env.adminUserId;
};

const _handleAdminConnection = async (
  socket: SessionSocket,
  storageService: StorageService,
) => {
  if (await verifyAdminJwt(socket, storageService)) {
    socket.userId = env.adminUserId;
    socket.username = env.adminUsername;
    socket.sessionId = env.adminSessionId;
  } else {
    throw new Error('Invalid token.');
  }
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
    return next(new Error('Invalid username.'));
  }

  if (_isAdminUser(socket)) {
    try {
      await _handleAdminConnection(socket, storageService);
      return next();
    } catch (e) {
      console.error(e);
      return next(new TokenAuthError());
    }
  }

  if (await _handleExistingConnection(socket, storageService)) {
    return next();
  }

  _handleFirstConnection(socket, username);
  next();
};
