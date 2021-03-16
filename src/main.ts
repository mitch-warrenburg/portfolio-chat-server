import { Server } from 'socket.io';
import { createServer } from 'http';

const PORT = 9000;
const NEW_CHAT_MESSAGE_EVENT = 'newChatMessage';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  // Join a conversation
  const roomId = socket.handshake.query.roomId as string;
  socket.join(roomId);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // Leave the room if the user closes the socket
  socket.on('disconnect', () => {
    socket.leave(roomId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

//https://github.com/pixochi/socket.io-react-hooks-chat
