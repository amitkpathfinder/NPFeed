import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Dimensions, PanResponder } from 'react-native';
import VideoWrapper from './Wrapper/VideoWrapper';
// import backendData from './backend.json'; // Ensure the path to backend.json is correct

// const { width } = Dimensions.get('window');

const VideoOverlay = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  //seekbar code
  const seekbarWidth = useRef(new Animated.Value(0)).current;
  const handleProgress = (time) => {
    setCurrentTime(time);
  
    const progress = videoDuration > 0 ? (time / videoDuration) * 100 : 0; // Calculate percentage
    // console.log(`Current Time: ${time}, Duration: ${videoDuration}, Progress: ${progress}%`);
  
    // Smoothly animate the seekbar width
    Animated.timing(seekbarWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false, // Width animation does not support native driver
    }).start();
  };
  
  //Getting Video urls and information
  useEffect(() => {
    console.log('VideoOverlay:Loading video list');
    const fetchVideos = async () => {
        //   const response = await fetch('http://192.168.1.15:8080/backend.json');
      const response = await fetch('http://10.112.4.67:8080/backend.json');
        const data = await response.json();
        setVideos(data);
    };
    fetchVideos();
}, []);

  // Toggle Play and Pause
  const togglePlayPause = () => setPaused((prev) => !prev);
  // Toggle Custom Fullscreen Functionality
  const toggleFullscreen = () => setFullscreen((prev) => !prev);

  // Swipe to next previous video
  const handleSwipe = (direction) => {
    if (direction === 'left' && currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
     // setPaused(true); // Pause new video by default
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
     // setPaused(true); // Pause new video by default
    }
  };

  // PanResponder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 20, // Start gesture if swipe distance is significant
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        handleSwipe('right'); // Swipe right
      } else if (gestureState.dx < -50) {
        handleSwipe('left'); // Swipe left
      }
    },
  });

  // Loading state if no video
  if (videos.length === 0) {
    return <Text>Loading...</Text>;
  }

  const handleOnLoad = ({ duration }) => {
    setVideoDuration(duration);
  }

  const currentVideo = videos[currentIndex];

  return (
    <View 
      style={[styles.container, fullscreen ? styles.containerFull : '']} 
        {...panResponder.panHandlers}>
      {/* Video Player */}
      <VideoWrapper
        id={currentVideo.id}
        src={currentVideo.video}
        poster={currentVideo.poster}
        onLoad={handleOnLoad}
        paused={paused}
        onProgress={handleProgress}
      />

      {/* Overlay Controls */}
      <View style={styles.overlayBox}>
        <View style={styles.contentContainer}>
          <Text style={styles.heading}>{currentVideo.heading}</Text>
          <Text style={styles.description}>{currentVideo.description}</Text>
          <Text style={styles.component}>{currentVideo.component}</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={togglePlayPause}>
            <Text style={styles.controlText}>{paused ? 'Play' : 'Pause'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFullscreen}>
            <Text style={styles.controlText}>{fullscreen ? 'Exit Fullscreen' : 'Go FullScreen'}</Text>
          </TouchableOpacity>
          <Text style={styles.controlText}>Duration: {videoDuration.toFixed(2)}/{currentTime.toFixed(2)} seconds</Text>
        </View>
        <View style={styles.seekbarContainer}>
          <Animated.View
            testID="seekbar"
            style={[
              styles.seekbar,
              {
                width: seekbarWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={() => handleSwipe('right')}
            disabled={currentIndex === 0}
          >
            <Text style={[styles.navButton, currentIndex === 0 && styles.disabled]}>
              Previous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSwipe('left')}
            disabled={currentIndex === videos.length - 1}
          >
            <Text style={[styles.navButton, currentIndex === videos.length - 1 && styles.disabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width:'100%',
    height:300,
    position: 'relative',
  },
  containerFull:{
    height:'100%',
  },
  overlayBox: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    top: 0,
    zIndex: 1000,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  contentContainer: {
    padding: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#ccc',
    fontSize: 18,
    marginBottom: 5,
  },
  component: {
    color: '#aaa',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navButton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabled: {
    color: '#555',
  },
  seekbarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#333',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  seekbar: {
    backgroundColor: '#fff',
    height: '100%',
    width: '0%', // Initial width
  },
   
});

export default VideoOverlay;
