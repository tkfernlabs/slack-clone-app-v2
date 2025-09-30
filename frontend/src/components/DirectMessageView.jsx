import React, { useState, useEffect, useRef } from 'react';
import { dmAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import Message from './Message';

const DirectMessageView = ({ otherUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (otherUser) {
      loadMessages();

      // Listen for new direct messages
      socketService.on('new_direct_message', handleNewDirectMessage);

      return () => {
        socketService.off('new_direct_message', handleNewDirectMessage);
      };
    }
  }, [otherUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await dmAPI.getMessages(otherUser.id);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load direct messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewDirectMessage = (message) => {
    console.log('Received new direct message via WebSocket:', message);
    
    // Only add if it's from or to the current conversation partner
    const isFromOtherUser = message.senderId === otherUser.id || message.sender_id === otherUser.id;
    const isToOtherUser = message.recipientId === otherUser.id || message.recipient_id === otherUser.id;
    
    if (isFromOtherUser || isToOtherUser) {
      setMessages((prev) => {
        // Check if message already exists
        if (prev.find(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    
    try {
      const response = await dmAPI.send({
        recipientId: otherUser.id,
        content: newMessage.trim()
      });
      
      console.log('Direct message sent successfully:', response.data);
      
      // Add message to local state immediately
      const sentMessage = {
        ...response.data,
        sender_id: user.id,
        recipient_id: otherUser.id,
        sender_username: user.username,
        sender_display_name: user.displayName || user.display_name
      };
      
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
      
      // Also broadcast via WebSocket for real-time delivery
      socketService.sendDirectMessage({
        recipientId: otherUser.id,
        content: newMessage.trim(),
        senderId: user.id,
        senderUsername: user.username
      });
      
    } catch (error) {
      console.error('Failed to send direct message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  if (!otherUser) {
    return (
      <div className="dm-view-empty">
        <p>Select a conversation or start a new direct message</p>
      </div>
    );
  }

  return (
    <div className="dm-view">
      <div className="dm-header">
        <div className="dm-header-avatar">
          {(otherUser.display_name || otherUser.username || '?').charAt(0).toUpperCase()}
        </div>
        <div className="dm-header-info">
          <h3>{otherUser.display_name || otherUser.username}</h3>
          <span className={`status-indicator ${otherUser.status || 'offline'}`}>
            {otherUser.status || 'offline'}
          </span>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>Start your conversation with {otherUser.display_name || otherUser.username}!</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={{
                ...message,
                // Map DM fields to Message component expected format
                user_id: message.sender_id,
                username: message.sender_username,
                display_name: message.sender_display_name,
                avatar_url: message.sender_avatar_url
              }}
              currentUser={user}
              onReaction={() => {}} // DMs don't support reactions yet
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <form onSubmit={handleSendMessage}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${otherUser.display_name || otherUser.username}`}
            disabled={sending}
            rows="1"
          />
          <button 
            type="submit" 
            className="btn-send"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectMessageView;

