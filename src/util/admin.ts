import env from '../env';
import { StorageService } from '../store';
import { SessionSocket } from '../types';

const defaultAdminSession = {
  userId: env.adminUserId,
  username: env.adminUsername,
  sessionId: env.adminSessionId,
} as SessionSocket;

export const initAdminDefaultSession = async (
  storageService: StorageService,
) => {
  const session = await storageService.findSession(env.adminSessionId);

  console.log(session);

  if (!session) {
    await storageService.saveSession(defaultAdminSession, false, true);
  }
};
