import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Platform,
} from 'react-native';
import Video from 'react-native-video';

const VideoPlayer = React.forwardRef(({
  id,
  src,
  isPaused,
  repeat=false,
  controls=false,
  onBuffer,
  poster,
  onLoad,
  onEnd=null,
  onReadyForDisplay,
  onProgress,
  // currentTime,
  resizeMode,
  NPFeedPreload=false
}, ref) => {
  // const reference = useRef(null);
  // Handle seeking to the currentTime when the video is remounted or paused state changes
  // useEffect(() => {
  //   if (reference.current && currentTime > 0 && isPaused) {
  //     // When paused, ensure we're at the right position when it gets played again
  //     reference.current.seek(currentTime);
  //   }
  // }, [isPaused]);

  const reference = useRef(null);
  const onreadyReference = useRef(false);
  const onLoadReference = useRef(false);
  
  const currentTimeRef = useRef(0);
  const [currentTime, setCurrentTime] = useState(0);
 
  useEffect(() => {
    
    // PAUSE Tracking
    if(reference.current && onreadyReference.current && isPaused){
     
      reference.current = true;
      
      console.log("Video Tracking : ONACTION_PLAYBACK_PAUSE : ",id);
      // console.log(`Video playback time : ${id} `,reference.current);
      console.log("Paused at:", currentTimeRef.current); 
    }
    else
    if(reference.current && onreadyReference.current && !isPaused){
      // PLAYBACK_START
   

    console.log("Video Tracking : ONACTION_PLAYBACK_START : ",id);
    // console.log(`Video playback time : ${id} `,reference.current);
    console.log("Paused at:", currentTimeRef.current); 
    }

  },[isPaused]);

  const override_onReadyForDisplay = () => {
    console.log('......................Entered');
   if (!onreadyReference.current) {
      console.log(`Video Tracking : PLAYBACK_START ${id}: onReadyForDisplay`);
      console.log(currentTime)
      onreadyReference.current=true;
    } 
    else{
      console.log(`Already Called ${id}: onReadyForDisplay`)
    }
    if(onReadyForDisplay) {
        onReadyForDisplay();
      }
  }

  const onLoadHandle = (event) => {
    console.log(`On Load Handle received:${id}`, event);
    onLoadReference.current = true;
    if(onLoad){
      onLoad(event);
    }
  };

  const onPlaybackStateChangedHandle = (data) => {
    console.log('On Playback State Changed:', data);
  };

  const onTimedMetadataHandle = (data) => {
    console.log('onTimedMetadataHandle', data);
  };

  const handleBandwidth = (event) => {
    console.log('Bandwidth update received:', event);
  };

  const handleVideoEnd = () => {
    console.log(`Video ended for ID: ${id}`);
    
    // Call the parent's onEnd callback
    onEnd?.();
    
    // If repeat is enabled, the video will automatically restart
    // If repeat is disabled, manually restart the video
    if (!repeat) {
      if (reference.current && reference.current.seek) {
        try {
          reference.current.seek(0);
          console.log(`Video restarted for ID: ${id}`);
        } catch (error) {
          console.error(`Error seeking video for ID ${id}:`, error);
        }
      } else {
        console.warn(`Video ref not available for ID: ${id}`);
      }
    } else {
      console.log(`Video will auto-repeat for ID: ${id}`);
    }
  };

  // Expose seek method to parent component
  React.useImperativeHandle(ref, () => ({
    seek: (time) => {
      if (reference.current && reference.current.seek) {
        try {
          reference.current.seek(time);
          console.log(`Video seeked to ${time} for ID: ${id}`);
        } catch (error) {
          console.error(`Error seeking video for ID ${id}:`, error);
        }
      } else {
        console.warn(`Video ref not available for ID: ${id}`);
      }
    },
    restart: () => {
      if (reference.current && reference.current.seek) {
        try {
          reference.current.seek(0);
          console.log(`Video restarted for ID: ${id}`);
        } catch (error) {
          console.error(`Error restarting video for ID ${id}:`, error);
        }
      } else {
        console.warn(`Video ref not available for ID: ${id}`);
      }
    }
  }));

  const onProgressHandler = (data) => {
    currentTimeRef.current = data.currentTime; // no re-render
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          videoID={id}
          ref={reference}
          source={src}
          onLoad={onLoadHandle}
          onPlaybackStateChanged={onPlaybackStateChangedHandle}
          onReadyForDisplay={override_onReadyForDisplay}
          onEnd={handleVideoEnd}
          reportBandwidth={true}
          onBandwidthUpdate={handleBandwidth}
          onLoadStart={(data)=>{
            // console.log(`${id} : oLoadStart------>>>>`,data);
            onLoadReference.current = false;
            onreadyReference.current=false;
          }}
          onBuffer={()=>{console.log(`${id} : onBuffer------>>>>`);}}
          onTimedMetadata={onTimedMetadataHandle}
          onProgress={onProgressHandler}
          onSeek={(data)=>{
            console.log(`${id} : onSeek------>>>>`,data);
          }}
          progressUpdateInterval={200}
          style={styles.backgroundVideo} 
          autoPlay={true}
          paused={isPaused}
          repeat={repeat}
          // disableFocus={false}
          resizeMode={resizeMode}
          
          // {...(Platform.OS !== 'ios' && {
          //   poster: { source: { uri: poster } },
          // })}

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
});

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
