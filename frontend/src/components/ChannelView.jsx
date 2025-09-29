import React, { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import Message from './Message';

const ChannelView = ({ channel }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (channel) {
      loadMessages();
      socketService.joinChannel(channel.id);

      // Listen for new messages
      socketService.on('new_message', handleNewMessage);

      return () => {
        socketService.off('new_message', handleNewMessage);
        socketService.leaveChannel(channel.id);
      };
    }
  }, [channel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getMessages(channel.id);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    // Only add if it's for the current channel
    if (message.channelId === channel.id) {
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
      // Send via WebSocket for real-time delivery
      socketService.sendMessage(channel.id, newMessage.trim());
      
      // Also send via API for persistence
      await messageAPI.send(channel.id, { content: newMessage.trim() });
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
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

  const handleTyping = () => {
    socketService.typing(channel.id);
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      await messageAPI.addReaction(messageId, emoji);
      // Reload messages to get updated reactions
      loadMessages();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="channel-view">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              currentUser={user}
              onReaction={handleReaction}
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
            onKeyDown={handleTyping}
            placeholder={`Message #${channel.name}`}
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

export default ChannelView;

