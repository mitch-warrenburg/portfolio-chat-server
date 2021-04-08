import { v4 as uuid } from 'uuid';
import AuthService from '../auth';
import StorageService from '../store';
import { SessionSocket, AuthenticatedUser, Session } from '../types';

const _handleFirstConnection = (
  socket: SessionSocket,
  user: AuthenticatedUser,
  adminSession: Session,
) => {
  socket.uid = user.uid;
  socket.username = user.username;
  socket.sessionId = user.isAdmin ? adminSession.id : uuid();
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
      socket.uid = session.uid;
      socket.username = session.username;
      return true;
    }
  }
  return false;
};

export const createSessionMiddleware = (
  adminSession: Session,
  authService: AuthService,
  storageService: StorageService,
) => async (socket: SessionSocket, next: (e?: any) => any) => {
  const { uid, adminToken } = socket.handshake.auth;

  if (!uid) {
    return next(new Error('invalid user'));
  }

  const firebaseUser = await authService.authenticateSession(
    socket.request.headers.cookie, adminToken
  );

  if (!firebaseUser) {
    return next(new Error('authentication failed'));
  }

  const user = await authService.getUser(uid);

  if (!user) {
    return next(new Error('invalid user'));
  }

  if (await _handleExistingConnection(socket, storageService)) {
    return next();
  }

  _handleFirstConnection(socket, user, adminSession);
  next();
};
