import React, { useState, useRef, useEffect } from 'react';
import { View, Platform, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import VideoWrapper from './Wrapper/VideoWrapper';
import { fetchManifest, extractHlsUrlsFromManifest, getBaseUrl, extractResolutionHeightsFromManifest } from './utils/utils';

const { width, height } = Dimensions.get('window');

const VideoOverlay = (props, ref) => {
  const {
   defaultImg = null,
   bandWidth=null,
   videoId=null,
   src = null,
   isPaused = false,
   isAutoPlay = false,
   isMuted = false,
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
   preload='auto',
   loadingIndicatorStyle=null,
   playbackCB=null,
   muteUnmuteCB=null,
   payload = null,
   search = {},
   page_type = '',
   repeatBuffering=false,
  } = props;

  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [paused, setPaused] = useState(isPaused);
  const [muted, setMuted] = useState(isMuted);
  // const [isReady, setIsReady] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(src);

  const videoRef = ref || useRef(null);

  // const videoRefElement = useRef(ref);
  // const videoRef = ref?.current ? ref : videoRefElement;

  useEffect(() => {
    // if(isReady){
      setPaused(isPaused);
      // playbackCB?.();
    // }
  }, [isPaused]);

  useEffect(() => {
    // if(isReady){
      setMuted(isMuted);
      // muteUnmuteCB?.();
    // }
 }, [isMuted]);

 useEffect(() => {
  setSelectedUrl(src);
  setLoading(true);
}, [src]);

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
        //  console.log('matchingUrl', matchingUrl);
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
    // setIsReady(true);
    setLoading(false);
    console.log('Video is ready for display-VideoOverlay.js');
  };

  const handleBuffering = () => {
    onBuffer?.();
    setIsBuffering(true);
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

  // const handleOnEnd = () => {
  //   onEnd?.();
  //   if (repeat) {
  //     if (Platform.OS === 'web') {
  //       videoRef.current.currentTime = 0;
  //     } else {
  //       videoRef.current.seek(0);
  //     }
  //   }
  //   else{
  //     if (Platform.OS === 'web') {
  //       videoRef.current.currentTime = 0;
  //     }
  //     else{
  //       videoRef.current.seek(0);  
  //     }
  //     setPaused(true);
  //     setTimeout(()=>{setPaused(false)}, 0);
  //   }
  // };
  const handleOnEnd = () => {
  onEnd?.();

  if (repeat) {
    if (Platform.OS === 'web') {
      if (videoRef.current) videoRef.current.currentTime = 0;
    } else {
      if (videoRef.current?.seek) {
        videoRef.current.seek(0); // now available
      }
    }
  } else {
    if (Platform.OS === 'web') {
      if (videoRef.current) videoRef.current.currentTime = 0;
    } else {
      if (videoRef.current?.seek) {
        videoRef.current.seek(0);
      }
    }
    setPaused(true);
    setTimeout(() => setPaused(false), 0);
  }
};


  return (
    <View style={[styles.container, { height: heightFromParent, width: widthFromParent }, isFullscreen && styles.containerFull]}>    
      {/* {
        //Fix to show the image when scroll in reverse direction and reload issue comes
        (Platform.OS !== 'web') && defaultImg && <Image source={{ uri: defaultImg }} style={styles.backgroundImageAlways} />
       } */}
      <VideoWrapper
        // {...props}
        id={videoId}
        controls={controls}
        ref={ref}
        muted={muted}
        paused={paused}
        autoPlay={isAutoPlay}
        resizeMode={resizeMode}
        src={selectedUrl}
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
        payload = {payload}
        search = {search}
        page_type = {page_type}
        />
      {loading && !!defaultImg && ( <Image source={{ uri: defaultImg }} style={styles.backgroundImage} />)}
      {((repeatBuffering && isBuffering) || loading) && (
         <View style={styles.loadingOverlay}>
         <ActivityIndicator
           animating={loading || (repeatBuffering && isBuffering)}
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
  backgroundImageAlways: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex:0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
