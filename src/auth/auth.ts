import { StorageService } from '../store';
import bcrypt from 'bcrypt';

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
