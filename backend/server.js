require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspaces');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const directMessageRoutes = require('./routes/directMessages');
const { authenticateSocket } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Make io available to all routes via middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/direct-messages', directMessageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Slack Clone API is running' });
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Authenticate socket connection
  socket.on('authenticate', async (token) => {
    try {
      const user = await authenticateSocket(token);
      if (user) {
        socket.userId = user.id;
        socket.username = user.username;
        connectedUsers.set(user.id, socket.id);
        
        // Join user-specific room for DM reactions and notifications
        socket.join(`user_${user.id}`);
        console.log(`User ${user.id} joined their user room: user_${user.id}`);
        
        socket.emit('authenticated', { userId: user.id, username: user.username });
        io.emit('user_status', { userId: user.id, status: 'online' });
      } else {
        socket.emit('authentication_error', 'Invalid token');
      }
    } catch (error) {
      socket.emit('authentication_error', error.message);
    }
  });

  // Join a channel room
  socket.on('join_channel', (channelId) => {
    socket.join(`channel_${channelId}`);
    console.log(`User ${socket.userId} joined channel ${channelId}`);
  });

  // Leave a channel room
  socket.on('leave_channel', (channelId) => {
    socket.leave(`channel_${channelId}`);
    console.log(`User ${socket.userId} left channel ${channelId}`);
  });

  // Send message to channel
  socket.on('send_message', (data) => {
    const { channelId, content, userId, username } = data;
    io.to(`channel_${channelId}`).emit('new_message', {
      channelId,
      content,
      userId,
      username,
      timestamp: new Date()
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { channelId, username } = data;
    socket.to(`channel_${channelId}`).emit('user_typing', { channelId, username });
  });

  // Stop typing indicator
  socket.on('stop_typing', (data) => {
    const { channelId, username } = data;
    socket.to(`channel_${channelId}`).emit('user_stop_typing', { channelId, username });
  });

  // Direct message
  socket.on('send_direct_message', (data) => {
    const { recipientId, content, senderId, senderUsername } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_direct_message', {
        senderId,
        senderUsername,
        content,
        timestamp: new Date()
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      io.emit('user_status', { userId: socket.userId, status: 'offline' });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, io };

