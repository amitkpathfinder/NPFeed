import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { NNVideoTrackingPlayer } from '@nnshared/nntrackingsdk';
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


const VideoWrapper = (props, ref) => {
const {
  id = null,
  src = null,
  paused = false,
  autoPlay = false,
  muted = false,
  onQualityChange=null,
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
  style,
  preload = 'auto',
  page_name = '',
  section_name = '',
  custom_object = '',
  payload = null,
  search = {},
  page_type = ''
} = props;
  
  if (Platform.OS === 'web') {
    // Web-specific VideoPlayer
    return (
      <VideoPlayer
        // {...props}
        id={id}
        controls={controls}
        src={src}
        style={[styles.container, style]}
        ref={ref}
        preload={preload}
        autoPlay={autoPlay}
        repeat={repeat}
        onEnd={onEnd}
        onBuffer={onBuffer}
        paused={paused}
        muted={muted}
        onLoad={onLoad}
        onProgress={onProgress}
        onError={onError}
        resizeMode={resizeMode}
        onPlay={onPlay}
        onPause={onPause}
        onPlaying={onPlaying}
        page_name={page_name}
        section_name={section_name}
        custom_object={custom_object}
        payload = {payload}
        search = {search}
        page_type = {page_type}
      />
    );
  } else {
    // Native-specific NNVideoTrackingPlayer
    return (
      <NNVideoTrackingPlayer
        // {...props}
        id={id}
        controls={controls}
        source={{ uri: src }}
        style={[styles.container, style]}
        ref={ref}
        repeat={repeat}
        autoPlay={autoPlay}
        muted={muted}
        onEnd={onEnd}
        onBuffer={onBuffer}
        paused={paused}
        onLoad={onLoad}
        onProgress={onProgress}
        onError={onError}
        resizeMode={resizeMode}
        onReadyForDisplay={onReadyForDisplay}
        preload={preload}
        page_name={page_name}
        section_name={section_name}
        custom_object={custom_object}
        payload = {payload}
        search = {search}
        page_type = {page_type}
      />
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
});

export default React.forwardRef(VideoWrapper);