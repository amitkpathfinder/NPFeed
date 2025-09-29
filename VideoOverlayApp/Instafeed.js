import React, { useRef, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import VideoOverlay from "./player/VideoOverlay";

const { height } = Dimensions.get("window");

// 🔹 Example video list
const videos = [
  {
    id: "1",
    video:
      "https://imagecdn.99acres.com/hls-test/r4pb7y4_1732648572_533683783/r4pb7y4_1732648572_533683783_playlist.m3u8",
    defaultImg:
      "https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
  },
  {
    id: "2",
    video:
      "https://imagecdn.99acres.com/hls-test/njoxzj7_1732674649_533691647/njoxzj7_1732674649_533691647_playlist.m3u8",
    defaultImg:
      "https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
  },
  {
    id: "3",
    video:
      "https://imagecdn.99acres.com/hls-test/330hovz_1732767002_533961645/330hovz_1732767002_533961645_playlist.m3u8",
    defaultImg:
      "https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
  },
  {
    id: "4",
    video:
      "https://imagecdn.99acres.com/hls-test/dy6fwis_1732672416_533690099/dy6fwis_1732672416_533690099_playlist.m3u8",
    defaultImg:
      "https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
  },
  // add more here
];

export default function InstaFeed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setActiveIndex(index);
    }
  }, []);

  const renderItem = ({ item, index }) => {
    const isActive = index === activeIndex;
    const preload =
      index === activeIndex + 1 || index === activeIndex + 2; // preload next 2

    return (
      <View style={styles.videoContainer}>
        <VideoOverlay
          key={item.id}
          src={item.video}
          defaultImg={item.defaultImg}
          isPaused={!isActive} // only active plays
          preload={preload} // 👈 implement preload in VideoOverlay
          showControls={false}
          repeat={true}
          resizeMode={'contain'}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={height}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    height: height,
    width: "100%",
    backgroundColor: "black",
  },
});
