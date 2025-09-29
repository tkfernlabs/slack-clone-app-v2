# API Examples and Testing

This document provides example curl commands to test all API endpoints.

## Base URL
```
https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so
```

## 1. Authentication

### Register a new user
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123",
    "displayName": "John Doe"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe"
  }
}
```

### Login
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

## 2. User Operations

### Get current user profile
```bash
TOKEN="your_jwt_token_here"
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Update user profile
```bash
curl -X PUT https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "displayName": "John Updated",
    "status": "online"
  }'
```

### Search users
```bash
curl "https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/users/search?q=john" \
  -H "Authorization: Bearer $TOKEN"
```

## 3. Workspaces

### Create a workspace
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My Team Workspace",
    "slug": "my-team"
  }'
```

**Response:**
```json
{
  "workspace": {
    "id": 1,
    "name": "My Team Workspace",
    "slug": "my-team",
    "created_by": 1,
    "created_at": "2025-09-29T22:00:00.000Z"
  },
  "defaultChannel": {
    "id": 1,
    "name": "general",
    "description": "General discussion channel"
  }
}
```

### Get all workspaces
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/workspaces \
  -H "Authorization: Bearer $TOKEN"
```

### Get workspace members
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/workspaces/1/members \
  -H "Authorization: Bearer $TOKEN"
```

### Invite user to workspace
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/workspaces/1/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": 2
  }'
```

## 4. Channels

### Get all channels in workspace
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/channels/workspace/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Create a channel
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/channels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workspaceId": 1,
    "name": "random",
    "description": "Random discussions",
    "isPrivate": false
  }'
```

### Join a channel
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/channels/2/join \
  -H "Authorization: Bearer $TOKEN"
```

### Get channel members
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/channels/1/members \
  -H "Authorization: Bearer $TOKEN"
```

## 5. Messages

### Send a message
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channelId": 1,
    "content": "Hello everyone! 👋"
  }'
```

### Get channel messages
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/channel/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Get messages with pagination
```bash
curl "https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/channel/1?limit=20&before=100" \
  -H "Authorization: Bearer $TOKEN"
```

### Send a threaded reply
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channelId": 1,
    "content": "This is a reply!",
    "threadId": 1
  }'
```

### Get thread messages
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/thread/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update a message
```bash
curl -X PUT https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Updated message content"
  }'
```

### Delete a message
```bash
curl -X DELETE https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Add a reaction
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/1/reactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "emoji": "👍"
  }'
```

### Get message reactions
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/1/reactions \
  -H "Authorization: Bearer $TOKEN"
```

### Remove a reaction
```bash
curl -X DELETE "https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/1/reactions/👍" \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Direct Messages

### Get all DM conversations
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/direct-messages/conversations \
  -H "Authorization: Bearer $TOKEN"
```

### Get DMs with a specific user
```bash
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/direct-messages/user/2 \
  -H "Authorization: Bearer $TOKEN"
```

### Send a direct message
```bash
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/direct-messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recipientId": 2,
    "content": "Hey! How are you?"
  }'
```

### Update a direct message
```bash
curl -X PUT https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/direct-messages/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Updated DM content"
  }'
```

### Delete a direct message
```bash
curl -X DELETE https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/direct-messages/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 7. WebSocket Connection

### JavaScript Client Example
```javascript
const io = require('socket.io-client');

const socket = io('https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so');

// Authenticate
const token = 'your_jwt_token_here';
socket.emit('authenticate', token);

// Listen for authentication success
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
  
  // Join a channel
  socket.emit('join_channel', 1);
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Send a message
socket.emit('send_message', {
  channelId: 1,
  content: 'Hello from WebSocket!',
  userId: 1,
  username: 'johndoe'
});

// Typing indicator
socket.emit('typing', {
  channelId: 1,
  username: 'johndoe'
});

// Stop typing
socket.emit('stop_typing', {
  channelId: 1,
  username: 'johndoe'
});

// Listen for typing indicators
socket.on('user_typing', (data) => {
  console.log(`${data.username} is typing in channel ${data.channelId}`);
});

// Listen for user status changes
socket.on('user_status', (data) => {
  console.log(`User ${data.userId} is now ${data.status}`);
});

// Send direct message via WebSocket
socket.emit('send_direct_message', {
  recipientId: 2,
  content: 'Private message',
  senderId: 1,
  senderUsername: 'johndoe'
});

// Listen for direct messages
socket.on('new_direct_message', (message) => {
  console.log('New DM:', message);
});
```

## Testing Flow

### Complete workflow test:

```bash
# 1. Register a user
RESPONSE=$(curl -s -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123","displayName":"Test User"}')

# Extract token
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 2. Create a workspace
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Workspace","slug":"test-workspace"}'

# 3. Send a message
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"channelId":1,"content":"Hello World!"}'

# 4. Get messages
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/channel/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Not a member of this channel"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Server Error
```json
{
  "error": "Server error"
}
```

