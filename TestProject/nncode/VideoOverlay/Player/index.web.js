import React, { useEffect, useState, useRef, useCallback, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Hls from 'hls.js';

import {
  getTrackingObjectForVideoTracking,
  getTrackingObjectForSectionTacking,
  sendTracking,
} from "@nnshared/nntrackingsdk/NNTrackingutils";
//import { NNTrackingDataHandler } from "@nnshared/nntrackingsdk/NNTrackingDataHandler";

const EVENT_PLAYBACK_PAUSE = "PLAYBACK_PAUSE";
const EVENT_PLAYBACK_START = "PLAYBACK_START";
const EVENT_PLAYBACK_END = "PLAYBACK_END";
const EVENT_PLAYBACK_ERROR_RETRY = "PLAYBACK_ERROR_RETRY";
const EVENT_PLAYER_LOADED = "PLAYER_LOADED";
const STAGE_FINAL = "FINAL";
const EVENT_NAME_FOR_CLICK = "CLICK";


const VideoPlayer = forwardRef(({
  id,
  src,
  page_name='',
  section_name='',
  custom_object = null,
  payload = null,
  referrer = '',
  style='',
  paused = false,
  onQualityChange=null,
  controls=false,
  autoPlay=false,
  repeat=true,
  muted = false,
  onLoad =null,
  onEnd=null,
  onProgress =null,
  onBuffer =null,
  onError =null,
  onPlay=null,
  onPause=null,
  resizeMode = 'contain',
  onPlaying =null,
  preload='auto',
  search = {},
  page_type = ''
}, ref) => {
  const videoRef = useRef(null);
  const [currentQuality, setCurrentQuality] = useState(null);
  const lastQualityCheck = useRef(0);
  const QUALITY_CHECK_INTERVAL = 5000; // Check quality every 1 second


  // Unified ref handling
  const videoElement = (ref && ref.current) ? ref.current : videoRef.current;

  let trackingParams = {
    page_name: page_name,
    stage: STAGE_FINAL,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    // clientId: NNTrackingDataHandler.getData("clientId"),
    // appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    referrer: referrer,
    // current_url: NNTrackingDataHandler.getData("current_url")
  };
  

/*********************FOR HLS QUALITY*/
 // HTML5 Video Quality Check
 const checkHTML5VideoQuality = (videoElement) => {
  if (!videoElement) return null;
  
  const height = videoElement.videoHeight;
  const width = videoElement.videoWidth;
  
  // Get current time video statistics
  const playbackQuality = videoElement.getVideoPlaybackQuality?.() || {};
  
  return {
    height,
    width,
    timestamp: Date.now(),
    currentTime: videoElement.currentTime,
    droppedFrames: playbackQuality.droppedVideoFrames || 0,
    totalFrames: playbackQuality.totalVideoFrames || 0,
    qualityLabel: `${width}x${height}`,
    // Estimate bitrate based on downloaded bytes if available
    estimatedBandwidth: videoElement.webkitVideoDecodedByteCount 
      ? (videoElement.webkitVideoDecodedByteCount * 8 / videoElement.currentTime) 
      : null
  };
};

// HLS Quality Check with Progress
const setupHLSQualityMonitoring = (hls) => {
  if (!hls) return;

  // Monitor HLS quality changes
  hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
    const levels = hls.levels;
    const currentLevel = levels[data.level];
    
    const qualityInfo = {
      height: currentLevel.height,
      width: currentLevel.width,
      bitrate: currentLevel.bitrate,
      qualityLabel: `${currentLevel.width}x${currentLevel.height}`,
      bandwidth: currentLevel.bitrate,
      levelIndex: data.level,
      timestamp: Date.now()
    };

    setCurrentQuality(qualityInfo);
    onQualityChange?.(qualityInfo);
  });

  // Monitor fragment loading for more detailed bandwidth information
  hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
    const { stats } = data;
    if (stats) {
      const loadTime = stats.tload - stats.tfirst;
      const bw = stats.total * 8 / loadTime; // bits per ms = kbps
      
      const qualityInfo = {
        ...currentQuality,
        measuredBandwidth: Math.round(bw),
        loadTime,
        timestamp: Date.now()
      };
      
      setCurrentQuality(qualityInfo);
      onQualityChange?.(qualityInfo);
    }
  });
};

