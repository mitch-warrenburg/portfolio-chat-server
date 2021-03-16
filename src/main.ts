import morgan from 'morgan';
import express from 'express';
import { Server } from 'socket.io';
import connect from 'connect-redis';
import { createServer } from 'http';
import { RedisClient } from 'redis';
import session from 'express-session';
import { createAdapter } from 'socket.io-redis';

const PORT = 9000;
const NEW_CHAT_MESSAGE_EVENT = 'newChatMessage';

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

const app = express();
const RedisStore = connect(session);
const redisClient = new RedisClient({ host: 'localhost', port: 6379 });
const subClient = redisClient.duplicate();
const pubClient = redisClient.duplicate();
const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: '*' } });

io.use(wrap(session({ secret: 'cats' })));
io.adapter(createAdapter({ pubClient, subClient }));
io.adapter(createAdapter({ pubClient, subClient }));

io.on('connection', (socket) => {
  // Join a conversation
  const roomId = socket.handshake.query.roomId as string;
  socket.join(roomId);

  //@ts-ignore
  console.log(socket.request.session);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // Leave the room if the user closes the socket
  socket.on('disconnect', () => {
    socket.leave(roomId);
  });
});


// @ts-ignore
morgan.token('sessionid', (req) => req.sessionID);

// @ts-ignore
morgan.token('user', req => req.session.user);

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :user :sessionid'));

app.get('/', (_, res) => {
  res.send('Hitarth is a fat moron.');
});

app.use(
  session({
    secret: 'veryimportantsecret',
    resave: false,
    name: 'secret',
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: true,
      maxAge: 600000,
    },
    store: new RedisStore({ client: redisClient, ttl: 86400 }),
  }),
);


httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

//https://github.com/pixochi/socket.io-react-hooks-chat
