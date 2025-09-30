import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onCreateWorkspace, onCreateChannel, activeView }) => {
  const { user } = useAuth();
  const {
    workspaces,
    currentWorkspace,
    channels,
    currentChannel,
    selectWorkspace,
    selectChannel,
  } = useWorkspace();

  const [showWorkspaces, setShowWorkspaces] = useState(false);

  return (
    <>
      {/* Workspace Header - ALWAYS AT TOP */}
      <div className="workspace-info">
        <div className="workspace-name">
          {currentWorkspace?.name || 'Slack Clone'}
        </div>
        <div className="workspace-user">
          {user?.display_name || user?.fullName || user?.username}
        </div>
      </div>

      {/* Channels Section */}
      {currentWorkspace && (
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <div className="sidebar-section-title">
              Channels
            </div>
            <button 
              className="sidebar-add-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onCreateChannel();
              }}
              title="Create channel"
            >
              +
            </button>
          </div>
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
                  onClick={() => selectChannel(channel)}
                >
                  {channel.name}
                  {channel.isPrivate && ' 🔒'}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Sidebar;

