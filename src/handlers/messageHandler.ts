import { StorageService } from '../store';
import { PRIVATE_MESSAGE } from '../constants';
import { SessionSocket, Message } from '../types';

export const handlePrivateMessage = (
  socket: SessionSocket,
  storageService: StorageService,
) => {
  socket.on(PRIVATE_MESSAGE, async ({ content, to }) => {
    const message: Message = { to, content, from: socket.userId };

    socket.in(to).emit(PRIVATE_MESSAGE, message);
    // socket.to(from).emit(PRIVATE_MESSAGE, message);

    await storageService.saveMessage(message);
  });
};
