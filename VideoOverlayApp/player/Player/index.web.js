import React, { useEffect, useState, useRef, useCallback, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Hls from 'hls.js';

import {
  getTrackingObjectForVideoTracking,
  getTrackingObjectForSectionTacking,
  sendTracking,
} from "@nnshared/nntrackingsdk/NNTrackingutils";

import { createCustomInfoForSection } from "@nnshared/nntrackingsdk/NNTrackingutils";

const EVENT_PLAYBACK_PAUSE = "PLAYBACK_PAUSE";
const EVENT_PLAYBACK_START = "PLAYBACK_START";
const EVENT_PLAYBACK_DURATION_CHANGE = "PLAYBACK_DURATION_CHANGE";
const EVENT_PLAYBACK_END = "PLAYBACK_END";
const EVENT_PLAYBACK_ERROR_RETRY = "PLAYBACK_ERROR_RETRY";
const EVENT_PLAYER_LOADED = "PLAYER_LOADED";
const STAGE_FINAL = "FINAL";
const EVENT_NAME_FOR_CLICK = "CLICK";
const EVENT_PLAYER_BUFFER = "PLAYER_BUFFER";


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

  const getDataFromDOMNodes = () => {

    let page_name_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('data-label');
    let scope_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('scope');
    let data_global_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('data-custominfo');
    let page_version = '';
    let page_type = '';
    let tab_data = {};

    if(document?.getElementById('srpClickstreamObject') && typeof document?.getElementById('srpClickstreamObject').value == 'string') {
        data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('srpClickstreamObject').value) || {}};
    }
    if((page_name == 'LOCATION_SRP' || page_name_from_body_tag == 'LOCATION_SRP') && document?.getElementById('localitySrpClickstreamObject') && typeof document?.getElementById('localitySrpClickstreamObject').value == 'string') {
        data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('localitySrpClickstreamObject').value) || {}};
    }
    if((page_name == 'NPSRP' || page_name_from_body_tag == 'NPSRP') && document?.getElementById('npsrpClickstreamObject') && typeof document?.getElementById('npsrpClickstreamObject').value == 'string') {
        data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('npsrpClickstreamObject').value) || {}};
    }
    if(document?.getElementsByTagName('body')[0]?.getAttribute('page_version')) {
      page_version = document?.getElementsByTagName('body')[0]?.getAttribute('page_version');
    }
    if(document.getElementById('tab-container') && document.getElementById('tab-container').getAttribute('tab-data')) {
      const tab_dom_data = JSON.parse(document.getElementById('tab-container').getAttribute('tab-data'));
      page_type = tab_dom_data?.label;
      tab_data = typeof tab_dom_data?.data == 'string' ? JSON.parse(tab_dom_data?.data) : tab_dom_data?.data;
    }

    if(typeof data_global_from_body_tag == 'string') {
        data_global_from_body_tag = JSON.parse(data_global_from_body_tag);
    }

    return {
        page_name_from_body_tag,
        scope_from_body_tag,
        data_global_from_body_tag,
        page_version,
        page_type,
        tab_data
    }
  }
  
  const videoRef = useRef(null);
  const isMetadataLoadedRef = useRef(false);
  const errorOccurredRef = useRef(false);
  const [currentQuality, setCurrentQuality] = useState(null);
  const lastQualityCheck = useRef(0);
  const videoElement = (ref && ref.current) ? ref.current : videoRef.current;
  /*QUALITY IMPROVE CODE STARTS */
  // let bandwidthEstimate;
  /*QUALITY IMPROVE CODE ENDS */
  let trackingParams = {
    page_name: page_name,
    stage: STAGE_FINAL,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    referrer: referrer,
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

        /*QUALITY IMPROVE CODE STARTS */
        // hls.bandwidthEstimate = bandwidthEstimate || 500000;
        // console.log('# HLS init with bandwidthEstimate', 
        // bandwidthEstimate || 500000);
        // hls.on(Hls.Events.FRAG_LOADED, () => {
        //   bandwidthEstimate = hls.bandwidthEstimate;
        //   console.log('# bandwidthEstimate updated', bandwidthEstimate);
        // });
        /*QUALITY IMPROVE CODE ENDS */

        hls.loadSource(src);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.ERROR, (event, data) => {
          // console.error("HLS.js Error:", data);
        
          /* ERROR TRACKING WHILE VIDEO PLAYING:COMMENTING
          const updated_trackingParams = {
            ...trackingParams,
            event: EVENT_PLAYBACK_ERROR_RETRY,
            current_duration: videoElement.currentTime,
            //   error_message: data?.details || 'HLS.js Error',
            //   error_code: data?.type || 'HLS_ERROR',
            //   fatal: data?.fatal,
          };
        
          const trackingObject = getTrackingObjectForVideoTracking(updated_trackingParams);
          console.log("Video Tracking : PLAYBACK_ERROR_RETRY : ", trackingObject);
          sendTracking(trackingObject);
          */

          // Attempt to recover if it's a recoverable error
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Try to recover network error
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        
          onError?.(data);
        });
        
        /*QUALITY IMPROVE CODE STARTS*/
        // hls.config.abrEwmaDefaultEstimate = bandwidthEstimate;
        // hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        //   console.log('data......',data)
        //   hls.startLevel = data.levels.findIndex(l => l.bitrate >= bandwidthEstimate);
        // });
        // hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        //   console.log('bandwidthEstimate', bandwidthEstimate)
        //   bandwidthEstimate = hls.bandwidthEstimate;
        // });
        /*QUALITY IMPROVE CODE ENDS*/
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!paused) videoElement.play().catch(onError);
        });
        videoElement.hlsInstance = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari HLS support
        videoElement.src = src;
        videoElement.addEventListener('loadedmetadata', () => {
          if (!paused) videoElement.play().catch(onError);
        });
      }
    } else {
      // Regular MP4 or other format
      // MP4 or standard video
      videoElement.src = src;
      if (!paused) videoElement.play().catch(onError);
    }
    return () => {
      if (videoElement && videoElement.hlsInstance) {
        videoElement.hlsInstance.destroy();
        videoElement.hlsInstance = null;
      }
    };
  }, [src, videoElement]);


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

    const {
      page_name_from_body_tag,
      scope_from_body_tag,
      data_global_from_body_tag,
      page_version,
      page_type,
      tab_data
    } = getDataFromDOMNodes();

    let data_custom_info_global = data_global_from_body_tag;

    if(Object.keys(tab_data).length > 0) {
      data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
    }

    const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);



    const paramsForCustomEvent = {
      event: event,
      stage: STAGE_FINAL,
      section: section_name ,
      referrer: referrer,
      scope: scope_from_body_tag,
      page_name : page_name || page_name_from_body_tag,
      custom_object : custom_object_new,
      page_version: page_version,
      page_type: page_type
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
    if (videoElement && !errorOccurredRef.current) {

      const {
        page_name_from_body_tag,
        scope_from_body_tag,
        data_global_from_body_tag,
        page_version,
        page_type,
        tab_data
      } = getDataFromDOMNodes();
  
      let data_custom_info_global = data_global_from_body_tag;
  
      if(Object.keys(tab_data).length > 0) {
        data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
      }
  
      const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);

      isMetadataLoadedRef.current = true;
      // PLAYER_LOADED
      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYER_LOADED,
        total_duration: videoElement.duration,
        scope: scope_from_body_tag,
        page_name : page_name || page_name_from_body_tag,
        custom_object : custom_object_new,
        page_version: page_version,
        page_type: page_type
      };
      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );
      console.log("Video Tracking : PLAYER_LOADED : ", trackingObject);
      sendTracking(trackingObject);

      onLoad?.(videoElement);
    }
  }, [onLoad]);

    
    const handleLoadStart = () => {
      if (videoElement) {
        // PLAYER_START

        const {
          page_name_from_body_tag,
          scope_from_body_tag,
          data_global_from_body_tag,
          page_version,
          page_type,
          tab_data
        } = getDataFromDOMNodes();
    
        let data_custom_info_global = data_global_from_body_tag;
    
        if(Object.keys(tab_data).length > 0) {
          data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
        }
    
        const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);
  

        const updated_trackingParams = {
          ...trackingParams,
          event: EVENT_PLAYER_LOADED,
          scope: scope_from_body_tag,
          page_name : page_name || page_name_from_body_tag,
          custom_object : custom_object_new,
          page_version: page_version,
          page_type: page_type
        };
        const trackingObject = getTrackingObjectForVideoTracking(
          updated_trackingParams
        );
        console.log("Video Tracking : PLAYER_LOADED : ", trackingObject);
        sendTracking(trackingObject);
      }
    };

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
    // PLAYBACK_END

    const {
      page_name_from_body_tag,
      scope_from_body_tag,
      data_global_from_body_tag,
      page_version,
      page_type,
      tab_data
    } = getDataFromDOMNodes();

    let data_custom_info_global = data_global_from_body_tag;

    if(Object.keys(tab_data).length > 0) {
      data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
    }

    const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);


    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_END,
      current_duration: videoElement.currentTime,
      scope: scope_from_body_tag,
      page_name : page_name || page_name_from_body_tag,
      custom_object : custom_object_new,
      page_version: page_version,
      page_type: page_type
    };
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
    console.log("Video Tracking : PLAYBACK_END : ", trackingObject);
    onEnd?.();
  };

  const handleDurationChange = () => {
    if (!isMetadataLoadedRef.current) return;
    // PLAYBACK_DURATION_CHANGE

    const {
      page_name_from_body_tag,
      scope_from_body_tag,
      data_global_from_body_tag,
      page_version,
      page_type,
      tab_data
    } = getDataFromDOMNodes();

    let data_custom_info_global = data_global_from_body_tag;

    if(Object.keys(tab_data).length > 0) {
      data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
    }

    const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);


    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_DURATION_CHANGE,
      total_duration: videoElement.duration,
      scope: scope_from_body_tag,
      page_name : page_name || page_name_from_body_tag,
      custom_object : custom_object_new,
      page_version: page_version,
      page_type: page_type
    };
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
    console.log("Video Tracking : PLAYBACK_DURATION_CHANGE : ", trackingObject);
  };

  const onPlayHandle = () => {
    if (!videoElement) return;
    if (videoElement) {
      // PLAYBACK_START

      const {
        page_name_from_body_tag,
        scope_from_body_tag,
        data_global_from_body_tag,
        page_version,
        page_type,
        tab_data
      } = getDataFromDOMNodes();
  
      let data_custom_info_global = data_global_from_body_tag;
  
      if(Object.keys(tab_data).length > 0) {
        data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
      }
  
      const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);


      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYBACK_START,
        current_duration: videoElement.currentTime,
        scope: scope_from_body_tag,
        page_name : page_name || page_name_from_body_tag,
        custom_object : custom_object_new,
        page_version: page_version,
        page_type: page_type
      };
      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );
      console.log("Video Tracking : PLAYBACK_START: ", trackingObject);
      sendTracking(trackingObject);
    }
    onPlay?.();
  }

  const onPauseHandle = () => { 
    if (!videoElement) return;
    // PAUSE Tracking
    if (videoElement) {

      const {
        page_name_from_body_tag,
        scope_from_body_tag,
        data_global_from_body_tag,
        page_version,
        page_type,
        tab_data
      } = getDataFromDOMNodes();
  
      let data_custom_info_global = data_global_from_body_tag;
  
      if(Object.keys(tab_data).length > 0) {
        data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
      }
  
      const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);


      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYBACK_PAUSE,
        current_duration: videoElement.currentTime,
        scope: scope_from_body_tag,
        page_name : page_name || page_name_from_body_tag,
        custom_object : custom_object_new,
        page_version: page_version,
        page_type: page_type
      };
      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );
      console.log("Video Tracking : PLAYBACK_PAUSE: ", trackingObject);
      sendTracking(trackingObject);
    }
    onPause?.();
  }
  
  const onErrorHandle = () => {
    if (!videoElement) return;
  
    const {
      page_name_from_body_tag,
      scope_from_body_tag,
      data_global_from_body_tag,
      page_version,
      page_type,
      tab_data
    } = getDataFromDOMNodes();

    let data_custom_info_global = data_global_from_body_tag;

    if(Object.keys(tab_data).length > 0) {
      data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
    }
  
    const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);



    errorOccurredRef.current = true;
  
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_ERROR_RETRY,
      current_duration: videoElement.currentTime,
      scope: scope_from_body_tag,
      page_name : page_name || page_name_from_body_tag,
      custom_object : custom_object_new,
      page_version: page_version,
      page_type: page_type
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(updated_trackingParams);
    console.log("Video Tracking : PLAYBACK_ERROR_RETRY : ", trackingObject);
    sendTracking(trackingObject);
  
    onError?.();
  };
  
  useEffect(() => {
    if (!videoElement) return;
    videoElement.addEventListener('error', onErrorHandle);
    return () => {
      videoElement.removeEventListener('error', onErrorHandle);
    };
  }, [onErrorHandle]);


  useEffect(() => {
    const handleOnline = async () => {
      if (!videoElement || !errorOccurredRef.current) return;
      console.log('Network is back. Trying to reload and resume video...');
      try {
        const resumeTime = videoElement.currentTime;
        videoElement.load(); // Reload the video element
        videoElement.currentTime = resumeTime;
        await videoElement.play(); // Try to resume playback
        errorOccurredRef.current = false; // Reset error flag on success
      } catch (err) {
        console.warn('Retry playback failed:', err);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [videoElement]);
  

  useEffect(() => {
    const handleStalled = () => {
      console.log("Video is stalled (likely due to network).");
    };
    if (!videoElement || !errorOccurredRef.current) return;
  
    videoElement.addEventListener('stalled', handleStalled);
    return () => {
      videoElement.removeEventListener('stalled', handleStalled);
    };
  }, [videoElement]);
  
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
        // onDurationChange={handleDurationChange}        
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