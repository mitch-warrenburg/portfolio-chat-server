import { StorageService } from '../store';
import { PRIVATE_MESSAGE } from '../constants';
import { SessionSocket, Message } from '../types';

export const handlePrivateMessage = (
  socket: SessionSocket,
  storageService: StorageService,
) => {
  socket.on(PRIVATE_MESSAGE, async ({ content, to }) => {
    const message: Message = { to, content, from: socket.userID };

    socket.to(to).to(socket.userID).emit(PRIVATE_MESSAGE, message);

    await storageService.saveMessage(message);
  });
};
