import bcrypt from 'bcrypt';
import env from '../env';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import StorageService from '../store';
import { SessionSocket } from '../types';

export default class AuthService {
  private readonly _storageService: StorageService;
  private readonly _defaultAdminSession = {
    userId: env.adminUserId,
    username: env.adminUsername,
    sessionId: env.adminSessionId,
  } as SessionSocket;

  constructor(storageService: StorageService) {
    this._storageService = storageService;
  }

  async authenticateAdmin(
    username?: string,
    password?: string,
  ): Promise<boolean> {
    if (!username || !password) {
      return false;
    }
    const user = await this._storageService.findAdminUser(username);
    return user ? await bcrypt.compare(password, user.password) : false;
  }

  async authenticateWsJwt(socket: SessionSocket): Promise<boolean> {
    const { token } = socket.handshake.auth;

    const admin = await this._getAdminUser();

    if (!admin) {
      throw new Error('No admin user found for the configured credentials.');
    }

    return jwt.verify(token, admin.secret) === env.adminUsername;
  }

  async authenticateHttpJwt(authHeader: string): Promise<boolean> {
    try {
      const token = authHeader.replace('bearer', ' ').trim();
      console.log(authHeader);
      console.log(token);

      const admin = await this._getAdminUser();
      return env.adminUsername === jwt.verify(token, admin.secret);
    } catch (e) {
      console.error(e.message);
      return false;
    }
  }

  async refreshAdminUser() {
    await this._storageService.deleteAllAdminUsers();
    await this._storageService.saveAdminUser(
      env.adminUsername,
      env.adminPassword,
      uuid(),
    );
  }

  async refreshAdminDefaultSession() {
    const session = await this._storageService.findSession(env.adminSessionId);

    if (!session) {
      await this._storageService.saveSession(
        this._defaultAdminSession,
        false,
        true,
      );
    }
  }

  private async _getAdminUser() {
    const admin = await this._storageService.findAdminUser(env.adminUsername);

    if (!admin) {
      throw new Error('No admin user found for the configured credentials.');
    }

    return admin;
  }
}
