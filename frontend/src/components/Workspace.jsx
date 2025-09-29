import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import Sidebar from './Sidebar';
import ChannelView from './ChannelView';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import CreateChannelModal from './CreateChannelModal';

const Workspace = () => {
  const { user, logout } = useAuth();
  const { currentWorkspace, currentChannel } = useWorkspace();
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);

  return (
    <div className="workspace-container">
      <Sidebar 
        onCreateWorkspace={() => setShowWorkspaceModal(true)}
        onCreateChannel={() => setShowChannelModal(true)}
      />
      
      <div className="main-content">
        <header className="workspace-header">
          <div className="header-left">
            {currentChannel && (
              <>
                <h2>#{currentChannel.name}</h2>
                {currentChannel.description && (
                  <span className="channel-description">{currentChannel.description}</span>
                )}
              </>
            )}
          </div>
          <div className="header-right">
            <span className="user-info">{user?.fullName || user?.username}</span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        </header>

        <div className="workspace-body">
          {currentChannel ? (
            <ChannelView channel={currentChannel} />
          ) : (
            <div className="empty-state">
              <h3>Welcome to {currentWorkspace?.name || 'Slack Clone'}!</h3>
              <p>Select a channel from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>

      {showWorkspaceModal && (
        <CreateWorkspaceModal onClose={() => setShowWorkspaceModal(false)} />
      )}
      
      {showChannelModal && (
        <CreateChannelModal onClose={() => setShowChannelModal(false)} />
      )}
    </div>
  );
};

export default Workspace;

