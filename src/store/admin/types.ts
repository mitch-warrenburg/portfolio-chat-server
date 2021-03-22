import { AdminUser } from '../../types';

export interface AdminRepository {
  deleteKeysMatching(pattern: string): Promise<Array<string> | undefined>;

  saveUser(username: string, password: string, secret: string): Promise<void>;

  findUser(username: string): Promise<AdminUser | undefined>;
}
