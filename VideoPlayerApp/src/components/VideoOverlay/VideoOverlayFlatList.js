import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback } from 'react-native';
import VideoOverlay from '../vFeed/VideoOverlay';
import VideoWrapper from './Wrapper/VideoWrapper';

const { width, height } = Dimensions.get('window');

const VideoOverlayFlatList = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [visibleIndices, setVisibleIndices] = useState([]);
  const [preloadIndices, setPreloadIndices] = useState([]); // Track indices of videos to preload
  const videoStates = useRef({}); // Store state for each video
  const flatListRef = useRef(null);
  const videoRefs = useRef({}); // Store refs for each video item

  const [watchTime, setWatchTime] = useState(0);
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        //const response = await fetch('http://192.168.1.15/backend.json');
        const response = await fetch('http://10.112.4.67/backend.json');
        const data = await response.json();
        setVideos(data);
        
        // Initialize videoStates with default values for each video
        const initialStates = {};
        data.forEach((video) => {
          initialStates[video.id] = {
            paused: true,
            currentTime: 0,
            duration: 0,
            loaded: false,
            preloaded: false
          };
        });
        videoStates.current = initialStates;
        
        // Set initial preload indices
        updatePreloadIndices(1);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };
    fetchVideos();
  }, []);
  
  // Function to update which videos should be preloaded
  const updatePreloadIndices = (currentIdx) => {
    const nextIndices = [];
    
    // Add next two videos to preload
    for (let i = 1; i <= 2; i++) {
      const nextIndex = currentIdx + i;
      if (nextIndex < videos.length) {
        nextIndices.push(nextIndex);
      }
    }
    
    setPreloadIndices(nextIndices);
  };

  // Update preload indices whenever current index changes
  useEffect(() => {
    updatePreloadIndices(currentIndex);
    lastUpdateTime.current = 0;
    setWatchTime(0);
  }, [currentIndex, videos.length]);

  // Improved viewability handler that tracks both visible and non-visible items
  const onViewableItemsChanged = useRef(({ viewableItems, changed }) => {
    // Update visible indices list
    const newVisibleIndices = viewableItems.map(item => item.index);
    setVisibleIndices(newVisibleIndices);
    
    // Handle primary visible item (same as before)
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      const newVideoId = viewableItems[0].item.id;
      
      if (newIndex !== currentIndex) {
        // Pause the previous video if it exists
        if (videos[currentIndex]) {
          const prevVideoId = videos[currentIndex].id;
          videoStates.current[prevVideoId] = {
            ...videoStates.current[prevVideoId],
            paused: true
          };
        }
        
        // Play the new video if it's loaded
        if (videoStates.current[newVideoId]) {
          videoStates.current[newVideoId] = {
            ...videoStates.current[newVideoId],
            paused: false
          };
        }
        
        setCurrentIndex(newIndex);
      }
    }
    
    // Specifically handle items that changed visibility status
    changed.forEach(item => {
      const videoId = item.item.id;
      
      // If an item is no longer viewable, ensure it's paused
      if (!item.isViewable && videoStates.current[videoId]) {
        videoStates.current[videoId] = {
          ...videoStates.current[videoId],
          paused: true
        };
      }
    });
    
    // Force update to reflect all changes
    setVideos(prev => [...prev]);
  }).current;

  const togglePlayPause = (videoId) => {
    if (videoStates.current[videoId]) {
      videoStates.current[videoId] = {
        ...videoStates.current[videoId],
        paused: !videoStates.current[videoId].paused
      };
      // Force update to rerender
      setVideos([...videos]);
    }
  };

  const handleOnLoad = (videoId, data) => {
    const videoIndex = videos.findIndex(v => v.id === videoId);
    const isVisible = videoIndex === currentIndex;
    
    videoStates.current[videoId] = {
      ...videoStates.current[videoId],
      duration: data.duration,
      loaded: true,
      preloaded: preloadIndices.includes(videoIndex),
      // Automatically play if this is the current video and it's visible
      paused: !isVisible
    };
    // Force update to rerender
    setVideos([...videos]);
  };

  const handleOnProgress = (videoId, data) => {
    if (videoStates.current[videoId]) {
      videoStates.current[videoId] = {
        ...videoStates.current[videoId],
        currentTime: data.currentTime
      };
      // We don't need to force update here as it would cause too many renders
    }
    // console.log('calling..............................',data);
    const { currentTime } = data;
    
    if (currentTime - lastUpdateTime.current >= 5) {
      lastUpdateTime.current = currentTime;
      setWatchTime(prevTime => prevTime + 5);
      console.log(`User has watched videoid:${videoId} : ${watchTime + 5} seconds of the video.`);
    }
  };

  // More sensitive viewability configuration for better detection
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Lower threshold to detect earlier
    minimumViewTime: 200, // Respond faster to visibility changes
  };

  const renderVideoItem = ({ item, index }) => {

    const videoState = videoStates.current[item.id] || {
      paused: index !== currentIndex,
      currentTime: 0,
      duration: 0,
      loaded: false,
      preloaded: false
    };
    
    // Check if this item is currently visible in the viewport
    const isVisible = visibleIndices.includes(index);
    
    // Check if this item should be preloaded
    const shouldPreload = preloadIndices.includes(index);
    
    // If not visible and not preloading, ensure it's paused
    const shouldBePaused = (!isVisible && !shouldPreload) || videoState.paused;
    
    // For preloaded videos, we want to load them but keep them paused
    const isPreloading = shouldPreload && !isVisible;

    return (
      <View style={[styles.videoContainer]}>
        <TouchableWithoutFeedback onPress={() => togglePlayPause(item.id)}>
          <View>
            <VideoOverlay
              videoId={item.id}
              src={item.video}
              ref={(ref) => { videoRefs.current[item.id] = ref; }} // Store ref by ID
              isAutoPlay={index === currentIndex}
              defaultImg={item.defaultImg}
              isPaused={shouldBePaused}
              repeat={false}
              onReadyForDisplay={() => {
                console.log('ReadyForDisplay', item.id);
                if (isPreloading) {
                  // Mark as preloaded when ready for display
                  videoStates.current[item.id] = {
                    ...videoStates.current[item.id],
                    preloaded: true
                  };
                }
              }}
              onLoad={(data) => handleOnLoad(item.id, data)}
              onProgress={(data) => handleOnProgress(item.id, data)}
              currentTime={videoState.currentTime}
              shouldReload={false}
              resizeMode="cover"
              // Set priority to high for preloaded videos to ensure they load quickly
              priority={isVisible || shouldPreload ? "high" : "normal"}
              // For preloaded videos, we want to load them but not necessarily show them
              preload={isPreloading ? "auto" : "none"}
              loadingIndicatorStyle={{
                color: 'white',
                size: 'large',
                style: { transform: [{ scaleX: 2 }, { scaleY: 2 }] },
              }}
            />
            
            <View style={styles.overlayBox}>
              <View style={styles.contentContainer}>
                <Text style={styles.heading}>{item.heading}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.component}>{item.component}</Text>
                <Text style={styles.component}>{item.video}</Text>
                {/* Status indicator with visibility and preload info */}
                <Text style={styles.playState}>
                  {shouldBePaused ? 'Paused' : 'Playing'} | 
                  {isVisible ? 'Visible' : 'Not Visible'} |
                  {shouldPreload ? 'Preloading' : 'Not Preloading'} |
                  {videoState.preloaded ? 'Preloaded' : 'Not Preloaded'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  if (videos.length === 0) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={videos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderVideoItem}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      scrollEventThrottle={16}
      // Keep this false for better viewport detection
      removeClippedSubviews={false}
      initialNumToRender={1} // Increased to load current + 2 preloaded videos
      maxToRenderPerBatch={3}
      windowSize={7} // Increased to better handle preloading
      // Additional scroll end handler for fast scrolls
      onMomentumScrollEnd={(event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const newIndex = Math.round(offsetY / height);
        
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
          // Pause all videos
          Object.keys(videoStates.current).forEach(id => {
            videoStates.current[id] = {
              ...videoStates.current[id],
              paused: true
            };
          });
          
          // Play only the current video
          const currentVideoId = videos[newIndex].id;
          videoStates.current[currentVideoId] = {
            ...videoStates.current[currentVideoId],
            paused: false
          };
          
          setCurrentIndex(newIndex);
          updatePreloadIndices(newIndex);
          setVideos([...videos]); // Force update
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width: width,
    height: height,
    position: 'relative',
    backgroundColor: 'black',
  },
  overlayBox: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'space-between',
    paddingVertical: 20,
    zIndex: 1000,
  },
  contentContainer: {
    padding: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#ccc',
    fontSize: 18,
    marginBottom: 5,
  },
  component: {
    color: '#aaa',
    fontSize: 16,
  },
  playState: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    alignSelf: 'flex-start',
    borderRadius: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#000',
    fontSize: 18,
  },
});

