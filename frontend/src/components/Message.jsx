import React, { useState } from 'react';

const Message = ({ message, currentUser, onReaction }) => {
  const [showReactions, setShowReactions] = useState(false);
  
  // Support both camelCase (userId) and snake_case (user_id) from backend
  const messageUserId = message.userId || message.user_id;
  const isOwnMessage = messageUserId === currentUser?.id;

  const formatTime = (timestamp) => {
    // Support both camelCase (createdAt) and snake_case (created_at)
    const timeValue = timestamp || message.created_at || message.createdAt;
    
    if (!timeValue) {
      return 'Just now';
    }
    
    try {
      const date = new Date(timeValue);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Just now';
    }
  };

  const commonEmojis = ['👍', '❤️', '😊', '🎉', '🚀', '👀'];

  const handleEmojiClick = (emoji) => {
    onReaction(message.id, emoji);
    setShowReactions(false);
  };

  // Get user info - support both nested user object and flat structure
  const getUserDisplayName = () => {
    // First try nested user object (message.user)
    if (message.user?.fullName) return message.user.fullName;
    if (message.user?.display_name) return message.user.display_name;
    if (message.user?.username) return message.user.username;
    
    // Then try flat structure from backend
    if (message.display_name) return message.display_name;
    if (message.username) return message.username;
    
    return 'Unknown User';
  };

  const getUserInitial = () => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <div className={`message ${isOwnMessage ? 'own-message' : ''}`}>
      <div className="message-avatar">
        {getUserInitial()}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">
            {getUserDisplayName()}
          </span>
          <span className="message-time">{formatTime(message.created_at || message.createdAt)}</span>
        </div>
        <div className="message-text">{message.content}</div>
        
        {message.reactions && message.reactions.length > 0 && (
          <div className="message-reactions">
            {message.reactions.map((reaction, index) => (
              <span key={index} className="reaction">
                {reaction.emoji} {reaction.count || 1}
              </span>
            ))}
          </div>
        )}

        <div className="message-actions">
          <button 
            className="btn-reaction"
            onClick={() => setShowReactions(!showReactions)}
          >
            😊
          </button>
          
          {showReactions && (
            <div className="emoji-picker">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  className="emoji-option"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;

