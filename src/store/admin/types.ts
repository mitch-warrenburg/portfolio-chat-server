import { User } from '../../types';

export interface AdminRepository {
  deleteKeysMatching(pattern: string): Promise<void>;

  saveUser(username: string, password: string): Promise<void>;

  findUser(username: string): Promise<User | undefined>;
}
