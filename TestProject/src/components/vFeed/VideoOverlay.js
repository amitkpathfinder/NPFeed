/**
 * VideoOverlay Component
 * 
 * This component is a video wrapper that manages loading, buffering, playback, and quality selection.
 * It integrates with an HLS manifest to fetch video streams dynamically based on bandwidth settings.
 *
 * Features:
 * - Auto-play support
 * - Custom poster image before video starts
 * - Handles buffering and loading states
 * - Quality selection via HLS manifest parsing
 * - Repeat playback control
 * - Fullscreen support
 * - Custom event handlers for progress, play, pause, and end events
 *
 * Props:
 * - src (string): Video source URL
 * - defaultImg (string): URL of the default image to show before playback
 * - videoId (string): Unique ID for the video instance
 * - bandWidth (number | null): Selected bandwidth for adaptive streaming
 * - onQualityChange (function): Callback for quality change event
 * - onReadyForDisplay (function): Callback when the video is ready
 * - onBuffer (function): Callback when the video is buffering
 * - onPlaying (function): Callback when the video starts playing
 * - onLoad (function): Callback when the video loads metadata
 * - onError (function): Callback for error handling
 * - onPlay (function): Callback when play is triggered
 * - onPause (function): Callback when pause is triggered
 * - onEnd (function): Callback when video playback ends
 * - onProgress (function): Callback for video progress tracking
 * - isAutoPlay (boolean): Should the video auto-play (default: false)
 * - resizeMode (string): How the video should be resized ('cover', 'contain', etc.)
 * - controls (boolean): Show native video controls
 * - repeat (boolean): Should the video loop (default: true)
 * - muted (boolean): Should the video start muted (default: true)
 * - isPaused (boolean): External pause/play control
 * - isFullscreen (boolean): Fullscreen mode state
 * - heightFromParent (string | number): Video container height
 * - widthFromParent (string | number): Video container width
 * - page_name (string): Page name for analytics/tracking
 * - section_name (string): Section name for analytics/tracking
 * - custom_object (object): Additional custom data
 */


