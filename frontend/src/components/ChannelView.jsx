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
      
      // Listen for new reactions
      socketService.on('new_reaction', handleNewReaction);

      return () => {
        socketService.off('new_message', handleNewMessage);
        socketService.off('new_reaction', handleNewReaction);
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
      // Backend returns array directly, not wrapped in messages property
      setMessages(Array.isArray(response.data) ? response.data : response.data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    console.log('Received new message via WebSocket:', message);
    
    // Support both camelCase (channelId) and snake_case (channel_id)
    const messageChannelId = message.channelId || message.channel_id;
    
    // Only add if it's for the current channel
    if (messageChannelId === channel.id) {
      setMessages((prev) => {
        // Check if message already exists
        if (prev.find(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    }
  };

  const handleNewReaction = (reactionData) => {
    console.log('Received new reaction via WebSocket:', reactionData);
    
    // Update the message with the new reactions
    setMessages((prev) => {
      return prev.map(msg => {
        if (msg.id === reactionData.messageId) {
          return {
            ...msg,
            reactions: reactionData.reactions
          };
        }
        return msg;
      });
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    
    try {
      // Send via API - backend will broadcast via WebSocket
      const response = await messageAPI.send(channel.id, { content: newMessage.trim() });
      
      console.log('Message sent successfully:', response.data);
      
      setNewMessage('');
      
      // Message will appear via WebSocket 'new_message' event
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
      const response = await messageAPI.addReaction(messageId, emoji);
      console.log('Reaction added successfully:', response.data);
      // No need to reload - the WebSocket event will update the UI
    } catch (error) {
      console.error('Failed to add reaction:', error);
      alert('Failed to add reaction. Please try again.');
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

