import React, { useState } from 'react';

const Message = ({ message, currentUser, onReaction }) => {
  const [showReactions, setShowReactions] = useState(false);
  const isOwnMessage = message.userId === currentUser?.id;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const commonEmojis = ['👍', '❤️', '😊', '🎉', '🚀', '👀'];

  const handleEmojiClick = (emoji) => {
    onReaction(message.id, emoji);
    setShowReactions(false);
  };

  return (
    <div className={`message ${isOwnMessage ? 'own-message' : ''}`}>
      <div className="message-avatar">
        {message.user?.fullName?.charAt(0).toUpperCase() || 
         message.user?.username?.charAt(0).toUpperCase() || '?'}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">
            {message.user?.fullName || message.user?.username || 'Unknown User'}
          </span>
          <span className="message-time">{formatTime(message.createdAt)}</span>
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

