import env from '../env';
import { StorageService } from '../store';
import { SessionSocket } from '../types';

const defaultAdminSession = {
  userId: env.adminUserId,
  username: env.adminUsername,
  sessionId: env.adminSessionId,
} as SessionSocket;

export const refreshAdminDefaultSession = async (
  storageService: StorageService,
) => {
  const session = await storageService.findSession(env.adminSessionId);

  if (!session) {
    await storageService.saveSession(defaultAdminSession, false, true);
  }
};