export default VideoOverlayFlatList;

/*FLATLIST?VIDEOOVERLAY */

// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback } from 'react-native';
// import VideoOverlay from '../vFeed/VideoOverlay';
// import VideoWrapper from './Wrapper/VideoWrapper';

// const { width, height } = Dimensions.get('window');

// const VideoOverlayFlatList = () => {
//   const [videos, setVideos] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(1);
//   const [visibleIndices, setVisibleIndices] = useState([]);
//   const videoStates = useRef({}); // Store state for each video
//   const flatListRef = useRef(null);

//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         // const response = await fetch('http://192.168.1.15/backend.json');
//         const response = await fetch('http://10.112.4.67/backend.json');
//         const data = await response.json();
//         setVideos(data);
        
//         // Initialize videoStates with default values for each video
//         const initialStates = {};
//         data.forEach((video) => {
//           initialStates[video.id] = {
//             paused: true,
//             currentTime: 0,
//             duration: 0,
//             loaded: false
//           };
//         });
//         videoStates.current = initialStates;
//       } catch (error) {
//         console.error('Error fetching videos:', error);
//       }
//     };
//     fetchVideos();
//   }, []);

//   // Improved viewability handler that tracks both visible and non-visible items
//   const onViewableItemsChanged = useRef(({ viewableItems, changed }) => {
//     // Update visible indices list
//     const newVisibleIndices = viewableItems.map(item => item.index);
//     setVisibleIndices(newVisibleIndices);
    
