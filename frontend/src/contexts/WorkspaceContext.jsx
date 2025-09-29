import React, { createContext, useContext, useState, useEffect } from 'react';
import { workspaceAPI, channelAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspaces();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentWorkspace) {
      loadChannels(currentWorkspace.id);
    }
  }, [currentWorkspace]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data);
      
      // Auto-select first workspace if available
      if (response.data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async (workspaceId) => {
    try {
      const response = await channelAPI.getAll(workspaceId);
      setChannels(response.data);
      
      // Auto-select first channel if available
      if (response.data.length > 0 && !currentChannel) {
        setCurrentChannel(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const createWorkspace = async (workspaceData) => {
    try {
      const response = await workspaceAPI.create(workspaceData);
      setWorkspaces([...workspaces, response.data]);
      setCurrentWorkspace(response.data);
      return { success: true, workspace: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create workspace' 
      };
    }
  };

  const createChannel = async (channelData) => {
    if (!currentWorkspace) return { success: false, error: 'No workspace selected' };
    
    try {
      const response = await channelAPI.create(currentWorkspace.id, channelData);
      setChannels([...channels, response.data]);
      setCurrentChannel(response.data);
      return { success: true, channel: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create channel' 
      };
    }
  };

  const joinChannel = async (channelId) => {
    try {
      await channelAPI.join(channelId);
      loadChannels(currentWorkspace.id);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to join channel' 
      };
    }
  };

  const leaveChannel = async (channelId) => {
    try {
      await channelAPI.leave(channelId);
      loadChannels(currentWorkspace.id);
      if (currentChannel?.id === channelId) {
        setCurrentChannel(null);
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to leave channel' 
      };
    }
  };

  const selectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    setCurrentChannel(null);
  };

  const selectChannel = (channel) => {
    setCurrentChannel(channel);
  };

  const value = {
    workspaces,
    currentWorkspace,
    channels,
    currentChannel,
    loading,
    loadWorkspaces,
    createWorkspace,
    createChannel,
    joinChannel,
    leaveChannel,
    selectWorkspace,
    selectChannel,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

