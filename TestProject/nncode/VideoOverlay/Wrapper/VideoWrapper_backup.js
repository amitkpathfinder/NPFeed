import React, { useMemo } from 'react';
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
    onQualityChange = null,
    onReadyForDisplay = null,
    onBuffer = null,
    onPlaying = null,
    onLoad = null,
    onLoadStart=null,
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
    preload = 'auto',
    payload = null,
    search = null,
    page_type = null
  } = props;

  // **Optimized: Memoize the platform-specific component selection**
  const VideoComponent = useMemo(() => {
    return Platform.OS === 'web' ? VideoPlayer : NNVideoTrackingPlayer;
  }, []);

  return (
    <VideoComponent
    // {...props}
      BBPlayer={'BBPlayer'}
      id={id}
      controls={controls}
      source={Platform.OS !== 'web' ? { uri: src} : undefined}
      src={Platform.OS === 'web' ? src : undefined}
      style={[styles.container, style]}
      ref={ref}
      repeat={repeat}
      autoPlay={autoPlay}
      muted={muted}
      onEnd={onEnd}
      onBuffer={onBuffer}
      // onBandwidthUpdate={(e)=>{console.log('.......................Bandwidth')}}
      // reportBandwidth={true}
      onLoadStart={onLoadStart}
      onQualityChange={onQualityChange}
      onReadyForDisplay={onReadyForDisplay}
      paused={paused}
      onLoad={onLoad}
      // getCurrentPosition={()=>{console.log('.......................{',data+"}")}}
      hideShutterView={true}
      // maxBitrate={10000}
      // initialBitrateEstimate={4000000}
      // onVideoResolutionChange={res => console.log('resolution',res)}
      //     videoResolution={'720p'}
      // selectedVideoTrack={{
      //   type: "resolution",
      //   value: "720"
      // }}
      onProgress={onProgress}
      onError={(error)=>console.log('This is an error', error)}
      resizeMode={resizeMode}
      onPlay={onPlay}
      onPause={onPause}
      onPlaying={onPlaying}
      preload={preload}
      page_name={page_name}
      section_name={section_name}
      custom_object={custom_object}
      payload = {payload}
      search = {search}
      page_type = {page_type}
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




// import React from 'react';
// import { StyleSheet, Platform } from 'react-native';
// import { NNVideoTrackingPlayer } from '@nnshared/nntrackingsdk';
// import VideoPlayer from '../Player';

// const VideoWrapper = ({
// id=null,
// src=null,
// paused = true,
// autoPlay=false,
// muted=true,
// onQualityChange=null,
// onReadyForDisplay=null,
// onBuffer=null,
// onPlaying = null,
// onLoad = null,
// onError = null,
// onPlay=null,
// onPause=null,
// onEnd = null,
// onProgress = null,
// resizeMode = 'none',
// controls = false,
// repeat = true,
// page_name='',
// section_name='',
// custom_object='',
// style,
// preload,
// }, ref) => {
//   // console.log('mutedmutedmutedmutedmuted', muted);

//   if (Platform.OS === 'web') {
//     // Web-specific VideoPlayer
//     return (
//       <VideoPlayer
//         id={id}
//         controls={controls}
//         src={src}
//         style={style}
//         ref={ref}
//         preload={preload}
//         autoPlay={autoPlay}
//         repeat={repeat}
//         onEnd={onEnd}
//         onBuffer={onBuffer}
//         // onQualityChange={(quality) => {
//         //   console.log('Current quality:', quality)}}
//         // onBandwidthUpdate={onBandwidth}
//         onQualityChange={onQualityChange}
//         isPaused={paused}
//         muted={muted}
//         onLoad={onLoad}
//         onProgress={onProgress}
//         onError={onError}
//         resizeMode={resizeMode}
//         onPlay={onPlay}
//         onPause={onPause}
//         onReadyForDisplay={onReadyForDisplay}
//         onPlaying={onPlaying}
//         page_name={page_name}
//         section_name={section_name}
//         custom_object={custom_object}
//       />
//     );
//   } else {
//     // Native-specific NNVideoTrackingPlayer
//     return (
//       <NNVideoTrackingPlayer
//         id={id}
//         controls={controls}
//         source={{ uri: src }}
//         style={[styles.container, style]}
//         ref={ref}
//         repeat={repeat}
//         // selectedVideoTrack={{
//         //   type: 'resolution',
//         //   value: 360,  // Set default resolution (Change this to your preferred bitrate)
//         // }}
//         // onBandwidth={onBandwidth}
//         // onQualityChange={onQualityChange}
//         autoPlay={autoPlay}
//         muted={muted}
//         onEnd={onEnd}
//         onBuffer={onBuffer}
//         // renderLoader={() => (
//         //   <View>
//         //     <Text>Custom Loader</Text>
//         //   </View>)}
//         paused={paused}
//         onLoad={onLoad}
//         onProgress={onProgress}
//         onError={onError}
//         resizeMode={resizeMode}
//         onReadyForDisplay={onReadyForDisplay}
//         preload={preload}
//         page_name={page_name}
//         section_name={section_name}
//         custom_object={custom_object}
//       />
//     );
//   }
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     height: '100%'
//   },
// });

// export default React.forwardRef(VideoWrapper);
