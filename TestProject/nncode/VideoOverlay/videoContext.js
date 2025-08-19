import React, { createContext, useState, useContext } from 'react';

// Create Context
const VideoContext = createContext();

// Custom Hook for easy access
export const useVideoContext = () => useContext(VideoContext);

// Provider Component
export const VideoProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMuteAll = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <VideoContext.Provider value={{ isMuted, toggleMuteAll }}>
      {children}
    </VideoContext.Provider>
  );
};
