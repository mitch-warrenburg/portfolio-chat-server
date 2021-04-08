import cookie from 'cookie';
import { client } from '../server';
import { Response } from 'express';
import firebase from 'firebase-admin';
import { AxiosResponse } from 'axios';
import { SESSION_COOKIE_NAME } from '../constants';
import { UserResponse, AuthenticatedUser } from '../types';

export default class AuthService {
  private readonly _auth = firebase.auth();

  async getUser(uid: string): Promise<AuthenticatedUser | null> {
    try {
      const { data: user }: AxiosResponse<UserResponse> = await client.get(
        `/api/v1/admin/users/${uid}`,
      );
      return {
        ...user,
        isAdmin: user.roles.some((role) => role === 'ROLE_ADMIN'),
      };
    } catch (e) {
      console.error(e.message);
      return null;
    }
  }

  async authenticateSession(
    cookieString: string,
    adminToken?: string,
  ): Promise<firebase.auth.UserRecord | null> {
    try {
      const cookies = cookie.parse(cookieString || '') || {};
      const sessionCookie = cookies[SESSION_COOKIE_NAME];
      const token = adminToken
        ? await this._auth.verifyIdToken(adminToken)
        : await this._auth.verifySessionCookie(sessionCookie);

      return await this._auth.getUser(token.uid);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async authenticateHttpRequest(
    cookieString: string,
    response: Response,
    requiresAdmin: boolean,
  ) {
    const userRecord = await this.authenticateSession(cookieString);

    if (!userRecord) {
      response.sendStatus(401);
      return null;
    }
    const user = await this.getUser(userRecord.uid);

    if (!user) {
      response.sendStatus(401);
      return null;
    }

    if (!requiresAdmin) {
      return user;
    }

    if (user.roles.some((role) => role === 'ROLE_ADMIN')) {
      return user;
    }

    return null;
  }
}
