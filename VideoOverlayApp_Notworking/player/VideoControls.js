// VideoControlComponents.js
import React from 'react';
import { TouchableOpacity, Platform, Text, StyleSheet } from 'react-native';
// import { NNSectionTracking } from "@nnshared/nntrackingsdk";

export const PlayPauseButton = (props) => {
  const {
  isPaused,
  onPlayPause,
  data_custominfo,
  showControls = true,
  style = {},
  buttonStyle = {},
  textStyle = {},
} = props

  if (!showControls) return null;

  return (
    <TouchableOpacity
      style={[styles.playPauseButton, buttonStyle, style]}
      onPress={onPlayPause}
    >
      <Text style={[styles.playPauseText, textStyle]}>
        {isPaused ? '▶' : '⏸'}
      </Text>
    </TouchableOpacity>
  );
};

export const BackwardButton = ({
  videoRef,
  currentTime,
  duration,
  onSeek,
  backwardTime = 10,
  showControls = true,
  style = {},
  buttonStyle = {},
  textStyle = {},
}) => {
  if (!showControls) return null;

  const handleBackward = () => {
    if (!videoRef?.current) return;

    const newTime = Math.max(0, currentTime - backwardTime);
    
    try {
      if (Platform.OS === 'web') {
        videoRef.current.currentTime = newTime;
      } else {
        videoRef.current.seek(newTime);
      }

      if (onSeek) {
        onSeek({ currentTime: newTime });
      }
    } catch (error) {
      console.error('Backward seek failed:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.seekButton, styles.bwdBtn, buttonStyle, style]}
      onPress={handleBackward}
    >
      <Text style={[styles.seekButtonText, textStyle]}>
        -{backwardTime}s
      </Text>
    </TouchableOpacity>
  );
};

export const ForwardButton = ({
  videoRef,
  currentTime,
  duration,
  onSeek,
  forwardTime = 10,
  showControls = true,
  style = {},
  buttonStyle = {},
  textStyle = {},
}) => {
  if (!showControls) return null;

  const handleForward = () => {
    if (!videoRef?.current) return;

    const newTime = Math.min(currentTime + forwardTime, duration);
    
    try {
      if (Platform.OS === 'web') {
        videoRef.current.currentTime = newTime;
      } else {
        videoRef.current.seek(newTime);
      }

      if (onSeek) {
        onSeek({ currentTime: newTime });
      }
    } catch (error) {
      console.error('Forward seek failed:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.seekButton, styles.fwdBtn, buttonStyle, style]}
      onPress={handleForward}
    >
      <Text style={[styles.seekButtonText, textStyle]}>
        +{forwardTime}s
      </Text>
    </TouchableOpacity>
  );
};

export const VolumeButton = ({
  isMuted,
  onMuteToggle,
  showControls = true,
  style = {},
  buttonStyle = {},
  textStyle = {},
}) => {
  if (!showControls) return null;

  return (
    <TouchableOpacity
      style={[styles.volumeButton, buttonStyle, style]}
      onPress={onMuteToggle}
    >
      <Text style={[styles.volumeButtonText, textStyle]}>
        {isMuted ? '🔇' : '🔊'}
      </Text>
    </TouchableOpacity>
  );
};

export const FullscreenButton = ({
  isFullscreen,
  onFullscreenToggle,
  showControls = true,
  style = {},
  buttonStyle = {},
  textStyle = {},
}) => {
  if (!showControls) return null;

  return (
    <TouchableOpacity
      style={[styles.fullscreenButton, buttonStyle, style]}
      onPress={onFullscreenToggle}
    >
      <Text style={[styles.fullscreenButtonText, textStyle]}>
        {isFullscreen ? '⊹' : '⤢'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playPauseButton: {
    position:'absolute',
    zIndex:3,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 30,
    width: 60,
    height: 60,
    // top:'50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseText: {
    color: 'white',
    fontSize: 24,
  },
  seekButton: {
    position:'absolute',
    zIndex:3,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 20,
    width: 60,
    alignItems: 'center',
  },
  fwdBtn:{
    right:0
  },
  bwdBtn:{
    left:0
  },
  seekButtonText: {
    color: 'white',
    fontSize: 14,
  },
  volumeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 20,
    position:'absolute',
    zIndex:3,
  },
  volumeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  fullscreenButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 20,
    position:'absolute',
    zIndex:3,
  },
  fullscreenButtonText: {
    color: 'white',
    fontSize: 18,
  },
});