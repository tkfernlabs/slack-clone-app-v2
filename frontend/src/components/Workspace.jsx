import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import Sidebar from './Sidebar';
import ChannelView from './ChannelView';
import DirectMessageList from './DirectMessageList';
import DirectMessageView from './DirectMessageView';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import CreateChannelModal from './CreateChannelModal';

const Workspace = () => {
  const { user, logout } = useAuth();
  const { currentWorkspace, currentChannel } = useWorkspace();
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [view, setView] = useState('channels'); // 'channels' or 'dms'
  const [selectedDMUser, setSelectedDMUser] = useState(null);

  const handleSelectDM = (user) => {
    setSelectedDMUser(user);
    setView('dms');
  };

  const handleSwitchToChannels = () => {
    setView('channels');
    setSelectedDMUser(null);
  };

  return (
    <div className="workspace-container">
      <div className="left-sidebar">
        <Sidebar 
          onCreateWorkspace={() => setShowWorkspaceModal(true)}
          onCreateChannel={() => setShowChannelModal(true)}
          activeView={view}
          onViewChange={setView}
        />
        
        {view === 'dms' && (
          <DirectMessageList 
            onSelectConversation={handleSelectDM}
            selectedUserId={selectedDMUser?.id}
          />
        )}
      </div>
      
      <div className="main-content">
        <header className="workspace-header">
          <div className="header-left">
            {view === 'channels' && currentChannel && (
              <>
                <h2>#{currentChannel.name}</h2>
                {currentChannel.description && (
                  <span className="channel-description">{currentChannel.description}</span>
                )}
              </>
            )}
            {view === 'dms' && selectedDMUser && (
              <>
                <h2>{selectedDMUser.display_name || selectedDMUser.username}</h2>
                <span className="dm-status">Direct Message</span>
              </>
            )}
          </div>
          <div className="header-right">
            <button 
              className={`btn-view ${view === 'channels' ? 'active' : ''}`}
              onClick={handleSwitchToChannels}
            >
              Channels
            </button>
            <button 
              className={`btn-view ${view === 'dms' ? 'active' : ''}`}
              onClick={() => setView('dms')}
            >
              DMs
            </button>
            <span className="user-info">{user?.display_name || user?.fullName || user?.username}</span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        </header>

        <div className="workspace-body">
          {view === 'channels' && currentChannel && (
            <ChannelView channel={currentChannel} />
          )}
          {view === 'channels' && !currentChannel && (
            <div className="empty-state">
              <h3>Welcome to {currentWorkspace?.name || 'Slack Clone'}!</h3>
              <p>Select a channel from the sidebar to start messaging.</p>
            </div>
          )}
          {view === 'dms' && (
            <DirectMessageView otherUser={selectedDMUser} />
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

