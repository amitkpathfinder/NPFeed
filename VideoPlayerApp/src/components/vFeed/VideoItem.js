import React, { useRef, useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import VideoOverlay from './VideoOverlay';

// This is a wrapper component to properly handle refs with VideoOverlay
const VideoItem = ({ 
  index, 
  src, 
  defaultImg, 
  isPaused, 
  isMuted, 
  lastPosition = 0,
  onProgress,
  onReadyForDisplay,
  dimensions
}) => {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const { width, height } = dimensions;
  
  // Handle seeking to last position when video becomes ready
//   useEffect(() => {
//     if (isReady && lastPosition > 0 && videoRef.current) {
//       try {
//         setTimeout(() => {
//           if (videoRef.current && videoRef.current.seek) {
//             videoRef.current.seek(lastPosition);
//           }
//         }, 200);
//       } catch (err) {
//         console.log("Error seeking:", err);
//       }
//     }
//   }, [isReady, lastPosition]);

//   const handleReady = () => {
//     console.log('---------------------',src)
//     setIsReady(true);
//     if (onReadyForDisplay) {
//       onReadyForDisplay(index);
//     }
//   };

  return (
    <View style={{ width, height, backgroundColor: '#000' }}>
      <VideoOverlay
        ref={videoRef}
        videoId={`video_${index}`}
        src={src}
        defaultImg={defaultImg}
        isPaused={isPaused}
        isAutoPlay={false}
        muted={isMuted}
        resizeMode="cover"
        controls={false}
        repeat={true}
        widthFromParent={width}
        heightFromParent={height}
        page_name="VideoFeed"
        section_name="Reels"
        custom_object={{ feedIndex: index }}
        onProgress={onProgress}
        //onReadyForDisplay={handleReady}
        loadingIndicatorStyle={{
          color: 'white',
          size: 'large',
          style: { transform: [{ scale: 1.5 }] }
        }}
      />
    </View>
  );
};

export default VideoItem;