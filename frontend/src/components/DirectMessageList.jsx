import React, { useState, useEffect } from 'react';
import { dmAPI, usersAPI } from '../services/api';

const DirectMessageList = ({ onSelectConversation, selectedUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await dmAPI.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setAllUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleNewDM = () => {
    if (allUsers.length === 0) {
      loadAllUsers();
    }
    setShowUserList(true);
  };

  const handleSelectUser = (user) => {
    onSelectConversation(user);
    setShowUserList(false);
    setSearchTerm('');
  };

  const filteredUsers = allUsers.filter(user => {
    const displayName = user.display_name || user.username || '';
    const username = user.username || '';
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    return message.length > 40 ? message.substring(0, 40) + '...' : message;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return <div className="dm-list-loading">Loading conversations...</div>;
  }

  return (
    <div className="dm-list">
      <div className="dm-list-header">
        <h3>Direct Messages</h3>
        <button className="btn-new-dm" onClick={handleNewDM} title="New Direct Message">
          +
        </button>
      </div>

      {showUserList && (
        <div className="user-list-modal">
          <div className="user-list-content">
            <div className="user-list-header">
              <h4>Start a conversation</h4>
              <button className="btn-close" onClick={() => setShowUserList(false)}>×</button>
            </div>
            <input
              type="text"
              className="user-search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="user-list-items">
              {filteredUsers.length === 0 ? (
                <div className="no-users">No users found</div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="user-list-item"
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="user-avatar">
                      {(user.display_name || user.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.display_name || user.username}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                    <span className={`status-dot ${user.status || 'offline'}`}></span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="dm-list-items">
        {conversations.length === 0 ? (
          <div className="dm-list-empty">
            <p>No conversations yet</p>
            <button className="btn-start-dm" onClick={handleNewDM}>
              Start a conversation
            </button>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.other_user_id}
              className={`dm-list-item ${selectedUserId === conv.other_user_id ? 'active' : ''}`}
              onClick={() => onSelectConversation({
                id: conv.other_user_id,
                username: conv.username,
                display_name: conv.display_name,
                avatar_url: conv.avatar_url,
                status: conv.status
              })}
            >
              <div className="dm-avatar">
                {(conv.display_name || conv.username || '?').charAt(0).toUpperCase()}
              </div>
              <div className="dm-info">
                <div className="dm-name">
                  {conv.display_name || conv.username}
                  <span className={`status-dot ${conv.status || 'offline'}`}></span>
                </div>
                <div className="dm-last-message">
                  {formatLastMessage(conv.last_message)}
                </div>
              </div>
              <div className="dm-time">
                {formatTime(conv.last_message_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DirectMessageList;

