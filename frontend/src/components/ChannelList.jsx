import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

const ChannelList = ({ onSelectChannel }) => {
  const { channels, currentChannel, selectChannel } = useWorkspace();

  const handleChannelClick = (channel) => {
    selectChannel(channel);
    if (onSelectChannel) {
      onSelectChannel(channel);
    }
  };

  return (
    <ul className="channels-list">
      {channels.length === 0 ? (
        <li style={{padding: '6px 16px', paddingLeft: '32px', fontSize: '13px', opacity: '0.6'}}>
          No channels yet
        </li>
      ) : (
        channels.map((channel) => (
          <li
            key={channel.id}
            className={`channel-item ${currentChannel?.id === channel.id ? 'active' : ''}`}
            onClick={() => handleChannelClick(channel)}
          >
            {channel.name}
            {channel.isPrivate && ' 🔒'}
          </li>
        ))
      )}
      <li className="quick-link add-link" style={{paddingLeft: '32px'}}>
        <span className="quick-link-icon">+</span>
        <span>Add channels</span>
      </li>
    </ul>
  );
};

export default ChannelList;