//     // Handle primary visible item (same as before)
//     if (viewableItems.length > 0) {
//       const newIndex = viewableItems[0].index;
//       const newVideoId = viewableItems[0].item.id;
      
//       if (newIndex !== currentIndex) {
//         // Pause the previous video if it exists
//         if (videos[currentIndex]) {
//           const prevVideoId = videos[currentIndex].id;
//           videoStates.current[prevVideoId] = {
//             ...videoStates.current[prevVideoId],
//             paused: true
//           };
//         }
        
//         // Play the new video if it's loaded
//         if (videoStates.current[newVideoId]) {
//           videoStates.current[newVideoId] = {
//             ...videoStates.current[newVideoId],
//             paused: false
//           };
//         }
        
//         setCurrentIndex(newIndex);
//       }
//     }
    
//     // Specifically handle items that changed visibility status
//     changed.forEach(item => {
//       const videoId = item.item.id;
      
//       // If an item is no longer viewable, ensure it's paused
//       if (!item.isViewable && videoStates.current[videoId]) {
//         videoStates.current[videoId] = {
//           ...videoStates.current[videoId],
//           paused: true
//         };
//       }
//     });
    
//     // Force update to reflect all changes
//     setVideos(prev => [...prev]);
//   }).current;

//   const togglePlayPause = (videoId) => {
//     if (videoStates.current[videoId]) {
//       videoStates.current[videoId] = {
//         ...videoStates.current[videoId],
//         paused: !videoStates.current[videoId].paused
//       };
//       // Force update to rerender
//       setVideos([...videos]);
//     }
//   };

//   const handleOnLoad = (videoId, data) => {
//     const isVisible = videos.findIndex(v => v.id === videoId) === currentIndex;
    
//     videoStates.current[videoId] = {
//       ...videoStates.current[videoId],
//       duration: data.duration,
//       loaded: true,
//       // Automatically play if this is the current video and it's visible
//       paused: !isVisible
//     };
//     // Force update to rerender
//     setVideos([...videos]);
//   };

