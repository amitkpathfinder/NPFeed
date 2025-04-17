import React, { useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Platform,
} from 'react-native';
import Video from 'react-native-video';

const VideoPlayer = ({
  id,
  src,
  isPaused,
  repeat=false,
  poster,
  onLoad,
  onEnd=null,
  onReadyForDisplay,
  onProgress,
  currentTime
}) => {
  const videoRef = useRef(null);
  // Handle seeking to the currentTime when the video is remounted or paused state changes
  // useEffect(() => {
  //   if (videoRef.current && currentTime > 0 && isPaused) {
  //     // When paused, ensure we're at the right position when it gets played again
  //     videoRef.current.seek(currentTime);
  //   }
  // }, [isPaused]);

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          videoID={id}
          ref={videoRef}
          source={src}
          onLoad={
            (e) => {
              onLoad(e);
              console.log('Onload Called', id+"|"+e.duration)
            }
          }
          onReadyForDisplay={onReadyForDisplay}
          onEnd={
            ()=>{
              onEnd?.();
            }
          }
          style={styles.backgroundVideo} 
          paused={isPaused}
          repeat={repeat}
          // disableFocus={false}
          resizeMode="contain"
          
          // {...(Platform.OS !== 'ios' && {
          //   poster: { source: { uri: poster } },
          // })}
          onProgress={(data) => {
            onProgress(data);
            // console.log('working...');
          }}

          // onBandwidthUpdate={(bandwidth) => {
          //   console.log(
          //     `Bandwidth Update - 
          //     Current: ${bandwidth.bitrate},  ${bandwidth.height}
          //     bps (${(bandwidth.bitrate / 1000000).toFixed(2)} Mbps)`
          //   );
          // }}
          // selectedVideoTrack={{
          //   type: "resolution",
          //   value: 720
          // }}
          // onRenditionChange={(rendition) => {
          //   if (rendition) {
          //     setCurrentRendition(rendition);
          //     console.log('Current Rendition:', rendition);
          //   }
          // }}
          // onPlaybackStateChanged={(data)=>
          //   {console.log('-------Isplaying',+data.isPlaying)}
          // }
          // reportBandwidth={true}
          // progressUpdateInterval={5000}
          // rate={1.0}
          // ignoreSilentSwitch="ignore"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  videoContainer: {
    width: '100%',
    position: 'relative',
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
  }
});

export default VideoPlayer;
