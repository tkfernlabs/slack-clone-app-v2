import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

const Sidebar = ({ onCreateWorkspace, onCreateChannel }) => {
  const {
    workspaces,
    currentWorkspace,
    channels,
    currentChannel,
    selectWorkspace,
    selectChannel,
  } = useWorkspace();

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <h3>Workspaces</h3>
          <button 
            className="btn-icon" 
            onClick={onCreateWorkspace}
            title="Create workspace"
          >
            +
          </button>
        </div>
        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`workspace-item ${currentWorkspace?.id === workspace.id ? 'active' : ''}`}
              onClick={() => selectWorkspace(workspace)}
            >
              <div className="workspace-avatar">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <span className="workspace-name">{workspace.name}</span>
            </div>
          ))}
        </div>
      </div>

      {currentWorkspace && (
        <div className="sidebar-section">
          <div className="section-header">
            <h3>Channels</h3>
            <button 
              className="btn-icon" 
              onClick={onCreateChannel}
              title="Create channel"
            >
              +
            </button>
          </div>
          <div className="channel-list">
            {channels.length === 0 ? (
              <div className="empty-message">No channels yet</div>
            ) : (
              channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`channel-item ${currentChannel?.id === channel.id ? 'active' : ''}`}
                  onClick={() => selectChannel(channel)}
                >
                  <span className="channel-icon">#</span>
                  <span className="channel-name">{channel.name}</span>
                  {channel.isPrivate && <span className="private-badge">🔒</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