//   const handleOnProgress = (videoId, data) => {
//     if (videoStates.current[videoId]) {
//       videoStates.current[videoId] = {
//         ...videoStates.current[videoId],
//         currentTime: data.currentTime
//       };
//       // We don't need to force update here as it would cause too many renders
//     }
//   };

//   // More sensitive viewability configuration for better detection
//   const viewabilityConfig = {
//     itemVisiblePercentThreshold: 50, // Lower threshold to detect earlier
//     minimumViewTime: 200, // Respond faster to visibility changes
//   };

//   const renderVideoItem = ({ item, index }) => {
//     const videoState = videoStates.current[item.id] || {
//       paused: index !== currentIndex,
//       currentTime: 0,
//       duration: 0,
//       loaded: false
//     };
    
//     // Check if this item is currently visible in the viewport
//     const isVisible = visibleIndices.includes(index);
    
//     // If not visible, ensure it's paused regardless of other state
//     const shouldBePaused = !isVisible || videoState.paused;

//     return (
//       <View style={[styles.videoContainer]}>
//         <TouchableWithoutFeedback onPress={() => togglePlayPause(item.id)}>
//           <View>
//             <VideoOverlay
//               videoId={item.id}
//               src={item.video}
//               isAutoPlay={true}
//               defaultImg={item.defaultImg}
//               isPaused={shouldBePaused}
//               onReadyForDisplay={()=>console.log('ReadyForDisplay',item.id)}
//               onLoad={(data) => handleOnLoad(item.id, data)}
//               onProgress={(data) => handleOnProgress(item.id, data)}
//               currentTime={videoState.currentTime}
//               shouldReload={false}
//               resizeMode="cover"
//               loadingIndicatorStyle={{
//                 color: 'white', // Change to desired color
//                 size: 'large', // 'small' | 'large' (Platform dependent)
//                 style: { transform: [{ scaleX: 2 }, { scaleY: 2 }] }, // Custom style
//               }}
//             />
            
//             <View style={styles.overlayBox}>
//               <View style={styles.contentContainer}>
//                 <Text style={styles.heading}>{item.heading}</Text>
//                 <Text style={styles.description}>{item.description}</Text>
//                 <Text style={styles.component}>{item.component}</Text>
//                 <Text style={styles.component}>{item.video}</Text>
//                 {/* Status indicator with visibility info */}
//                 <Text style={styles.playState}>
//                   {shouldBePaused ? 'Paused' : 'Playing'} | {isVisible ? 'Visible' : 'Not Visible'}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </TouchableWithoutFeedback>
//       </View>
//     );
//   };

//   if (videos.length === 0) {
//     return <Text style={styles.loading}>Loading...</Text>;
//   }

//   return (
//     <FlatList
//       ref={flatListRef}
//       data={videos}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={renderVideoItem}
//       pagingEnabled
//       showsVerticalScrollIndicator={false}
//       onViewableItemsChanged={onViewableItemsChanged}
//       viewabilityConfig={viewabilityConfig}
//       scrollEventThrottle={16}
//       // Keep this false for better viewport detection
//       removeClippedSubviews={false}
//       initialNumToRender={2}
//       maxToRenderPerBatch={3}
//       windowSize={5}
//       // Additional scroll end handler for fast scrolls
//       onMomentumScrollEnd={(event) => {
//         const offsetY = event.nativeEvent.contentOffset.y;
//         const newIndex = Math.round(offsetY / height);
        
//         if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
//           // Pause all videos
//           Object.keys(videoStates.current).forEach(id => {
//             videoStates.current[id] = {
//               ...videoStates.current[id],
//               paused: true
//             };
//           });
          
//           // Play only the current video
//           const currentVideoId = videos[newIndex].id;
//           videoStates.current[currentVideoId] = {
//             ...videoStates.current[currentVideoId],
//             paused: false
//           };
          