/*
Note: 
1. NNVideoTrackingPlayer package needs to be updated and published on nexus to enable support for event parameter in onLoad event.
2. VideoWrapper web and App check is optimized for performance.
3. Play, Pause, onReadyForDisplay, onLoad, onError, onEnd available for Apps
4. Remove all console events before publishing
*/

 import React, { useState, useRef, useEffect } from 'react';
 import { View, Platform, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
 import VideoWrapper from './Wrapper/VideoWrapper';
 import { fetchManifest, extractHlsUrlsFromManifest, getBaseUrl, extractResolutionHeightsFromManifest } from './utils/utils';
 
 const { width, height } = Dimensions.get('window');
 
 const VideoOverlay = ({
    defaultImg = null,
    bandWidth=null,
    videoId=null,
    src = null,
    isPaused = true,
    isAutoPlay = false,
    muted = true,
    onQualityChange = null,
    onReadyForDisplay=null,
    onBuffer = null,
    onPlaying = null,
    onLoad = null,
    onError = null,
    onPlay = null,
    onPause = null,
    onEnd = null,
    onProgress = null,
    resizeMode = 'cover',
    controls = false,
    repeat = false,
    page_name = '',
    section_name = '',
    custom_object = '',
    isFullscreen = false,
    heightFromParent = '100%',
    widthFromParent = '100%',
    preload=true,
    loadingIndicatorStyle=null,
    playbackCB=null,
    currentTime,
 }, ref) => {
  
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
   const [paused, setPaused] = useState(isPaused);
   const [isReady, setIsReady] = useState(false);
   const [selectedUrl, setSelectedUrl] = useState(src);
   const videoRefElement = useRef(ref);
   const videoRef = ref?.current ? ref : videoRefElement;
 
   useEffect(() => {
     setPaused(isPaused);
     if(isReady)
     {
      // console.log(`PlayPaused State----->${videoId}`,isPaused?'Paused':'Playing')
     }
    //  playbackCB?.();
   }, [isPaused]);

   useEffect(() => {
    if (bandWidth == null) return; // Prevent execution if bandWidth is null or undefined
  
    const fetchAndParse = async () => {
      try {
        const baseUrl = getBaseUrl(src);
        const manifest = await fetchManifest(src);
        const urls = extractHlsUrlsFromManifest(manifest);
        const resolutions = extractResolutionHeightsFromManifest(manifest);
        const matchingUrl = bandWidth
          ? baseUrl + urls[resolutions.indexOf(findNearestValue(resolutions, bandWidth))] 
          : src;
          console.log('matchingUrl', matchingUrl);
        setSelectedUrl(matchingUrl);
      } catch (error) {
        console.error('Error fetching or parsing manifest:', error);
      }
    };
  
    fetchAndParse();
  }, [bandWidth, src]);


 const findNearestValue = (array, target) => {
    let [closest, minDifference] = [array[0], Math.abs(target - array[0])];
    for (let i = 1; i < array.length; i++) {
      const currentDifference = Math.abs(target - array[i]);
      if (currentDifference === 0) return array[i]; // Early return for exact match
      if (currentDifference < minDifference) {
        [closest, minDifference] = [array[i], currentDifference];
      }
    }
    return closest;
  }
  
   const handleReadyForDisplay = () => {
     onReadyForDisplay?.();
     setIsReady(true);
     setLoading(false);
   };
 
   const handleBuffering = () => {
     onBuffer?.();
     setLoading(true);
     console.log('dddddddddddddddddddddddddddd');
   };
 
   const handleOnPlaying = () => {
     onPlaying?.();
     setLoading(false);
   };
 
   const handleOnLoad = (e) => {
     onLoad?.(e);
   };

   const handleProgress = (progress) => {
    if (progress.currentTime > 1 && progress.playableDuration - progress.currentTime < 1) {
      setIsBuffering(true);
    } else {
      setIsBuffering(false);
    }
     onProgress?.(progress);
   };
 
   const handleOnEnd = () => {
    console.log('ended Entry');
    onEnd?.();
    if (repeat) {
        if (Platform.OS === 'web') {
          videoRef.current.currentTime = 0;
        } else {
          videoRef.current.seek(0);
        }
      }
      else{
        // videoRef.current.seek(0); 
        setPaused(true);
        setTimeout(()=>{setPaused(false)}, 0);
      }
   };
 
   return (
     <View style={[styles.container, { height: heightFromParent, width: widthFromParent }, isFullscreen && styles.containerFull]}>    
       <VideoWrapper
         id={videoId}
         controls={controls}
         refs={ref}
         muted={muted}
         paused={paused}
         autoPlay={isAutoPlay}
         resizeMode={resizeMode}
         src={selectedUrl}
         currentTime={currentTime}
         onQualityChange={onQualityChange}
         onEnd={handleOnEnd}
         repeat={repeat}
         onError={onError}
         onBuffer={handleBuffering}
         onReadyForDisplay={handleReadyForDisplay}
         onLoad={handleOnLoad}
         onPlay={onPlay}
         onPause={onPause}
         onPlaying={handleOnPlaying}
         onProgress={handleProgress}
         page_name={page_name}
         section_name={section_name}
         custom_object={custom_object}
         preload={preload}
         />
       {loading && !!defaultImg && ( <Image source={{ uri: defaultImg }} style={styles.backgroundImage} />)}
       {(isBuffering || loading) && (
         <View style={styles.loadingOverlay}>
         <ActivityIndicator
           animating={loading || isBuffering}
           size={loadingIndicatorStyle?.size || 'large'}
           color={loadingIndicatorStyle?.color || 'white'}
           style={loadingIndicatorStyle?.style}
         />
       </View>
       )}
     </View>
   );
 };
 
 const styles = StyleSheet.create({
   container: {
     backgroundColor: 'rgba(0, 0, 0, 0.8)',
   },
   containerFull: {
     width: width,
     height: height,
   },
   backgroundImage: {
     position: 'absolute',
     top: 0,
     left: 0,
     width: '100%',
     height: '100%',
     resizeMode: 'cover',
   },
   loadingOverlay: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: 'rgba(0, 0, 0, 0.2)',
   }
 });
 
 export default React.forwardRef(VideoOverlay);
 