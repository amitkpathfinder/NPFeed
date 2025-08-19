import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, Image, StyleSheet, Text, View, Platform } from 'react-native';

import {VideoOverlay, TextLayer} from '@nnshared/nnvideoplayer';

const {screenWidth, screenHeight} = Dimensions.get('window');
const BasePlayerZeroControls = ({
  isPaused: initialIsPaused = false,
}) => {

  // Define loop start and end times (in seconds)
  const LOOP_START_TIME = 0; // Example: Start loop at 10 seconds
  const LOOP_END_TIME = 10; // Example: End loop at 30 seconds
  
  const videoRef = useRef(null);
  const controlsTimerRef = useRef(null);

  const [customControls, setCustomControls] = useState(false);
  const [playerState, setPlayerState] = useState({
    isPaused: initialIsPaused,
    isMuted: true,
    currentTime: 0,
    duration: 0,
    seekPosition: 0,
    isSeekingInProgress: false,
    isFullscreen: false,
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

  const startControlsTimer = () => {
    // Clear any existing timer
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    // Set new timer
    controlsTimerRef.current = setTimeout(() => {
      setCustomControls(false);
    }, 3000); // 3 seconds
  };

  const handleControls = (evt) => {
    setCustomControls(prev => {
      const newState = !prev;
      if (newState) {
        startControlsTimer();
      }
      return newState;
    });
    evt.stopPropagation();
  };

 
  const handleOnLoad = (duration) => {
    // console.log('----------Video Loaded, Duration:', duration);
    setPlayerState(prev => ({
      ...prev,
      duration:LOOP_END_TIME > 0 ? LOOP_END_TIME : duration,
      isPaused: false // Ensure video plays on load
    }));
  };

   // Handle progress to implement looping
   const handleProgress = (progress) => {
     const { currentTime } = progress;
 
     if (currentTime > LOOP_END_TIME) {

      if (Platform.OS === 'web') {
        // Web-specific logic
        videoRef.current.currentTime = LOOP_START_TIME; // Reset to the loop start time
      } else {
        // Native-specific logic
        videoRef.current.seek(LOOP_START_TIME);
      }
     } else {
       setPlayerState((prev) => ({
         ...prev,
         currentTime,
       }));
     }
   };
   const handleVideoError = () => {
    console.error('Video failed to load');
  };

  const handleOnEnd = () => {
    console.log('Video repeat now!');
  };

  return (
    <View style={styles.container}>
      <VideoOverlay
        videoId={2}
        ref={videoRef}
        isAutoPlay={true}
        resizeMode={'contain'}
        controls={false}
        repeat={true}
        muted={playerState.isMuted}
        isPaused={playerState.isPaused}
        isFullscreen={playerState.isFullscreen}
        onProgress={handleProgress}
        onLoad={handleOnLoad}
        onError={handleVideoError}
        onEnd={handleOnEnd}
        widthFromParent={screenWidth}
        heightFromParent={300}
        onPlay={()=>console.log('On Play event---web')}
        onPause={()=>console.log('On Pause event---web')}
        page_name={'SRP'}
        section_name={'INFINITY_VIDEO_PLAYER'}
        // src={'https://imagecdn.99acres.com/loanTest/Shivam_Home_loan_final2_compressed.mp4'}
        src={'https://imagecdn.99acres.com/hls-test/330hovz_1732767002_533961645/330hovz_1732767002_533961645_playlist.m3u8'}
        defautImg={'https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png'}
      />
      
     <TextLayer/>

      {/*An Overlay just above the video to stop clicking on video*/}
      <Pressable
        style={styles.overlayBox}
        onPress={handleControls}>
        {/* <Text style={styles.textcolr}></Text> */}
      </Pressable>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 2,
    borderBottomColor: 'solid',
    borderColor: 'red',
    width: '100%',
    height:300,
    overflow: 'hidden',
    justifyContent:'center',
    alignItems: 'center',
  },
  
  overlayBox: {
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '200%',
    height: '100%',
    padding: 10,
    zIndex: 2
  },
//   textcolr: {
//     color: 'white',
//     fontSize: 20,
//     textAlign: 'center'
//   }
});

export default BasePlayerZeroControls;

