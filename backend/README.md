# Slack Clone Backend

A real-time messaging application backend built with Node.js, Express, Socket.IO, and PostgreSQL (Neon).

## Features

- **User Authentication**: Register and login with JWT tokens
- **Workspaces**: Create and manage multiple workspaces
- **Channels**: Public and private channels within workspaces
- **Real-time Messaging**: Socket.IO for instant message delivery
- **Direct Messages**: One-on-one messaging between users
- **Threaded Conversations**: Reply to messages in threads
- **Reactions**: Add emoji reactions to messages
- **User Presence**: Online/offline status tracking
- **Typing Indicators**: See when others are typing
- **Message History**: Pagination support for loading older messages

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **PostgreSQL (Neon)** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:id` - Get user by ID

### Workspaces
- `GET /api/workspaces` - Get all user workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get workspace details
- `GET /api/workspaces/:id/members` - Get workspace members
- `POST /api/workspaces/:id/invite` - Invite user to workspace

### Channels
- `GET /api/channels/workspace/:workspaceId` - Get all channels in workspace
- `POST /api/channels` - Create new channel
- `GET /api/channels/:id` - Get channel details
- `POST /api/channels/:id/join` - Join a channel
- `POST /api/channels/:id/leave` - Leave a channel
- `GET /api/channels/:id/members` - Get channel members

### Messages
- `GET /api/messages/channel/:channelId` - Get channel messages
- `POST /api/messages` - Send a message
- `GET /api/messages/thread/:messageId` - Get thread messages
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/reactions` - Add reaction
- `DELETE /api/messages/:id/reactions/:emoji` - Remove reaction
- `GET /api/messages/:id/reactions` - Get message reactions

### Direct Messages
- `GET /api/direct-messages/conversations` - Get all DM conversations
- `GET /api/direct-messages/user/:userId` - Get DMs with specific user
- `POST /api/direct-messages` - Send direct message
- `PUT /api/direct-messages/:id` - Update direct message
- `DELETE /api/direct-messages/:id` - Delete direct message

## Socket.IO Events

### Client to Server
- `authenticate` - Authenticate socket connection with JWT token
- `join_channel` - Join a channel room
- `leave_channel` - Leave a channel room
- `send_message` - Send a message to channel
- `typing` - Indicate typing in channel
- `stop_typing` - Stop typing indicator
- `send_direct_message` - Send direct message

### Server to Client
- `authenticated` - Authentication successful
- `authentication_error` - Authentication failed
- `new_message` - New message received
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `new_direct_message` - New direct message received
- `user_status` - User status changed (online/offline)

## Database Schema

### Tables
- `users` - User accounts
- `workspaces` - Workspace/team containers
- `workspace_members` - User membership in workspaces
- `channels` - Communication channels
- `channel_members` - User membership in channels
- `messages` - Channel messages with threading support
- `direct_messages` - Private messages between users
- `reactions` - Emoji reactions on messages

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
```

## Installation & Setup

```bash
# Install dependencies
npm install

# Start server
npm start
```

## API Base URL

**Production:** https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so

## Testing

Test the API health:
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Slack Clone API is running"
}
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── channels.js          # Channel routes
│   ├── directMessages.js    # Direct message routes
│   ├── messages.js          # Message routes
│   ├── users.js             # User routes
│   └── workspaces.js        # Workspace routes
├── .env                     # Environment variables
├── package.json
├── server.js                # Main server file
└── README.md
```

## License

MIT

