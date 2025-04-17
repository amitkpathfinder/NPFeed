import React, { createContext, useContext, useState } from 'react';

const VideoContext = createContext();

export const VideoContextProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMuteAll = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <VideoContext.Provider value={{ isMuted, toggleMuteAll }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);