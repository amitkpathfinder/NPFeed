import React, { useMemo } from 'react';
import { StyleSheet, Platform } from 'react-native';
import VideoPlayer from '../Player';

/**
 * VideoWrapper component that abstracts video player implementation for Web and Native platforms.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the video
 * @param {string} props.src - Source URL of the video
 * @param {boolean} [props.paused=true] - Whether the video is paused by default
 * @param {boolean} [props.autoPlay=false] - Whether the video should autoplay
 * @param {boolean} [props.muted=true] - Whether the video should start muted
 * @param {Function} [props.onQualityChange] - Callback for quality change event
 * @param {Function} [props.onReadyForDisplay] - Callback when video is ready to display
 * @param {Function} [props.onBuffer] - Callback for buffering event
 * @param {Function} [props.onPlaying] - Callback when video starts playing
 * @param {Function} [props.onLoad] - Callback when video is loaded
 * @param {Function} [props.onError] - Callback for error events
 * @param {Function} [props.onPlay] - Callback for play event
 * @param {Function} [props.onPause] - Callback for pause event
 * @param {Function} [props.onEnd] - Callback for video end event
 * @param {Function} [props.onProgress] - Callback for progress updates
 * @param {string} [props.resizeMode='none'] - Resize mode for the video
 * @param {boolean} [props.controls=false] - Whether to show video controls
 * @param {boolean} [props.repeat=true] - Whether the video should loop
 * @param {string} [props.page_name=''] - Page name for tracking
 * @param {string} [props.section_name=''] - Section name for tracking
 * @param {Object} [props.custom_object=''] - Custom metadata object for tracking
 * @param {Object} [props.style] - Custom styles
 * @param {string} [props.preload] - Preload attribute for the video 
 * [web HTML5 video - preload = none|auto|metadata|''(auto)  
 * Note: autoplay has precedence over preload attribute]
 * 
 * @param {React.Ref} ref - Forwarded ref for the video player
 * @returns {JSX.Element} - Rendered VideoWrapper component
 * 
 */

const VideoWrapper = (props, refs) => {
  const {
    id = null,
    src = null,
    paused = true,
    autoPlay = false,
    muted = true,
    onQualityChange = null,
    onReadyForDisplay = null,
    onBuffer = null,
    onPlaying = null,
    onLoad = null,
    onError = null,
    onPlay = null,
    onPause = null,
    onEnd = null,
    onProgress = null,
    resizeMode = 'none',
    controls = false,
    repeat = false,
    page_name = '',
    section_name = '',
    custom_object = '',
    style,
    preload = true,
    currentTime
  } = props;

  // **Optimized: Memoize the platform-specific component selection**
  // const VideoComponent = useMemo(() => {
  //   return Platform.OS === 'web' ? VideoPlayer : NNVideoTrackingPlayer;
  // }, []);

  return (
    <VideoPlayer
      id={id}
      controls={controls}
      src={{ uri: src }}
      //src={Platform.OS === 'web' ? src : undefined}
      style={[styles.container, style]}
      ref={refs}
      repeat={repeat}
      autoPlay={autoPlay}
      muted={muted}
      onEnd={onEnd}
      currentTime={currentTime}
      onBuffer={onBuffer}
      onQualityChange={onQualityChange}
      onReadyForDisplay={onReadyForDisplay}
      isPaused={paused}
      onLoad={onLoad}
      hideShutterView={true}
      // maxBitrate={10000}
      // initialBitrateEstimate={4000000}
      onVideoResolutionChange={res => console.log('resolution',res)}
          // videoResolution={'720p'}
      // selectedVideoTrack={{
      //   type: "resolution",
      //   value: "720"
      // }}
      onProgress={onProgress}
      onError={onError}
      resizeMode={resizeMode}
      onPlay={onPlay}
      onPause={onPause}
      onPlaying={onPlaying}
      preload={preload}
      page_name={page_name}
      section_name={section_name}
      custom_object={custom_object}
      NPFeedPreload={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});

export default React.forwardRef(VideoWrapper);
