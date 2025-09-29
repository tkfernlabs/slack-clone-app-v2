# Slack Clone Application

A full-stack real-time messaging application inspired by Slack, built with modern web technologies.

## 🌐 Live Application

**Frontend:** https://frontend-app-morphvm-q7b1njcb.http.cloud.morph.so
**Backend API:** https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using WebSocket (Socket.IO)
- **Workspaces**: Organize teams into separate workspaces
- **Channels**: Public and private channels for team communication
- **Direct Messages**: Private one-on-one conversations
- **Threaded Conversations**: Reply to specific messages in organized threads
- **Message Reactions**: Express reactions with emojis
- **User Presence**: Real-time online/offline status
- **Typing Indicators**: See when others are typing
- **User Authentication**: Secure JWT-based authentication
- **Search**: Find users and messages quickly

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **React Router DOM** - Client-side routing
- **Socket.IO Client** - Real-time WebSocket communication
- **Axios** - HTTP client for REST API calls
- **CSS3** - Modern styling with variables

### Backend
- **Node.js** & **Express.js** - Server framework
- **Socket.IO** - Real-time bidirectional communication
- **PostgreSQL (Neon)** - Serverless Postgres database
- **JWT** - Secure authentication
- **bcryptjs** - Password encryption

### Database
- **Neon PostgreSQL** - Modern serverless Postgres with branching
- Tables: users, workspaces, channels, messages, direct_messages, reactions

## 📡 API Documentation

**Backend URL:** https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so

**Health Check:**
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/health
```

See [Backend README](./backend/README.md) for complete API documentation.

## 🗂️ Project Structure

```
slack-clone-app-v2/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   ├── services/      # API & WebSocket services
│   │   └── App.jsx        # Main app component
│   ├── vite.config.js     # Vite configuration
│   └── README.md          # Frontend documentation
├── backend/                # Node.js backend API
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── README.md          # Backend documentation
└── README.md              # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (or Neon account)

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env file with:
VITE_API_URL=https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so
VITE_WS_URL=wss://backend-api-morphvm-q7b1njcb.http.cloud.morph.so
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be running on http://localhost:3000

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env file with:
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
PORT=3001
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

The backend will be running on http://localhost:3001

## 🔑 Environment Variables

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket server URL

### Backend
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## 📊 Database Schema

### Core Tables

**users**
- User accounts with authentication credentials
- Tracks online/offline status

**workspaces**
- Team/organization containers
- Can have multiple channels and members

**channels**
- Communication channels within workspaces
- Support public and private visibility

**messages**
- Channel messages with threading support
- Full message history and editing

**direct_messages**
- Private conversations between users

**reactions**
- Emoji reactions on messages

See the [Backend README](./backend/README.md) for detailed schema.

## 🔌 WebSocket Events

### Client Events
- `authenticate` - Socket authentication
- `join_channel` - Join channel room
- `send_message` - Send message
- `typing` - Typing indicator
- `send_direct_message` - Send DM

### Server Events
- `authenticated` - Auth success
- `new_message` - New message
- `user_typing` - Typing status
- `new_direct_message` - New DM
- `user_status` - Status update

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Application**: https://frontend-app-morphvm-q7b1njcb.http.cloud.morph.so
- **Backend API**: https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so
- **GitHub Repository**: https://github.com/tkfernlabs/slack-clone-app-v2
- **Database**: Neon PostgreSQL (Project: odd-mud-93487993)

## 👨‍💻 Development Status

- ✅ Frontend - Complete and deployed
- ✅ Backend API - Complete and deployed
- ✅ Database - Operational with schema
- ✅ Real-time WebSocket - Functional
- ✅ Authentication - JWT-based
- ✅ Full CRUD operations - All endpoints working

## 🎯 Quick Test

1. Visit https://frontend-app-morphvm-q7b1njcb.http.cloud.morph.so
2. Register a new account or use test credentials:
   - Username: `testuser`
   - Password: `password123`
3. Create a workspace
4. Create a channel
5. Start messaging!

---

Built with ❤️ using React, Node.js, Express, Socket.IO, and Neon PostgreSQL

