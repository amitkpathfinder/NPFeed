import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import { useVideoContext } from './VideoContext';
import VideoOverlay from './VideoOverlay';

const { width, height } = Dimensions.get('window');

const VerticalVideoFeed = ({ videos = [] }) => {
  // Store a direct reference to which index is currently active
  const activeIndexRef = useRef(0);
  const flatListRef = useRef(null);
  const { isMuted } = useVideoContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoData, setVideoData] = useState([]);
  
  // Initialize video data when videos prop changes
  useEffect(() => {
    if (videos && videos.length > 0) {
      const formattedData = videos.map((video, index) => ({
        ...video,
        key: `video-${index}`,
        lastPosition: 0
      }));
      setVideoData(formattedData);
    } else {
      setVideoData([]);
    }
  }, [videos]);
  
  // Progress tracking function
  const handleProgress = (index, progress) => {
    if (!progress || typeof progress.currentTime !== 'number' || !videoData[index]) return;
    
    // Update last position without triggering re-render
    const currentTime = progress.currentTime;
    videoData[index].lastPosition = currentTime;
  };
  
  // The core viewability detection function
  const onViewableItemsChanged = ({ viewableItems }) => {
    if (!viewableItems || viewableItems.length === 0) return;
    
    // Find the most visible item
    let mostVisible = viewableItems[0];
    for (const item of viewableItems) {
      if (item.percentVisible > mostVisible.percentVisible) {
        mostVisible = item;
      }
    }
    
    if (mostVisible && mostVisible.percentVisible > 0.5) {
      const newIndex = mostVisible.index;
      
      // Only update if it's a different index to avoid unnecessary re-renders
      if (activeIndexRef.current !== newIndex) {
        console.log(`Changing active index from ${activeIndexRef.current} to ${newIndex}`);
        activeIndexRef.current = newIndex;
        setActiveIndex(newIndex);
      }
    }
  };
  
  // Use viewability config
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100
  };
  
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged }
  ]);
  
  // When component unmounts, make sure all videos are paused
  useEffect(() => {
    return () => {
      // Cleanup function
      activeIndexRef.current = -1;
    };
  }, []);

  // If no videos, return empty view
  if (!videoData.length) {
    return <View style={styles.emptyContainer} />;
  }

  // Render each video item
  const renderItem = ({ item, index }) => {
    // Determine if this video should be playing
    const shouldPlay = index === activeIndex;
    
    return (
      <View style={styles.videoContainer}>
        <VideoOverlay
          key={`video-overlay-${index}`}
          videoId={`video_${index}`}
          src={item.video}
          defaultImg={item.defaultImg || null}
          isPaused={!shouldPlay} // Only play the active video
          isAutoPlay={false} // Never auto-play
          muted={isMuted}
          resizeMode="cover"
          controls={false}
          repeat={false}
          widthFromParent={width}
          heightFromParent={height}
          page_name="VideoFeed"
          section_name="Reels"
          custom_object={{ feedIndex: index }}
          onProgress={(progress) => handleProgress(index, progress)}
          position={item.lastPosition || 0}
          preload={index <= activeIndex + 1 && index >= activeIndex - 1} // Only preload adjacent videos
          loadingIndicatorStyle={{
            color: 'white',
            size: 'large',
            style: { transform: [{ scale: 1.5 }] }
          }}
        />
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={videoData}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      onMomentumScrollEnd={() => {
        // Force check viewability after scroll ends
        if (flatListRef.current) {
          flatListRef.current.recordInteraction();
        }
      }}
      getItemLayout={(data, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
      style={styles.flatList}
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      windowSize={3}
      removeClippedSubviews={false}
    />
  );
};

const styles = StyleSheet.create({
  flatList: {
    flex: 1
  },
  videoContainer: {
    width,
    height,
    backgroundColor: '#000'
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000'
  }
});

export default VerticalVideoFeed;