//           setCurrentIndex(newIndex);
//           setVideos([...videos]); // Force update
//         }
//       }}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   videoContainer: {
//     width: width,
//     height: height,
//     position: 'relative',
//     backgroundColor: 'black',
//   },
//   overlayBox: {
//     position: 'absolute',
//     height: '100%',
//     width: '100%',
//     backgroundColor: 'rgba(0, 0, 0, 0.2)',
//     justifyContent: 'space-between',
//     paddingVertical: 20,
//     zIndex: 1000,
//   },
//   contentContainer: {
//     padding: 20,
//   },
//   heading: {
//     color: '#fff',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   description: {
//     color: '#ccc',
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   component: {
//     color: '#aaa',
//     fontSize: 16,
//   },
//   playState: {
//     color: '#ffffff',
//     fontSize: 14,
//     marginTop: 10,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     padding: 5,
//     alignSelf: 'flex-start',
//     borderRadius: 4,
//   },
//   loading: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     color: '#000',
//     fontSize: 18,
//   },
// });

// export default VideoOverlayFlatList;

// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback } from 'react-native';
// import VideoWrapper from './Wrapper/VideoWrapper';

// const { width, height } = Dimensions.get('window');

// const VideoOverlayFlatList = () => {
//   const [videos, setVideos] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(1);
//   const [visibleIndices, setVisibleIndices] = useState([]);
//   const videoStates = useRef({}); // Store state for each video
//   const flatListRef = useRef(null);

//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         const response = await fetch('http://10.112.4.67/backend.json');
//         const data = await response.json();
//         setVideos(data);
        
//         // Initialize videoStates with default values for each video
//         const initialStates = {};
//         data.forEach((video) => {
//           initialStates[video.id] = {
//             paused: true,
//             currentTime: 0,
//             duration: 0,
//             loaded: false
//           };
//         });
//         videoStates.current = initialStates;
//       } catch (error) {
//         console.error('Error fetching videos:', error);
//       }
//     };
//     fetchVideos();
//   }, []);

//   // Improved viewability handler that tracks both visible and non-visible items
//   const onViewableItemsChanged = useRef(({ viewableItems, changed }) => {
//     // Update visible indices list
//     const newVisibleIndices = viewableItems.map(item => item.index);
//     setVisibleIndices(newVisibleIndices);
    
//     // Handle primary visible item (same as before)
//     if (viewableItems.length > 0) {
//       const newIndex = viewableItems[0].index;
//       const newVideoId = viewableItems[0].item.id;
      
//       if (newIndex !== currentIndex) {
//         // Pause the previous video if it exists
//         if (videos[currentIndex]) {
//           const prevVideoId = videos[currentIndex].id;
//           videoStates.current[prevVideoId] = {
//             ...videoStates.current[prevVideoId],
//             paused: true
//           };
//         }
        
//         // Play the new video if it's loaded
//         if (videoStates.current[newVideoId]) {
//           videoStates.current[newVideoId] = {
//             ...videoStates.current[newVideoId],
//             paused: false
//           };
//         }
        
//         setCurrentIndex(newIndex);
//       }
//     }
    
//     // Specifically handle items that changed visibility status
//     changed.forEach(item => {
//       const videoId = item.item.id;
      
//       // If an item is no longer viewable, ensure it's paused
//       if (!item.isViewable && videoStates.current[videoId]) {
//         videoStates.current[videoId] = {
//           ...videoStates.current[videoId],
//           paused: true
//         };
//       }
//     });
    
//     // Force update to reflect all changes
//     setVideos(prev => [...prev]);
//   }).current;

//   const togglePlayPause = (videoId) => {
//     if (videoStates.current[videoId]) {
//       videoStates.current[videoId] = {
//         ...videoStates.current[videoId],
//         paused: !videoStates.current[videoId].paused
//       };
//       // Force update to rerender
//       setVideos([...videos]);
//     }
//   };

//   const handleOnLoad = (videoId, data) => {
//     const isVisible = videos.findIndex(v => v.id === videoId) === currentIndex;
    
//     videoStates.current[videoId] = {
//       ...videoStates.current[videoId],
//       duration: data.duration,
//       loaded: true,
//       // Automatically play if this is the current video and it's visible
//       paused: !isVisible
//     };
//     // Force update to rerender
//     setVideos([...videos]);
//   };

//   const handleOnProgress = (videoId, data) => {
//     if (videoStates.current[videoId]) {
//       videoStates.current[videoId] = {
//         ...videoStates.current[videoId],
//         currentTime: data.currentTime
//       };
//       // We don't need to force update here as it would cause too many renders
//     }
//   };

//   // More sensitive viewability configuration for better detection
//   const viewabilityConfig = {
//     itemVisiblePercentThreshold: 50, // Lower threshold to detect earlier
//     minimumViewTime: 200, // Respond faster to visibility changes
//   };

//   const renderVideoItem = ({ item, index }) => {
//     const videoState = videoStates.current[item.id] || {
//       paused: index !== currentIndex,
//       currentTime: 0,
//       duration: 0,
//       loaded: false
//     };
    
//     // Check if this item is currently visible in the viewport
//     const isVisible = visibleIndices.includes(index);
    
//     // If not visible, ensure it's paused regardless of other state
//     const shouldBePaused = !isVisible || videoState.paused;

//     return (
//       <View style={[styles.videoContainer]}>
//         <TouchableWithoutFeedback onPress={() => togglePlayPause(item.id)}>
//           <View>
//             <VideoWrapper
//               id={item.id}
//               src={item.video}
//               poster={item.defaultImg}
//               paused={shouldBePaused}
//               onLoad={(data) => handleOnLoad(item.id, data)}
//               onProgress={(data) => handleOnProgress(item.id, data)}
//               currentTime={videoState.currentTime}
//               shouldReload={false}
//               resizeMode="cover"
//             />
            
//             <View style={styles.overlayBox}>
//               <View style={styles.contentContainer}>
//                 <Text style={styles.heading}>{item.heading}</Text>
//                 <Text style={styles.description}>{item.description}</Text>
//                 <Text style={styles.component}>{item.component}</Text>
//                 <Text style={styles.component}>{item.video}</Text>
//                 {/* Status indicator with visibility info */}
//                 <Text style={styles.playState}>
//                   {shouldBePaused ? 'Paused' : 'Playing'} | {isVisible ? 'Visible' : 'Not Visible'}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </TouchableWithoutFeedback>
//       </View>
//     );
//   };

//   if (videos.length === 0) {
//     return <Text style={styles.loading}>Loading...</Text>;
//   }

//   return (
//     <FlatList
//       ref={flatListRef}
//       data={videos}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={renderVideoItem}
//       pagingEnabled
//       showsVerticalScrollIndicator={false}
//       onViewableItemsChanged={onViewableItemsChanged}
//       viewabilityConfig={viewabilityConfig}
//       scrollEventThrottle={16}
//       // Keep this false for better viewport detection
//       removeClippedSubviews={false}
//       initialNumToRender={2}
//       maxToRenderPerBatch={3}
//       windowSize={5}
//       // Additional scroll end handler for fast scrolls
//       onMomentumScrollEnd={(event) => {
//         const offsetY = event.nativeEvent.contentOffset.y;
//         const newIndex = Math.round(offsetY / height);
        
//         if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
//           // Pause all videos
//           Object.keys(videoStates.current).forEach(id => {
//             videoStates.current[id] = {
//               ...videoStates.current[id],
//               paused: true
//             };
//           });
          
//           // Play only the current video
//           const currentVideoId = videos[newIndex].id;
//           videoStates.current[currentVideoId] = {
//             ...videoStates.current[currentVideoId],
//             paused: false
//           };
          
//           setCurrentIndex(newIndex);
//           setVideos([...videos]); // Force update
//         }
//       }}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   videoContainer: {
//     width: width,
//     height: height,
//     position: 'relative',
//     backgroundColor: 'black',
//   },
//   overlayBox: {
//     position: 'absolute',
//     height: '100%',
//     width: '100%',
//     backgroundColor: 'rgba(0, 0, 0, 0.2)',
//     justifyContent: 'space-between',
//     paddingVertical: 20,
//     zIndex: 1000,
//   },
//   contentContainer: {
//     padding: 20,
//   },
//   heading: {
//     color: '#fff',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   description: {
//     color: '#ccc',
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   component: {
//     color: '#aaa',
//     fontSize: 16,
//   },
//   playState: {
//     color: '#ffffff',
//     fontSize: 14,
//     marginTop: 10,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     padding: 5,
//     alignSelf: 'flex-start',
//     borderRadius: 4,
//   },
//   loading: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     color: '#000',
//     fontSize: 18,
//   },
// });

// export default VideoOverlayFlatList;

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback } from 'react-native';
// import VideoWrapper from './Wrapper/VideoWrapper';

// const { width, height } = Dimensions.get('window');

// const VideoOverlayFlatList = () => {
//   const [videos, setVideos] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [paused, setPaused] = useState(false);
//   const [fullscreen, setFullscreen] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [videoDuration, setVideoDuration] = useState(0);

//   useEffect(() => {
//     const fetchVideos = async () => {
//     //   const response = await fetch('http://192.168.1.15:8080/backend.json');
//       const response = await fetch('http://10.112.4.67/backend.json');
//       const data = await response.json();
//       setVideos(data);
//     };
//     fetchVideos();
//   }, []);

//   const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
//     if (viewableItems.length > 0) {
//       const newIndex = viewableItems[0].index;
//       if (newIndex !== currentIndex) {
//         setCurrentIndex(newIndex);
//         setPaused(false); // Ensure the new video starts playing
//       }
//     }
//   });

//   const onScroll = (event) => {
//     const offsetY = event.nativeEvent.contentOffset.y;
//     const newIndex = Math.round(offsetY / height);

//     if (newIndex !== currentIndex) {
//       setCurrentIndex(newIndex);
//       setPaused(false); // Ensure the video at the new index plays
//     }
//   };

//   const viewabilityConfig = {
//     itemVisiblePercentThreshold: 90, // Ensure any part of the video is visible
//   };

//   const togglePlayPause = () => {
//     console.log('Toggle Play');
//     setPaused((prev) => !prev);
//   };

//   const handleOnLoad = ({ duration }) => {
//     setVideoDuration(duration);
//   }

//   const renderVideoItem = ({ item, index }) => (
//     <View style={[styles.videoContainer, fullscreen && styles.fullscreen]}>
//       <TouchableWithoutFeedback onPress={togglePlayPause}>
//         <View>
//             <VideoWrapper
//                 id={item.id}
//                 src={item.video}
//                 poster={item.poster}
//                 paused={index !== currentIndex || paused}
//                 onLoad={handleOnLoad}
//                 onProgress={setCurrentTime}
//             />  
            
//             <View style={styles.overlayBox}>
//                 <View style={styles.contentContainer}>
//                 <Text style={styles.heading}>{item.heading}</Text>
//                 <Text style={styles.description}>{item.description}</Text>
//                 <Text style={styles.component}>{item.component}</Text>
//                 </View>
//             </View>
//         </View>
//       </TouchableWithoutFeedback>
//     </View>
//   );

//   if (videos.length === 0) {
//     return <Text>Loading...</Text>;
//   }

//   return (
//     <FlatList
//       data={videos}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={renderVideoItem}
//       horizontal={false} // Change to `true` for horizontal scrolling
//       pagingEnabled
//       showsVerticalScrollIndicator={false}
//       onViewableItemsChanged={onViewableItemsChanged.current}
//       viewabilityConfig={viewabilityConfig}
//       onScroll={onScroll} // Detect scroll to update current index
//       scrollEventThrottle={16} // Optimize scroll event calls
//     />
//   );
// };

// const styles = StyleSheet.create({
//   videoContainer: {
//     width: width,
//     height: height,
//     position: 'relative',
//     backgroundColor: 'black',
//   },
//   fullscreen: {
//     height: '100%',
//   },
//   overlayBox: {
//     position: 'absolute',
//     height: '100%',
//     width: '100%',
//     backgroundColor: 'rgba(0, 0, 0, 0.2)',
//     justifyContent: 'space-between',
//     paddingVertical: 20,
//     zIndex: 1000,
//   },
//   contentContainer: {
//     padding: 20,
//   },
//   heading: {
//     color: '#fff',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   description: {
//     color: '#ccc',
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   component: {
//     color: '#aaa',
//     fontSize: 16,
//   },
// });

// export default VideoOverlayFlatList;
