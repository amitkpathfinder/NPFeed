import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Hls from 'hls.js';

const VideoPlayer = ({
  id,
  src,
  isPaused,
  poster,
  onLoad,
  onProgress
}) => {
  const videoRef = useRef(null);

  // Set up HLS stream
  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (isPaused) {
                videoRef.current.pause();
              } else {
                videoRef.current.play();
              }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
        videoRef.current.addEventListener('loadedmetadata', () => {
            if (isPaused) {
                videoRef.current.pause();
              } else {
                videoRef.current.play();
              }
        });
      }
    }
  }, [src]);

  // Auto play/pause based on parent-controlled state
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPaused]);


  useEffect(() => {
        if (videoRef.current) {
      const handleTimeUpdate = () => {
        const time = videoRef.current.currentTime; 
        onProgress(time); 
      };
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [onProgress]);

  const handleMetadataLoaded = () => {
    if (onLoad) {
      onLoad({ duration: videoRef.current.duration }); 
    }
  };

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        id={id}
        src={src}
        poster={poster}
        playsInline
        muted
        preload="auto"
        onLoadedMetadata={handleMetadataLoaded} 
        style={styles.video}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    height: '100%',
  },
  video: {
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  }
});

export default VideoPlayer;
