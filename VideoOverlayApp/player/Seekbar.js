import React, { useRef, useState, useEffect } from 'react';
import { View, Text, PanResponder, StyleSheet, Platform, NativeModules, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const { PlatformConstants } = NativeModules;
const androidVersion        = PlatformConstants?.Release; // Example: "11.2"

const SeekBar = ({
  videoRef,
  videoDuration = 0,
  paused,
  currentTime: currentTimeFromProps = 0,
  onSeek,
  showControls = true,
  seekPosition: initialSeekPosition = 0,
  showDurationInfo=false,
  showSeekbarThumb=false,
  styleObject,
}) => {
  const [seekPosition, setSeekPosition] = useState(initialSeekPosition);
  const [currentTime, setCurrentTime] = useState(currentTimeFromProps);
  const [isSeekingInProgress, setIsSeekingInProgress] = useState(false);
  const videoDurationRef = useRef(videoDuration);
  const seekTimeout = useRef(null);


  useEffect(() => {
    videoDurationRef.current = videoDuration;
  }, [videoDuration]);

  useEffect(() => {
    if (!isSeekingInProgress) {
      setCurrentTime(currentTimeFromProps);
      setSeekPosition((currentTimeFromProps / videoDuration) * 100 || 0);
    }
  }, [currentTimeFromProps, videoDuration, isSeekingInProgress]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    // console.log(`${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const handleSeek = (seekTime) => {
    if (!videoRef?.current) {
      console.warn('Video ref is not available');
      return;
    }

    const boundedSeekTime = Math.min(Math.max(seekTime, 0), videoDurationRef.current);
    
    try {
      if (Platform.OS === 'web') {
        videoRef.current.currentTime = boundedSeekTime;
      } else {
        videoRef.current.seek(boundedSeekTime);
      }
      
      // Call onSeek with the current time only
      if (onSeek) {
        onSeek({ currentTime: boundedSeekTime });
        videoRef.current.seek(boundedSeekTime);
      }

      //Case to update seekbar while video is paused
      if (paused) {
        setSeekPosition((boundedSeekTime / videoDuration) * 100);
      }
    } catch (error) {
      console.error('Seek failed:', error);
    }
  };


  const handleSeekThrottled = (seekTime) => {
    if (seekTimeout.current) {
      clearTimeout(seekTimeout.current);
    }

    seekTimeout.current = setTimeout(() => {
      handleSeek(seekTime);
      seekTimeout.current = null;
    }, 250);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const initialX = Math.max(0, Math.min(evt.nativeEvent.locationX, width));
        const initialSeekPercentage = (initialX / width) * 100;
        const initialSeekTime = (initialX / width) * videoDurationRef.current;

        setIsSeekingInProgress(true);
        setSeekPosition(initialSeekPercentage);
        // handleSeek(initialSeekTime);
        handleSeekThrottled(initialSeekTime);
        evt.stopPropagation();
      },
      onPanResponderMove: (evt) => {
        const moveX = Math.max(0, Math.min(evt.nativeEvent.locationX, width));
        const percentage = (moveX / width) * 100;
        const seekTime = (moveX / width) * videoDurationRef.current;

        const boundedPercentage = Math.min(Math.max(percentage, 0), 100);
        const boundedSeekTime = Math.min(Math.max(seekTime, 0), videoDurationRef.current);

        setSeekPosition(boundedPercentage);
        setCurrentTime(boundedSeekTime);
        handleSeekThrottled(boundedSeekTime);
        
        // if (Platform.OS === 'android' && parseFloat(androidVersion) <= 11.5) {
        //   handleSeekThrottled(boundedSeekTime);
        // } else {
        //   handleSeek(boundedSeekTime);
        // }

        setIsSeekingInProgress(false);
        
        evt.stopPropagation();
      },
      onPanResponderRelease: (evt) => {
        const releaseX = Math.max(0, Math.min(evt.nativeEvent.locationX, width));
        const seekTime = (releaseX / width) * videoDurationRef.current;
        
        handleSeek(seekTime);
        setIsSeekingInProgress(false);
        evt.stopPropagation();
      }
    })
  ).current;

  return (
    <View style={styles.controls}>
      {showDurationInfo && showControls && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(videoDuration)}</Text>
        </View>
      )}
      
      {showControls && (
        <View>
          <View 
            style={[styles.seekbarContainer,
              styleObject.seekbarcontainer]} 
            {...panResponder.panHandlers}
          >
            <View 
              style={[
                styles.seekbarBase, 
                styleObject.seekbarbase,
                { width: '100%' }
              ]} 
            />
            <View 
              style={[
                styles.seekbar, 
                styleObject.seekbar,
                { width: `${seekPosition}%` }
              ]} 
            />
          </View>
          {showSeekbarThumb && seekPosition > 2 && seekPosition < 98  && <View 
            style={[
              styles.seekbarThumb, 
              styleObject.seekbarthumb,
              { 
                left: `${seekPosition}%`, 
                transform: [{ translateX: -8 }] 
              }
            ]} 
          />
          }
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 5,
    // height: 75,
    // backgroundColor: 'yellow',
    // paddingHorizontal: 10,
  },
  seekbarContainer: {
    display: 'flex',
    height: 30,
    backgroundColor: 'rgba(0,0,0,.5)',
    borderRadius: 3,
    position: 'relative',
    bottom: 0,
    zIndex: 4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  seekbar: {
    height: 4,
    backgroundColor: '#fff',
    position: 'absolute',
    zIndex: 2,
    top:12,
  },
  seekbarBase: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,.2)',
    position: 'absolute',
    zIndex: 0,
    top: 12,
  },
  seekbarThumb: {
    // pointerEvents: 'none',
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 22,
    backgroundColor: '#fff',
    top: 6,
    right: 0,
    marginLeft: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    marginHorizontal: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth:50,
    // fontFamily: 'Roboto'
  },
});

export default SeekBar;