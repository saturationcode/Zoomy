import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import messagesRoutes from './routes/messages.js';
import usersRoutes from './routes/users.js';
import { verifyToken, decodeToken } from './middleware/auth.js';
import { db } from './db.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', credentials: true },
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/messages', verifyToken, messagesRoutes);
app.use('/api/users', verifyToken, usersRoutes);

// Socket.io auth
io.use((socket, next) => {
  try {
    socket.user = decodeToken(socket.handshake.auth.token);
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.user.id;
  onlineUsers.set(userId, socket.id);
  io.emit('users:online', Array.from(onlineUsers.keys()));

  socket.on('message:send', ({ receiverId, content }) => {
    if (!content?.trim()) return;

    const result = db.prepare(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)'
    ).run(userId, receiverId, content.trim());

    const message = db.prepare(`
      SELECT m.*, u.username AS sender_username
      FROM messages m JOIN users u ON u.id = m.sender_id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    socket.emit('message:new', message);
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('message:new', message);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('users:online', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Zoomy backend running on http://localhost:${PORT}`));
