import React, { useState } from 'react';

const MessageNew = ({ message, currentUser, onReaction }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messageUserId = message.userId || message.user_id;
  const isOwnMessage = messageUserId === currentUser?.id;

  const formatTime = (timestamp) => {
    const timeValue = timestamp || message.created_at || message.createdAt;
    if (!timeValue) return 'Just now';
    
    try {
      const date = new Date(timeValue);
      if (isNaN(date.getTime())) return 'Just now';
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Just now';
    }
  };

  const commonEmojis = ['👍', '❤️', '😊', '🎉', '🚀', '👀'];

  const handleEmojiClick = (emoji) => {
    if (onReaction) {
      onReaction(message.id, emoji);
    }
    setShowEmojiPicker(false);
  };

  const getUserDisplayName = () => {
    if (message.user?.fullName) return message.user.fullName;
    if (message.user?.display_name) return message.user.display_name;
    if (message.user?.username) return message.user.username;
    if (message.display_name) return message.display_name;
    if (message.username) return message.username;
    return 'Unknown User';
  };

  const getUserInitial = () => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <div className={`message ${isOwnMessage ? 'own-message' : ''}`} style={{position: 'relative'}}>
      <div className="message-avatar">
        {getUserInitial()}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">{getUserDisplayName()}</span>
          <span className="message-time">{formatTime()}</span>
        </div>
        <div className="message-text">{message.content}</div>
        
        {/* Display existing reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="message-reactions" style={{marginTop: '8px', display: 'flex', gap: '4px'}}>
            {message.reactions.map((reaction, index) => (
              <span 
                key={index} 
                className="reaction"
                style={{
                  background: '#f0f0f0',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {reaction.emoji} {reaction.count || 1}
              </span>
            ))}
          </div>
        )}

        {/* ALWAYS VISIBLE EMOJI BUTTON */}
        <div style={{marginTop: '8px', position: 'relative'}}>
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              background: '#f8f8f8',
              border: '1px solid #ddd',
              borderRadius: '16px',
              padding: '4px 12px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Add reaction"
          >
            😊 <span style={{fontSize: '12px'}}>React</span>
          </button>
          
          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '4px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000
            }}>
              {commonEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEmojiClick(emoji)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#f0f0f0'}
                  onMouseOut={(e) => e.target.style.background = 'none'}
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

export default MessageNew;