/*********************FOR HLS QUALITY*/


  // HLS or Native Video Setup
  useEffect(() => {
    if (!videoElement) return;

    // Clear any existing HLS instance
    if (videoElement.hlsInstance) {
      videoElement.hlsInstance.destroy();
      videoElement.hlsInstance = null;
    }
    

    // Determine video type and setup accordingly
    if (src.includes('.m3u8')) {
      // HLS Stream
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!paused) videoElement.play().catch(onError);
        });
        // Setup quality monitoring for HLS
        setupHLSQualityMonitoring(hls);
        videoElement.hlsInstance = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        
        // Safari HLS support
        videoElement.src = src;
        
        // For native HLS support (Safari)
        const checkQuality = () => {
          const quality = checkHTML5VideoQuality(videoElement);
          setCurrentQuality(quality);
          onQualityChange?.(quality);
        };
        videoElement.addEventListener('loadedmetadata', checkQuality);
        return () => videoElement.removeEventListener('loadedmetadata', checkQuality);

        // videoElement.addEventListener('loadedmetadata', () => {
        //   if (!paused) videoElement.play().catch(onError);
        // });
      }
    } else {

      // Regular MP4 or other format
      const checkQuality = () => {
        const quality = checkHTML5VideoQuality(videoElement);
        setCurrentQuality(quality);
        onQualityChange?.(quality);
      };
      
      videoElement.addEventListener('loadedmetadata', checkQuality);
      return () => videoElement.removeEventListener('loadedmetadata', checkQuality);

      // MP4 or standard video
      // videoElement.src = src;
      // if (!paused) videoElement.play().catch(onError);
    }

    return () => {
      if (videoElement && videoElement.hlsInstance) {
        videoElement.hlsInstance.destroy();
        videoElement.hlsInstance = null;
      }
    };
  }, [src, videoElement]);

  // Play/Pause Control
  // useEffect(() => {
  //   if (!videoElement) return;

  //   if (paused) {
  //     videoElement.pause();
  //   } else {
  //     videoElement.play().catch(onError);
  //   }
  // }, [paused, onError]);

  useEffect(() => {

    if (!videoElement) return;

    // PAUSE Tracking
    if (paused) {
      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYBACK_PAUSE,
      };
      // videoElement = true;
      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );
      console.log("Video Tracking : PLAYBACK_PAUSE : ", trackingObject);
      sendTracking(trackingObject);
    }
    else
      if (videoElement && !paused) {
        // PLAYBACK_START
        const updated_trackingParams = {
          ...trackingParams,
          event: EVENT_PLAYBACK_START,
        };
        const trackingObject = getTrackingObjectForVideoTracking(
          updated_trackingParams
        );
        console.log("Video Tracking : PLAYBACK_START : ", trackingObject);
        sendTracking(trackingObject);
      }
  }, [paused]);



  useEffect(() => {

    if(videoElement && muted) {
      // muted
      fireCustomEvents(`${section_name}_MUTED`,
      EVENT_NAME_FOR_CLICK);
    }
    else
    if(videoElement && !muted) {
      // unmuted
      fireCustomEvents(`${section_name}_UNMUTED`,
      EVENT_NAME_FOR_CLICK);
    }

  },[muted]);

  const fireCustomEvents = (section_name,event) => {
    const paramsForCustomEvent = {
      page_name: page_name,
      event: event,
      stage: STAGE_FINAL,
      section: section_name ,
      custom_object: {custom_object,payload,search},
      // clientId: NNTrackingDataHandler.getData("clientId"),
      // appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
      referrer: referrer,
      // current_url : NNTrackingDataHandler.getData("current_url"),
      page_type : page_type
  };
    const trackingObjectForCustomTracking 
    = getTrackingObjectForSectionTacking(paramsForCustomEvent);
    console.log(`Video Tracking : ${section_name} : `, trackingObjectForCustomTracking);
    sendTracking(trackingObjectForCustomTracking);
  }


  useEffect(() => {
    if (!videoElement) return;
  
    const handlePlay = async () => {
      try {
        if (paused) {
          videoElement.pause();
        } else if (!videoElement.ended) { 
          // Only play if the video hasn't ended
          if (videoElement.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            await videoElement.play();
          } else {
            videoElement.addEventListener(
              'canplay',
              async () => {
                await videoElement.play().catch(onError);
              },
              { once: true }
            );
          }
        }
      } catch (error) {
        console.error("Playback failed. Retrying...");
        setTimeout(() => {
          videoElement.play().catch(onError);
        }, 1000); // Retry after a delay
      }
    };
  
    handlePlay();
  
    return () => {
      videoElement.removeEventListener('canplay', handlePlay);
    };
  }, [paused, videoElement, onError]);
  
  
