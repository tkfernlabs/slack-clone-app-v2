import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import ChannelList from './ChannelList';
import DirectMessageList from './DirectMessageList';

const Sidebar = ({ onSelectChannel, onSelectDM, onCreateChannel }) => {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmsExpanded, setDmsExpanded] = useState(true);
  const [appsExpanded, setAppsExpanded] = useState(true);

  if (!currentWorkspace) {
    return (
      <div className="sidebar-container">
        <div className="sidebar-icons">
          <div className="sidebar-icon active" title="Home">
            <span>🏠</span>
          </div>
          <div className="sidebar-icon" title="DMs">
            <span>💬</span>
          </div>
          <div className="sidebar-icon" title="Activity">
            <span>🔔</span>
          </div>
          <div className="sidebar-icon" title="More">
            <span>⋯</span>
          </div>
        </div>
        <div className="sidebar">
          <div className="sidebar-content">
            <p style={{ padding: '1rem', color: '#ccc' }}>Please select or create a workspace</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-container">
      {/* LEFT ICON BAR */}
      <div className="sidebar-icons">
        <div className="workspace-icon">
          <span className="workspace-initial">{currentWorkspace.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="sidebar-icons-divider"></div>
        <div className="sidebar-icon active" title="Home">
          <span>🏠</span>
        </div>
        <div className="sidebar-icon" title="DMs">
          <span>💬</span>
        </div>
        <div className="sidebar-icon" title="Activity">
          <span>🔔</span>
        </div>
        <div className="sidebar-icon" title="Files">
          <span>📁</span>
        </div>
        <div className="sidebar-icons-divider"></div>
        <div className="sidebar-icon" title="More">
          <span>⋯</span>
        </div>
        <div className="sidebar-icon add-workspace" title="Add Workspace">
          <span>+</span>
        </div>
      </div>

      {/* MAIN SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="workspace-name">{currentWorkspace.name}</div>
          <div className="user-info">
            <span className="status-indicator online">●</span>
            <span className="username">{user?.username || 'User'}</span>
          </div>
        </div>

        {/* Slack Pro Banner */}
        <div className="slack-pro-banner">
          <div className="pro-banner-icon">⚡</div>
          <div className="pro-banner-text">
            <div>Get 50% Off Slack Pro</div>
            <div className="pro-banner-subtext">2 days left on this offer</div>
          </div>
        </div>

        <div className="sidebar-content">
          {/* Quick Links */}
          <div className="sidebar-quick-links">
            <div className="quick-link">
              <span className="quick-link-icon">📊</span>
              <span>Huddles</span>
            </div>
            <div className="quick-link">
              <span className="quick-link-icon">📁</span>
              <span>Directories</span>
            </div>
            <div className="quick-link starred">
              <span className="quick-link-icon">⭐</span>
              <span>Starred</span>
              <div className="quick-link-hint">Drag and drop your most important conversations here</div>
            </div>
          </div>

          {/* Channels Section */}
          <div className="sidebar-section">
            <div 
              className="section-header"
              onClick={() => setChannelsExpanded(!channelsExpanded)}
            >
              <span className="arrow">{channelsExpanded ? '▼' : '▶'}</span>
              <span className="section-title">Channels</span>
            </div>
            {channelsExpanded && (
              <ChannelList onSelectChannel={onSelectChannel} />
            )}
          </div>

          {/* Direct Messages Section */}
          <div className="sidebar-section">
            <div 
              className="section-header"
              onClick={() => setDmsExpanded(!dmsExpanded)}
            >
              <span className="arrow">{dmsExpanded ? '▼' : '▶'}</span>
              <span className="section-title">Direct Messages</span>
            </div>
            {dmsExpanded && (
              <DirectMessageList onSelectDM={onSelectDM} />
            )}
          </div>

          {/* Apps Section */}
          <div className="sidebar-section">
            <div 
              className="section-header"
              onClick={() => setAppsExpanded(!appsExpanded)}
            >
              <span className="arrow">{appsExpanded ? '▼' : '▶'}</span>
              <span className="section-title">Apps</span>
            </div>
            {appsExpanded && (
              <>
                <div className="app-item">
                  <span className="app-icon">⚡</span>
                  <span className="app-name">Slackbot</span>
                  <span className="app-badge">1</span>
                </div>
                <div className="quick-link add-link">
                  <span className="quick-link-icon">+</span>
                  <span>Add apps</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer - Invite Button */}
        <div className="sidebar-footer">
          <button className="invite-button">
            <span className="invite-icon">👥</span>
            Invite teammates
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

