import React, { useRef, useState, useCallback } from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import BaseVideoPlayer from './BaseVideoPlayer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const videos = [
  { id: '1', src: 'https://imagecdn.99acres.com/hls/case14/master.m3u8' },
  { id: '2', src: 'https://flipfit-cdn.akamaized.net/flip_hls/662aae7a42cd740019b91dec-3e114f/video_h1.m3u8' },
  { id: '3', src: 'https://imagecdn.99acres.com/hls/case12/master.m3u8' },
];

const VideoFeed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);

      // Pause all videos except the visible one
      Object.keys(videoRefs.current).forEach((key) => {
        if (Number(key) === newIndex) {
          videoRefs.current[key]?.play();
        } else {
          videoRefs.current[key]?.pause();
        }
      });
    }
  }, []);

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
      renderItem={({ item, index }) => (
        <View style={styles.videoContainer}>
          <BaseVideoPlayer
            ref={(el) => (videoRefs.current[index] = el)}
            src={item.src}
            isPaused={index !== currentIndex}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoFeed;