const hlsQualityCheck = () => {
  const now = Date.now();
    // Check quality only if enough time has passed
    if (now - lastQualityCheck.current >= QUALITY_CHECK_INTERVAL) {
      lastQualityCheck.current = now;

      if (videoElement.hlsInstance) {
        // HLS specific progress quality check
        const currentLevel = videoElement.hlsInstance.currentLevel;
        const levels = videoElement.hlsInstance.levels;
        
        if (currentLevel >= 0 && levels[currentLevel]) {
          const level = levels[currentLevel];
          const qualityInfo = {
            height: level.height,
            width: level.width,
            bitrate: level.bitrate,
            qualityLabel: `${level.width}x${level.height}`,
            currentTime: videoElement.currentTime,
            timestamp: now,
            levelIndex: currentLevel,
            bufferLength: videoElement.hlsInstance.mainBufferLength
          };
          
          setCurrentQuality(qualityInfo);
          onQualityChange?.(qualityInfo);
        }
      } else {
        // Regular HTML5 video quality check
        const quality = checkHTML5VideoQuality(videoElement);
        if (quality) {
          setCurrentQuality(quality);
          onQualityChange?.(quality);
        }
      }
    }
}

  // Handle progress updates and quality monitoring
  const handleProgress = useCallback(() => {
    if (!videoElement) return;
    
    //Commented out quality check functionality here
    // hlsQualityCheck();

    // Call original onProgress if provided
    onProgress?.(videoElement);
  }, [onProgress, videoElement]);

  useEffect(() => {
    if (!videoElement) return;

    videoElement.addEventListener('timeupdate', handleProgress);
    return () => {
      videoElement.removeEventListener('timeupdate', handleProgress);
    };
  }, [handleProgress]);

  // Metadata Load Handling
  const handleMetadataLoaded = useCallback(() => {
    if (videoElement) {

      // PLAYBACK_START
      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYER_LOADED,
      };
      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );
      console.log("Video Tracking : PLAYER_LOADED : ", trackingObject);
      sendTracking(trackingObject);
      if(onLoad){
        onLoad({ duration: videoElement.duration });
      }
    }
  }, [onLoad]);


  // Waiting (Buffering) Handling
  useEffect(() => {
    if (!videoElement) return;

    const handleWaiting = () => {
      onBuffer && onBuffer();
    };

    videoElement.addEventListener('waiting', handleWaiting);
    return () => {
      videoElement.removeEventListener('waiting', handleWaiting);
    };
  }, [onBuffer]);


  const handleVideoEnd = () => {
    console.log('Video Ended - Triggered'); // Debug log
    
    // PLAYBACK_END
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_END,
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
    console.log("Video Tracking : PLAYBACK_END : ", trackingObject);

    if(onEnd){
      onEnd();
    }
  };


  const onPlayHandle = () => {
    if(onPlay)
    {
      onPlay();
    }
  }

  const onPauseHandle = () => {
    if(onPause)
    {
      onPause();
    }
  }

  const onErrorHandle = () => {
    // PLAYBACK_ERROR_RETRY
    if (!videoElement) return;

    const error = videoElement.error();
    console.error('Custom Error:', error);

    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_ERROR_RETRY,
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    console.log("Video Tracking : PLAYBACK_ERROR_RETRY : ",trackingObject);
    sendTracking(trackingObject);
    
    if (onError) {
      onError();
    }
   }
   

   useEffect(() => {
    if (!videoElement) return;

    videoElement.addEventListener('error', onErrorHandle);
    return () => {
      videoElement.removeEventListener('error', onErrorHandle);
    };
  }, [onErrorHandle]);
  



  const objectFitMap = {
    'contain': 'contain',
    'cover': 'cover',
    'fill': 'fill',
    'none': 'none',
    'scale-down': 'scale-down'
  };

  return (
    <View style={[styles.container, style]}>
      <video
        ref={ref || videoRef}
        id={id}
        src={src}
        loop={repeat}
        controls={controls}
        autoPlay={autoPlay}
        playsInline
        muted={muted}
        preload={preload}
        onPlay={onPlayHandle}
        onPause={onPauseHandle}
        onEnded={handleVideoEnd}
        onPlaying={onPlaying}
        onLoadedMetadata={handleMetadataLoaded}
        // onError={onErrorHandle}
        style={{
          ...styles.video,
          objectFit: objectFitMap[resizeMode] || 'initial',
        }}
      />
    </View>
  );
});

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