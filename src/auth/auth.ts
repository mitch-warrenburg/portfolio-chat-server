import env from '../env';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { SessionSocket } from '../types';
import { StorageService } from '../store';

export const authenticateAdmin = async (
  storageService: StorageService,
  username?: string,
  password?: string,
): Promise<boolean> => {
  if (!username || !password) {
    return false;
  }
  const user = await storageService.findAdminUser(username);
  return user ? await bcrypt.compare(password, user.password) : false;
};

export const verifyAdminJwt = async (
  socket: SessionSocket,
  storageService: StorageService,
): Promise<boolean> => {
  const { token } = socket.handshake.auth;

  if (!token) {
    throw new Error('A token is required to authenticate an admin connection.');
  }

  const admin = await storageService.findAdminUser(env.adminUsername);

  if (!admin) {
    throw new Error('No admin user found for the configured credentials.');
  }

  return jwt.verify(token, admin.secret) === env.adminUsername;
};

export const refreshAdminUser = async (storageService: StorageService) => {
  await storageService.deleteAllAdminUsers();
  await storageService.saveAdminUser(
    env.adminUsername,
    env.adminPassword,
    uuid(),
  );
};
