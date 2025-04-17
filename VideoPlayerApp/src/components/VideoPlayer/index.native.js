import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Dimensions, 
  TouchableOpacity,
  TouchableWithoutFeedback 
} from 'react-native';
import Slider from '@react-native-community/slider';
import Video from 'react-native-video';
import { Maximize2, PauseCircle, PlayCircle } from 'lucide-react-native';

const SEEK_TIME = 10; 
const DOUBLE_TAP_DELAY = 300; 
const ICON_TIMEOUT = 3000; 

const VideoPlayer = ({
  src,
  onEnded,
  onDoubleTapSeekForward,
  onDoubleTapSeekBackward
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const videoRef = useRef(null);
  const lastTapRef = useRef(0);
  const controlTimeoutRef = useRef(null);

  useEffect(() => {
    if (showControls) {
      controlTimeoutRef.current = setTimeout(() => setShowControls(false), ICON_TIMEOUT);
    }
    return () => clearTimeout(controlTimeoutRef.current);
  }, [showControls]);

  const handleVideoPress = () => {
    setIsPaused((prev) => !prev);
    setShowControls(true);
  };

  const handleBuffer = (meta) => {
    setIsBuffering(meta.isBuffering);
  };

  const onLoad = (data) => {
    setDuration(data.duration);
  };

  const onProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const onSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
    }
  };

  const handleDoubleTap = (side) => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const seekTime = side === 'left' ? -SEEK_TIME : SEEK_TIME;
      const newTime = Math.max(0, Math.min(duration, currentTime + seekTime));
      videoRef.current.seek(newTime);

      // Callbacks for seeking in stories
      if (side === 'left' && onDoubleTapSeekBackward) {
        onDoubleTapSeekBackward();
      } else if (side === 'right' && onDoubleTapSeekForward) {
        onDoubleTapSeekForward();
      }
    }
    lastTapRef.current = now;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (isFullscreen) {
        videoRef.current.dismissFullscreenPlayer();
      } else {
        videoRef.current.presentFullscreenPlayer();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: src }}
          style={styles.backgroundVideo}
          autoplay
          paused={isPaused}
          controls={false}
          muted
          resizeMode="cover"
          onBuffer={handleBuffer}
          onLoad={onLoad}
          onProgress={onProgress}
          onEnd={onEnded}
          onFullscreenPlayerWillPresent={() => setIsFullscreen(true)}
          onFullscreenPlayerWillDismiss={() => setIsFullscreen(false)}
        />
        
        <TouchableWithoutFeedback onPress={() => handleDoubleTap('left')}>
          <View style={styles.touchableLeftSide} />
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => handleDoubleTap('right')}>
          <View style={styles.touchableRightSide} />
        </TouchableWithoutFeedback>

        <TouchableOpacity 
          style={styles.centerContainer} 
          onPress={handleVideoPress}
          activeOpacity={1}>
          {showControls && (
            <View style={styles.playPauseIcon}>
              {isPaused ? (
                <PlayCircle color="white" size={50} />
              ) : (
                <PauseCircle color="white" size={50} />
              )}
            </View>
          )}
        </TouchableOpacity>

        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
      
      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.seekbarContainer}>
            <Slider
              style={styles.seekbar}
              value={currentTime}
              minimumValue={0}
              maximumValue={duration}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor="#FFFFFF"
              onSlidingComplete={onSeek}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={toggleFullscreen}
          >
            <Maximize2 color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Dimensions.get('window').height,
    backgroundColor: 'white',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
  },
  touchableLeftSide: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '30%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  touchableRightSide: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '30%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  centerContainer: {
    position: 'absolute',
    left: '30%',
    width: '40%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    position: 'absolute',
    alignSelf: 'center',
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  seekbarContainer: {
    flex: 1,
    marginRight: 40,
  },
  seekbar: {
    width: '100%',
    height: 40,
  },
  fullscreenButton: {
    position: 'absolute',
    right: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPlayer;


// import React, { useState, useRef } from 'react';
// import { 
//   View, 
//   StyleSheet, 
//   ActivityIndicator, 
//   Dimensions, 
//   TouchableOpacity,
//   TouchableWithoutFeedback, 
// } from 'react-native';
// import Slider from '@react-native-community/slider';
// import Video from 'react-native-video';
// import { Maximize2 } from 'lucide-react-native';

// const SEEK_TIME = 10; // Time in seconds to seek on double tap
// const DOUBLE_TAP_DELAY = 300; // Delay to detect double tap in milliseconds

// const VideoPlayer = () => {
//   const [isPaused, setIsPaused] = useState(false);
//   const [isBuffering, setIsBuffering] = useState(false);
//   const [duration, setDuration] = useState(0);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [isFullscreen, setIsFullscreen] = useState(false);
  
//   const videoRef = useRef(null);
//   const lastTapRef = useRef(0);
//   const lastTapTimeoutRef = useRef(null);

//   const handleVideoPress = () => {
//     setIsPaused((prev) => !prev);
//   };

//   const handleBuffer = (meta) => {
//     setIsBuffering(meta.isBuffering);
//   };

//   const onLoad = (data) => {
//     setDuration(data.duration);
//   };

//   const onProgress = (data) => {
//     setCurrentTime(data.currentTime);
//   };

//   const onSeek = (value) => {
//     if (videoRef.current) {
//       videoRef.current.seek(value);
//     }
//   };

//   const handleDoubleTap = (side) => {
//     const now = Date.now();
//     // const DOUBLE_TAP_DELAY = 300;

//     if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
//       // Clear any existing timeout
//       if (lastTapTimeoutRef.current) {
//         clearTimeout(lastTapTimeoutRef.current);
//       }

//       // Calculate new time
//       const seekTime = side === 'left' ? -SEEK_TIME : SEEK_TIME;
//       const newTime = Math.max(0, Math.min(duration, currentTime + seekTime));
      
//       // Perform seek
//       if (videoRef.current) {
//         videoRef.current.seek(newTime);
//       }
//     }

//     lastTapRef.current = now;

//     // Set a timeout to reset the last tap time
//     lastTapTimeoutRef.current = setTimeout(() => {
//       lastTapRef.current = 0;
//     }, DOUBLE_TAP_DELAY);
//   };

//   const toggleFullscreen = () => {
//     if (videoRef.current) {
//       if (isFullscreen) {
//         videoRef.current.dismissFullscreenPlayer();
//       } else {
//         videoRef.current.presentFullscreenPlayer();
//       }
//       setIsFullscreen(!isFullscreen);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.videoContainer}>
//         <Video
//           ref={videoRef}
//           source={{ uri: 'https://imagecdn.99acres.com/loanTest/Horizontal_compressed.mp4' }}
//           style={styles.backgroundVideo}
//           paused={isPaused}
//           controls={false}
//           muted={true}
//           resizeMode="cover"
//           onBuffer={handleBuffer}
//           onLoad={onLoad}
//           onProgress={onProgress}
//           onEnd={() => console.log('The Video is finished playing.')}
//           onFullscreenPlayerWillPresent={() => setIsFullscreen(true)}
//           onFullscreenPlayerWillDismiss={() => setIsFullscreen(false)}
//         />
        
//         {/* Left side double tap area */}
//         <TouchableWithoutFeedback onPress={() => handleDoubleTap('left')}>
//           <View style={styles.touchableLeftSide} />
//         </TouchableWithoutFeedback>

//         {/* Right side double tap area */}
//         <TouchableWithoutFeedback onPress={() => handleDoubleTap('right')}>
//           <View style={styles.touchableRightSide} />
//         </TouchableWithoutFeedback>

//         {/* Center play/pause area */}
//         <TouchableOpacity 
//           style={styles.centerContainer} 
//           onPress={handleVideoPress}
//           activeOpacity={1}
//         />

//         {isBuffering && (
//           <View style={styles.bufferingContainer}>
//             <ActivityIndicator size="large" color="#fff" />
//           </View>
//         )}
//       </View>
      
//       <View style={styles.controlsContainer}>
//         <View style={styles.seekbarContainer}>
//           <Slider
//             style={styles.seekbar}
//             value={currentTime}
//             minimumValue={0}
//             maximumValue={duration}
//             minimumTrackTintColor="#FFFFFF"
//             maximumTrackTintColor="#000000"
//             thumbTintColor="#FFFFFF"
//             onSlidingComplete={onSeek}
//           />
//         </View>
        
//         <TouchableOpacity 
//           style={styles.fullscreenButton}
//           onPress={toggleFullscreen}
//         >
//           <Maximize2 color="red" size={54} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     height: Dimensions.get('window').height/2,
//     backgroundColor: 'white'
//   },
//   videoContainer: {
//     flex: 1,
//     position: 'relative',
//   },
//   backgroundVideo: {
//     width: '100%',
//     height: '100%',
//   },
//   touchableLeftSide: {
//     position: 'absolute',
//     left: 0,
//     top: 0,
//     width: '30%',
//     height: '100%',
//     backgroundColor: 'transparent',
//   },
//   touchableRightSide: {
//     position: 'absolute',
//     right: 0,
//     top: 0,
//     width: '30%',
//     height: '100%',
//     backgroundColor: 'transparent',
//   },
//   centerContainer: {
//     position: 'absolute',
//     left: '30%',
//     width: '40%',
//     height: '100%',
//     backgroundColor: 'transparent',
//   },
//   bufferingContainer: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   controlsContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 40,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   seekbarContainer: {
//     flex: 1,
//     marginRight: 40,
//   },
//   seekbar: {
//     width: '100%',
//     height: 40,
//   },
//   fullscreenButton: {
//     position: 'absolute',
//     right: 8,
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default VideoPlayer;


// import React, { useState, useRef } from 'react';
// import { View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
// import Slider from '@react-native-community/slider';
// import Video from 'react-native-video';

// const VideoPlayer = () => {
//   const [isPaused, setIsPaused] = useState(false);
//   const [isBuffering, setIsBuffering] = useState(false);
//   const [duration, setDuration] = useState(0);
//   const [currentTime, setCurrentTime] = useState(0);
//   const videoRef = useRef(null);

//   const handleVideoPress = () => {
//     setIsPaused((prev) => !prev);
//   };

//   const handleBuffer = (meta) => {
//     console.log("Buffering state:", meta.isBuffering);
//     setIsBuffering(meta.isBuffering);
//   };

//   const onLoad = (data) => {
//     console.log({ data });
//     setDuration(data.duration);
//   };

//   const onProgress = (data) => {
//     setCurrentTime(data.currentTime);
//   };

//   const onSeek = (value) => {
//     if (videoRef.current) {
//       videoRef.current.seek(value);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={handleVideoPress} style={styles.videoContainer}>
//         <Video
//           ref={videoRef}
//           source={{ uri: 'https://imagecdn.99acres.com/loanTest/Horizontal_compressed.mp4' }}
//           style={styles.backgroundVideo}
//           paused={isPaused}
//           controls={false}
//           muted={true}
//           resizeMode="cover"
//           onBuffer={handleBuffer}
//           onLoad={onLoad}
//           onProgress={onProgress}
//           onEnd={() => console.log('The Video is finished playing.')}
//           onFullscreenPlayerWillPresent={() => console.log('The Video is entering in fullscreen mode.')}
//         />
//         {isBuffering && (
//           <View style={styles.bufferingContainer}>
//             <ActivityIndicator size="large" color="#fff" />
//           </View>
//         )}
//       </TouchableOpacity>
      
//       <View style={styles.seekbarContainer}>
//         <Slider
//           style={styles.seekbar}
//           value={currentTime}
//           minimumValue={0}
//           maximumValue={duration}
//           minimumTrackTintColor="#FFFFFF"
//           maximumTrackTintColor="#000000"
//           thumbTintColor="#FFFFFF"
//           onSlidingComplete={onSeek}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     height: Dimensions.get('window').height/2,
//     backgroundColor: 'black',
//   },
//   videoContainer: {
//     flex: 1,
//   },
//   backgroundVideo: {
//     width: '100%',
//     height: '100%',
//   },
//   bufferingContainer: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   seekbarContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 40,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//   },
//   seekbar: {
//     width: '100%',
//     height: 40,
//   },
// });

// export default VideoPlayer;




// import React, { useState } from 'react';
// import { View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
// import Video from 'react-native-video';

// const VideoPlayer = () => {
//   const [isPaused, setIsPaused] = useState(false);
//   const [isBuffering, setIsBuffering] = useState(false);

//   const handleVideoPress = () => {
//     setIsPaused((prev) => !prev); // Toggle play/pause
//   };

//   const handleBuffer = (meta) => {
//     console.log("Buffering state:", meta.isBuffering); // Log buffering state
//     setIsBuffering(meta.isBuffering); // Set buffering state based on callback
//   };
//   const onLoad = (data) => {
//     console.log({ data });
//   };

//   return (
//     <TouchableOpacity onPress={handleVideoPress} style={styles.container}>
//       <Video
//         source={{ uri: 'https://imagecdn.99acres.com/loanTest/Horizontal_compressed.mp4' }}
//         style={styles.backgroundVideo}
//         paused={isPaused}
//         // controls
//         muted={true}
//         resizeMode="cover"
//         onBuffer={handleBuffer} // Set the onBuffer handler
//         onLoad={onLoad}
//         onEnd={()=>console.log('The Video is finished playing.')}
//         onFullscreenPlayerWillPresent={()=>console.log('The Video is entering in fullscreen mode.')}
//       />
//       {isBuffering && ( // Show loading indicator when buffering
//         <View style={styles.bufferingContainer}>
//           <ActivityIndicator size="large" color="#fff" />
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     height: Dimensions.get('window').height/2,
//     backgroundColor: 'transparent',
//   },
//   backgroundVideo: {
//     width: '100%',
//     height: '100%',
//   },
//   bufferingContainer: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darken the background during buffering
//   },
// });

// export default VideoPlayer;
