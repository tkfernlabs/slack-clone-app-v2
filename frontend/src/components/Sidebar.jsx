import React from 'react';
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

  const getWorkspaceInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'W';
  };

  return (
    <>
      {/* Workspace Header */}
      <div className="workspace-info" onClick={onCreateWorkspace}>
        <div className="workspace-name">
          {currentWorkspace?.name || 'Select Workspace'}
        </div>
        <div className="workspace-user">
          {user?.display_name || user?.fullName || user?.username}
        </div>
      </div>

      {/* Workspaces Section */}
      <div className="workspaces-section">
        <div className="workspaces-header">
          <span>Workspaces</span>
          <button 
            className="sidebar-add-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onCreateWorkspace();
            }}
            title="Create workspace"
          >
            +
          </button>
        </div>
        <ul className="workspace-list">
          {workspaces.map((workspace) => (
            <li
              key={workspace.id}
              className={`workspace-item ${currentWorkspace?.id === workspace.id ? 'active' : ''}`}
              onClick={() => selectWorkspace(workspace)}
            >
              <div className="workspace-avatar">
                {getWorkspaceInitial(workspace.name)}
              </div>
              <div className="workspace-details">
                <div className="workspace-item-name">{workspace.name}</div>
              </div>
            </li>
          ))}
        </ul>
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

