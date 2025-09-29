import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import {
  PlayPauseButton,
  BackwardButton,
  ForwardButton,
  VolumeButton,
  FullscreenButton,
} from './VideoControls';

const POSITIONS = {
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -30 },
      { translateY: -30 }
    ]
  },
  leftTop: {
    position: 'absolute',
    top: 20,
    left: 20
  },
  rightTop: {
    position: 'absolute',
    top: 20,
    right: 20
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20
  },
  bottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20
  },
  leftCenter: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -30 }]
  },
  rightCenter: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -30 }]
  }
};

const VideoControlsWrapper = ({
  // Video state props
  videoRef,
  isPaused,
  isMuted,
  isFullscreen,
  currentTime,
  duration,
  showControls,
  
  // Event handlers
  onPlayPause,
  onMuteToggle,
  onFullscreenToggle,
  onSeek,
  
  // Button visibility configuration
  showPlayPauseButton = true,
  showBackwardButton = true,
  showForwardButton = true,
  showVolumeButton = true,
  showFullscreenButton = true,
  
  // Customization props
  backwardTime = 5,
  forwardTime = 5,
  
  // Position configuration
  playPausePosition = 'center',
  backwardPosition = 'leftCenter',
  forwardPosition = 'rightCenter',
  volumePosition = 'rightTop',
  fullscreenPosition = 'rightTop',
  
  // Individual margins for fine-tuning
  volumeMargin = { right: 70 },
  fullscreenMargin = { right: 20 },
  
  // Custom styles
  containerStyle = {},
  playPauseStyle = {},
  seekButtonStyle = {},
  volumeStyle = {},
  fullscreenStyle = {},
  
  // Tracking props
  data_custominfo,
}) => {
  if (!showControls) return null;

  const getPositionStyle = (position, additionalMargin = {}) => ({
    ...POSITIONS[position],
    ...additionalMargin
  });

  return (
    <>
      {showPlayPauseButton && (
        <PlayPauseButton
          isPaused={isPaused}
          onPlayPause={onPlayPause}
          showControls={showControls}
          style={[getPositionStyle(playPausePosition), playPauseStyle]}
          data_custominfo={data_custominfo}
        />
      )}

      {showBackwardButton && (
        <BackwardButton
          videoRef={videoRef}
          currentTime={currentTime}
          duration={duration}
          backwardTime={backwardTime}
          onSeek={onSeek}
          showControls={showControls}
          style={[getPositionStyle(backwardPosition), seekButtonStyle]}
        />
      )}

      {showForwardButton && (
        <ForwardButton
          videoRef={videoRef}
          currentTime={currentTime}
          duration={duration}
          forwardTime={forwardTime}
          onSeek={onSeek}
          showControls={showControls}
          style={[getPositionStyle(forwardPosition), seekButtonStyle]}
        />
      )}

      {showVolumeButton && (
        <VolumeButton
          isMuted={isMuted}
          onMuteToggle={onMuteToggle}
          showControls={showControls}
          style={[getPositionStyle(volumePosition, volumeMargin), volumeStyle]}
        />
      )}

      {showFullscreenButton && (
        <FullscreenButton
          isFullscreen={isFullscreen}
          onFullscreenToggle={onFullscreenToggle}
          showControls={showControls}
          style={[getPositionStyle(fullscreenPosition, fullscreenMargin), fullscreenStyle]}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
});

export default VideoControlsWrapper;


// import React from 'react';
// import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
// import {
//   PlayPauseButton,
//   BackwardButton,
//   ForwardButton,
//   VolumeButton,
//   FullscreenButton,
// } from './VideoControls';

// // Predefined position configurations
// const POSITIONS = {
//   center: {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: [
//       { translateX: -30 },
//       { translateY: -30 }
//     ]
//   },
//   leftTop: {
//     position: 'absolute',
//     top: 20,
//     left: 20
//   },
//   rightTop: {
//     position: 'absolute',
//     top: 20,
//     right: 20
//   },
//   bottomLeft: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20
//   },
//   bottomRight: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20
//   },
//   leftCenter: {
//     position: 'absolute',
//     left: 20,
//     top: '50%',
//     transform: [{ translateY: -30 }]
//   },
//   rightCenter: {
//     position: 'absolute',
//     right: 20,
//     top: '50%',
//     transform: [{ translateY: -30 }]
//   }
// };

// const VideoControlsWrapper = ({
//   // Video state props
//   videoRef,
//   isPaused,
//   isMuted,
//   isFullscreen,
//   currentTime,
//   duration,
//   showControls,
  
//   // Event handlers
//   onPlayPause,
//   onMuteToggle,
//   onFullscreenToggle,
//   onSeek,
  
//   // Customization props
//   backwardTime = 5,
//   forwardTime = 5,
  
//   // Position configuration
//   playPausePosition = 'center',
//   backwardPosition = 'leftCenter',
//   forwardPosition = 'rightCenter',
//   volumePosition = 'rightTop',
//   fullscreenPosition = 'rightTop',
  
//   // Individual margins for fine-tuning
//   volumeMargin = { right: 70 },
//   fullscreenMargin = { right: 20 },
  
//   // Custom styles
//   containerStyle = {},
//   playPauseStyle = {},
//   seekButtonStyle = {},
//   volumeStyle = {},
//   fullscreenStyle = {},
  
//   // Tracking props
//   data_custominfo,
// }) => {
//   if (!showControls) return null;

//   const getPositionStyle = (position, additionalMargin = {}) => ({
//     ...POSITIONS[position],
//     ...additionalMargin
//   });

//   return (
//     // <View style={[styles.controlsContainer, containerStyle]}>
//     <>
//       <PlayPauseButton
//         isPaused={isPaused}
//         onPlayPause={onPlayPause}
//         showControls={showControls}
//         style={[getPositionStyle(playPausePosition), playPauseStyle]}
//         data_custominfo={data_custominfo}
//       />

//       <BackwardButton
//         videoRef={videoRef}
//         currentTime={currentTime}
//         duration={duration}
//         backwardTime={backwardTime}
//         onSeek={onSeek}
//         showControls={showControls}
//         style={[getPositionStyle(backwardPosition), seekButtonStyle]}
//       />

//       <ForwardButton
//         videoRef={videoRef}
//         currentTime={currentTime}
//         duration={duration}
//         forwardTime={forwardTime}
//         onSeek={onSeek}
//         showControls={showControls}
//         style={[getPositionStyle(forwardPosition), seekButtonStyle]}
//       />

//       <VolumeButton
//         isMuted={isMuted}
//         onMuteToggle={onMuteToggle}
//         showControls={showControls}
//         style={[getPositionStyle(volumePosition, volumeMargin), volumeStyle]}
//       />

//       <FullscreenButton
//         isFullscreen={isFullscreen}
//         onFullscreenToggle={onFullscreenToggle}
//         showControls={showControls}
//         style={[getPositionStyle(fullscreenPosition, fullscreenMargin), fullscreenStyle]}
//       />
//     </>
//     // </View>
//   );
// };

// const styles = StyleSheet.create({
//   controlsContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 3,
//   },
// });

// export default VideoControlsWrapper;