import React, { useState, useEffect } from 'react';
import VideoPlayer from '../Player';

const VideoWrapper = (
  {
    id, 
    src,
    poster, 
    paused=false,
    onLoad, 
    onProgress,
    currentTime
    }) => {

  return (
    <VideoPlayer
      id={id}
      src={src}
      poster={poster}
      currentTime={currentTime}
      isPaused={paused}
      onLoad={onLoad}
      onProgress={onProgress}
    />
  );
};

export default VideoWrapper;
