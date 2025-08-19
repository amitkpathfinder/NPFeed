/**
 * BaseVideoPlayer Component
 * 
 * This component provides a customizable video player with essential controls,
 * overlays, seek functionality, and event handling. 
 * 
 * ## Components Used:
 * - VideoOverlay: Handles the video rendering and playback.
 * - SeekBar: Provides a progress bar for seeking.
 * - TextLayer: Displays text overlays on the video.
 * - VideoControlsWrapper: A wrapper for playback controls (play/pause, mute, fullscreen, etc.).
 * 
 * ## Props:
 * - `src` (string): URL of the video source.
 * - `videoId` (string): Unique identifier for the video.
 * - `customVideoConfig` (object): Custom configuration options.
 * - `isPaused` (boolean): Initial paused state of the video.
 * 
 * ## Features:
 * - Play/Pause Toggle
 * - Mute/Unmute
 * - Fullscreen Mode
 * - Seek Bar Interaction
 * - Customizable UI Controls
 * - Auto-hide Controls after Inactivity
 * - Video Looping (configurable start and end times)
 * 
 * Usage Example:
 * ```jsx
 * <BaseVideoPlayer
 *   src="https://example.com/video.mp4"
 *   videoId="video_123"
 *   customVideoConfig={{ data_custominfo: {} }}
 *   isPaused={false}
 * />
 * ```
 */
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Slider, Pressable, TouchableOpacity, Image, StyleSheet, Text, View, Platform } from 'react-native';
// import Slider from '@react-native-community/slider';

// import {BaseVideoPlayer} from '@nnshared/nnvideoplayer';
import VideoOverlay from './VideoOverlay';
import TextLayer from './TextLayer';

import SeekBar from './Seekbar';
import { useVideoContext } from './videoContext';  // Import the context
import {
        // VideoOverlay, 
        // SeekBar, 
        // TextLayer, 
        VideoControlsWrapper
        } 
        from '@nnshared/nnvideoplayer';


