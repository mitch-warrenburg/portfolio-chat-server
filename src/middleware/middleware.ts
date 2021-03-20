import env from '../env';
import { v4 as uuid } from 'uuid';
import AuthService from '../auth';
import StorageService from '../store';
import { SessionSocket } from '../types';
import { TokenAuthError } from '../errors';

const _isAdminUser = (socket: SessionSocket) => {
  return socket.handshake.auth.userId === env.adminUserId;
};

const _handleAdminConnection = async (
  socket: SessionSocket,
  authService: AuthService,
) => {
  if (await authService.authenticateWsJwt(socket)) {
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
  authService: AuthService,
  storageService: StorageService,
) => async (socket: SessionSocket, next: (e?: any) => any) => {
  const { username } = socket.handshake.auth;

  if (!username) {
    return next(new Error('Invalid Username'));
  }

  if (_isAdminUser(socket)) {
    try {
      await _handleAdminConnection(socket, authService);
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