const {screenWidth, screenHeight} = Dimensions.get('window');
const BaseVideoPlayer = ({
  src,
  videoId,
  customVideoConfig,
  isPaused: initialIsPaused = true,
  vtype,
}) => {

  // Define loop start and end times (in seconds)
  const LOOP_START_TIME = 0; // Example: Start loop at 10 seconds
  const LOOP_END_TIME = 10; // Example: End loop at 30 seconds
  
  const videoRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const videoContainerRef= useRef(null);

  const [customControls, setCustomControls] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [loading, setLoading] = useState(true);


  const [watchTime, setWatchTime] = useState(0);
  const lastUpdateTime = useRef(0);

  // const { isMuted, toggleMuteAll } = useVideoContext();

  const [playerState, setPlayerState] = useState({
    isPaused: initialIsPaused,
    isMuted: true,
    currentTime: 0,
    duration: 0,
    seekPosition: 0,
    isSeekingInProgress: false,
    isFullscreen: false,
  });


  useEffect(() => {
    if (Platform.OS == 'web'){
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlayerState(prev => ({
            ...prev,
            isPaused: false
          }));
        } else {
          setPlayerState(prev => ({
            ...prev,
            isPaused: true
          }));
        }
      },
      { threshold: 0.9 } // Play when 50% of the video is visible
    );

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current);
    }

    return () => {
      if (videoContainerRef.current) {
        observer.unobserve(videoContainerRef.current);
      }
    };
  }}, []);


  // const handleMuteToggle = () => {
  //   toggleMuteAll(); // Update global mute state
  // };

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

  // Your existing handlers
  const handlePlayPauseToggle = () => {
    console.log('Toggle Play/Pause Called');
    setPlayerState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
    startControlsTimer(); // Restart timer when control is used
  };
  
  const handleMuteToggle = () => {
    console.log('Toggle mute/unmute Called');
    setPlayerState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
    startControlsTimer(); // Restart timer when control is used
  };

  const handleOnLoad = (e) => {
    // console.log('----------Video Loaded, Duration:', duration);
    // console.clear();
    setPlayerState(prev => ({
      ...prev,
      duration:e.duration,
      // isPaused: false // Ensure video plays on load
    }));
  };

  const handleFullscreenToggle = () => {
    setPlayerState(prev => ({
      ...prev,
      isFullscreen: !prev.isFullscreen
    }));
    startControlsTimer(); // Restart timer when control is used
  };

  const handleSeek = (seekData) => {
    // console.log('handleSeek-Callback', seekData.seekTime);
    setPlayerState(prev => ({
      ...prev,
      currentTime: seekData.currentTime
    }));
    startControlsTimer(); // Restart timer when control is used
  };


   // Handle progress to implement looping
   const handleProgress = (progress) => {
     const { currentTime } = progress;
    //  console.log('---------------------------->>>>>>>',progress.currentTime);
// return;
 
if (currentTime - lastUpdateTime.current >= 5) {
  lastUpdateTime.current = currentTime;
  setWatchTime(prevTime => prevTime + 5);
  //console.log(`User has watched ${watchTime + 5} seconds of the video.`);
}

     
       setPlayerState((prev) => ({
         ...prev,
         currentTime,
       }));
     
    // console.log('----------------------------Web',videoRef.current.id);
    //  console.log('----------------------------App',videoRef.current.props.id);
   };
   
  const handleReadyForDisplay = () => {
    const timeInMilliseconds = Date.now();
const timeInSeconds = Math.floor(timeInMilliseconds / 1000);

console.log('1. Handle handleReadyForDisplay State BASEVIDEO', timeInSeconds);
    console.log('2. Handle handleReadyForDisplay State BASEVIDEO', Date.now());
    setLoading(false);
  };

  const handleBuffering = () => {
    console.log('Handle Buffering State BASEVIDEO', Date.now());
    setLoading(true);
  };

  const handleOnPlaying = () => {
    console.log('handle OnPlaying State BASEVIDEO', Date.now());
    setLoading(false);
  };
  
  const handleVideoError = () => {
    console.log('Video failed to load');
  };

  const handleVideoEnd = () => {
    console.log('Video has ended');
    // setIsVideoEnded(true);
  };
  

  // Handle when the user finishes sliding the seekbar.
  const onSlidingComplete = (value) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
    }
  };

  return (
    <View style={styles.container} ref={videoContainerRef} >
      <VideoOverlay
        testData={'TestWorking...'}
        videoId={videoId}
        ref={videoRef}
        isAutoPlay={true}
        resizeMode={'cover'}
        controls={false}
        repeat={false}
        preload={'auto'}
        playbackCB={
          ()=>
            console.log(
              `playbackCB this is the state${videoId}`, 
              playerState.isPaused?'playbackCB-Paused':'playbackCB-Playing'
              )
        }
        muteUnmuteCB={
          ()=>
            console.log(
              `muteUnmuteCB this is the state${videoId}`, 
              playerState.isMuted?'muteUnmuteCB-Muted':'muteUnmuteCB-Unmuted'
              )
        }
        // bandWidth={1080}

        // onBandwidth={(data) => {
        //   console.log('BaseVideoPlayer - Bandwidth Update:', data);
        // }}
        
        //For Web
        //onQualityChange={()=>console.log('onQualityChange')}
        
        //local states
        isMuted={playerState.isMuted}
        isPaused={playerState.isPaused}
        isFullscreen={playerState.isFullscreen}
        
        onReadyForDisplay={handleReadyForDisplay}
        //Callback function that is called when the first video 
        //frame is ready for display. This is when the poster is removed.

        onPlaying={handleOnPlaying}
        onBuffer={handleBuffering}

        onProgress={handleProgress}
        onLoad={handleOnLoad}
        onError={handleVideoError}
        onEnd={handleVideoEnd}
        
        // onStateChange={()=>console.log('On StateChange Called')}
        
        widthFromParent={400}
        heightFromParent={500}
        
        onPlay={()=>console.log('On Play event---web')}
        onPause={()=>console.log('On Pause event---web')}
        
        page_name={'SRP'}
        section_name={'TEST_VIDEO_PLAYER'}
        custom_object={{'Test_custom_object':'Test_custom_object'}}
        src={'https://imagecdn.99acres.com/loanTest/Shivam_Home_loan_final2_compressed.mp4'}
        // src={'https://imagecdn.99acres.com/hls/case13/master.m3u8'}
        // src={'http://aws-99.infoedge.com/ABR/215083142/master1.m3u8'}
        // src={'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'}
        // src={'https://imagecdn.99acres.com/loanTest/Shivam_Home_loan_final2_compressed.mp4'}
        // src={'https://flipfit-cdn.akamaized.net/flip_hls/662aae7a42cd740019b91dec-3e114f/video_h1.m3u8'}
        // src={'http://aws-99.infoedge.com/ABR/124/master.m3u8'}
        // src={'http://aws-99.infoedge.com/ABR/124/master2.m3u8'}
        // src={'http://aws-99.infoedge.com/ABR/124/master3.m3u8'}
        // src={'https://imagecdn.99acres.com/ABR/146/master.m3u8'}
        // src={'https://imagecdn.99acres.com/ABR/146/master480First.m3u8'}
        // src={'https://imagecdn.99acres.com/ABR/146/master240Removed.m3u8'}
        defaultImg={'https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png'}
        payload = {'my payload'}
        search = {'search'}
        // progressUpdateInterval={1000} // Update every second
        page_type = {'Add_your_page_type'}
        loadingIndicatorStyle={{
          color: 'white', // Change to desired color
          size: 'large', // 'small' | 'large' (Platform dependent)
          style: { transform: [{ scaleX: 2 }, { scaleY: 2 }] }, // Custom style
        }}
      />
      
      <TextLayer content={vtype}/>

      <VideoControlsWrapper
        videoRef={videoRef}
        isPaused={playerState.isPaused}
        isMuted={playerState.isMuted}
        isFullscreen={playerState.isFullscreen}
        currentTime={playerState.currentTime}
        duration={playerState.duration}
        showControls={customControls}
        onPlayPause={handlePlayPauseToggle}
        onMuteToggle={handleMuteToggle}
        onFullscreenToggle={handleFullscreenToggle}
        onSeek={handleSeek}
        backwardTime={2}
        forwardTime={2}

        data_custominfo={customVideoConfig?.data_custominfo}

        // Control which buttons to show
        showPlayPauseButton={isVideoEnded? false: true}
        showBackwardButton={false}
        showForwardButton={false}
        showVolumeButton={true}
        showFullscreenButton={true}

        onControlsToggle={handleControls}

        // Position configuration
        playPausePosition="center"        // Center of the screen
        backwardPosition="leftCenter"     // Center-left
        forwardPosition="rightCenter"     // Center-right
        volumePosition="rightTop"         // Top-right corner
        fullscreenPosition="rightTop"     // Top-right corner
        
        // Fine-tune positions with margins
        volumeMargin={{ right: 70, top: 20 }}
        fullscreenMargin={{ right: 20, top: 20 }}
        
        // Optional custom styles
        playPauseStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}

      />
      

      {/*An Overlay just above the video to stop clicking on video*/}
      <Pressable
        style={styles.overlayBox}
        onPress={handleControls}>
        <Text style={styles.textcolr}></Text>
      </Pressable>


      {/* <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={playerState.duration}
        value={playerState.currentTime}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor="red"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="red"
      /> */}

      <TouchableOpacity 
        style={styles.seekbarBox}
        onPress={() => startControlsTimer()} // Restart timer when seekbar is touched
      >
        <SeekBar
          videoRef={videoRef}
          videoDuration={playerState.duration}
          currentTime={playerState.currentTime}
          paused={playerState.isPaused}
          onSeek={handleSeek}
          showControls={customControls}
          seekPosition={playerState.seekPosition}
          showDurationInfo={true}
          showSeekbarThumb={true}
          styleObject={{
            seekbarcontainer:{
              backgroundColor:'transparent',
            },
            seekbarbase: {
              backgroundColor: 'rgba(255,255,255,.2)', // Change to desired color
            },
            seekbar: {
              backgroundColor: 'red', // Change to desired color
            },
            seekbarthumb:{
              backgroundColor: 'red', // Change to desired color
            }
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 2,
    borderBottomColor: 'solid',
    borderColor: 'red',
    backgroundColor:'transparent',
    // width: 400,
    // height:800,
    overflow: 'hidden',
    // justifyContent:'center',
    // alignItems: 'center',
    // alignSelf: 'center',
    display:'flex'
  },
  slider: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    position: 'absolute',
    zIndex: 4,
    left: 0,
    bottom: 0,
  },
  seekbarBox: {
    position: 'absolute',
    zIndex: 3,
    left: 0,
    bottom: 0,
    width: '100%',
    height: 75,
  },
  overlayBox: {
    backgroundColor:'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '200%',
    height: '100%',
    padding: 10,
    zIndex: 2
  },
  textcolr: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center'
  }
});

export default BaseVideoPlayer;


