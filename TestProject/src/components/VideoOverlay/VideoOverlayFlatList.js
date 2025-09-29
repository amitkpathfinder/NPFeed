import React, { useState, useEffect, useRef } from 'react';
import { View, Button, ActivityIndicator, Text, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback } from 'react-native';
import VideoOverlay from '../vFeed/VideoOverlay';
import VideoWrapper from './Wrapper/VideoWrapper';
import { logVideoEvent, printComparison, printAverages } from '../vFeed/utils/videoLogger';

const { width, height } = Dimensions.get('window');

const VideoOverlayFlatList = () => {

  const[lastRecordedTime, setlastRecordedTime] = useState(0);

  const [stuckLoading, setStuckLoading] = useState(false);
  const [newCurrentTime, setNewCurrentTime] = useState(0);
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [visibleIndices, setVisibleIndices] = useState([]);
  const [preloadIndices, setPreloadIndices] = useState([]); // Track indices of videos to preload
  const videoStates = useRef({}); // Store state for each video
  const flatListRef = useRef(null);
  const videoRefs = useRef({}); // Store refs for each video item

  const [watchTime, setWatchTime] = useState(0);
  const lastUpdateTime = useRef(0);
  const [videoUri, setVideoUri] = useState('https://imagecdn.99acres.com/ABR/146/master.m3u8');

  const switchVideo = () => {
    setVideoUri('https://imagecdn.99acres.com/hls-test/r4pb7y4_1732648572_533683783/r4pb7y4_1732648572_533683783_playlist.m3u8');
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        //const response = await fetch('http://192.168.1.15/backend.json');
        // const response = await fetch('http://10.112.4.67/backend.json');
        // const data = await response.json();

        data = [
        //   {
        //     "id": 101,
        //     "video": "http://aws-99.infoedge.com/media1/0/0/263ABR-1747029827949/master_480p.m3u8",
        //     "defaultImg": "https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
        //     "heading": "Normal-4s - Not Included",
        //     "description": "description 0",
        //     "component": "component0"
        //   },
        //   {
        //     "id": 0,
        //     "video": "http://aws-99.infoedge.com/media1/0/0/264ABR-1747031331448/master_480p.m3u8",
        //     "defaultImg": "https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
        //     "heading": "Normal-4s-720First",
        //     "description": "description 0",
        //     "component": "component0"
        //   },
        // {
        //   "id": 1,
        //   "video": "http://aws-99.infoedge.com/media1/0/0/266ABR-1747033714147/master_480p.m3u8",
        //   "defaultImg": "https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
        //   "heading": "Normal-2s",
        //   "description": "description 1",
        //   "component": "component1"
        // },
        // {
        //   "id": 2,
        //   "video": "http://aws-99.infoedge.com/media1/0/0/267ABR-1747034025158/master_480p.m3u8",
        //   "defaultImg": "https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
        //   "heading": "240 Removed - 2 Seconds",
        //   "description": "description 2",
        //   "component": "component2"
        // },

        {
          "id": 1,
          "video": "https://imagecdn.99acres.com/ABR/146/master.m3u8",
          "defaultImg":"https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
          "heading":"Heading 1",
          "description": "description 1",
          "component": "component1"
      },
      // {
      //     "id": 2,
      //     "video": "https://imagecdn.99acres.com/ABR/146/master480First.m3u8",
      //     "defaultImg":"https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
      //     "heading":"Heading 2",
      //     "description": "description 2",
      //     "component": "component2"
      // },
      // {
      //     "id": 3,
      //     "video": "https://imagecdn.99acres.com/ABR/146/master240Removed.m3u8",
      //     "defaultImg":"https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
      //     "heading":"Heading 3",
      //     "description": "description 3",
      //     "component": "component3"
      // },
      // {
      //     "id":4,
      //     "video":"https://imagecdn.99acres.com/hls-test/r4pb7y4_1732648572_533683783/r4pb7y4_1732648572_533683783_playlist.m3u8",
      //     "defaultImg":"https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
      //     "heading":"Heqading4",
      //     "description":"description 4",
      //     "component":"component4"
      // },
      // {
      //     "id":5,
      //     "video":"https://imagecdn.99acres.com/hls-test/330hovz_1732767002_533961645/330hovz_1732767002_533961645_playlist.m3u8",
      //     "defaultImg":"https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
      //     "heading":"Heqading5",
      //     "description":"description 5",
      //     "component":"component5"
      // },
      {
          "id":2,
          "video":"https://imagecdn.99acres.com/hls-test/dy6fwis_1732672416_533690099/dy6fwis_1732672416_533690099_playlist.m3u8",
          "defaultImg":"https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
          "heading":"Heqading6",
          "description":"description 6",
          "component":"component6"
      },
      {
          "id":3,
          "video":"https://imagecdn.99acres.com/hls-test/r4pb7y4_1732648572_533683783/r4pb7y4_1732648572_533683783_playlist.m3u8",
          "defaultImg":"https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
          "heading":"Heqading7",
          "description":"description 7",
          "component":"component7"
      },
      {
          "id":4,
          "video":"https://imagecdn.99acres.com/hls-test/njoxzj7_1732674649_533691647/njoxzj7_1732674649_533691647_playlist.m3u8",
          "defaultImg":"https://newprojects.99acres.com/projects/aba_corp/aba_coco_county/images/vqki9toz_med.png",
          "heading":"Heqading8",
          "description":"description 8",
          "component":"component8"
      }
       
        ];



        setVideos(data);
        
        // Initialize videoStates with default values for each video
        const initialStates = {};
      data.forEach(video => {
        initialStates[video.id] = {
          paused: true,
          currentTime: 0,
          duration: 0,
          watchTime: 0,
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

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const newVisibleIndices = viewableItems.map(item => item.index);
    setVisibleIndices(newVisibleIndices);

    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      const newVideoId = viewableItems[0].item.id;

      Object.keys(videoStates.current).forEach(id => {
        videoStates.current[id].paused = true;
      });

      videoStates.current[newVideoId].paused = false;
      setCurrentIndex(newIndex);
    }
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

 const handleOnLoad = (item, data) => {
    if (videoStates.current[item.videoId]) {
      videoStates.current[item.videoId].duration = data.duration;
    }
    // console.log('data',item.video);
    // console.log('data',data.naturalSize);
    // logVideoEvent(item.videoId, 'onLoad');
  };

  const handleReady = (videoId, isPreloading) => {
    // console.log('ReadyForDisplay--------->', videoId);
                if (isPreloading) {
                  // Mark as preloaded when ready for display
                  videoStates.current[videoId] = {
                    ...videoStates.current[videoId],
                    preloaded: true
                  };
                }
    logVideoEvent(videoId, 'onReadyForDisplay');
  };

  const handleOnProgress = (videoId, data) => {
    
    setNewCurrentTime(data.currentTime);
    
    const { currentTime } = data;
    const state = videoStates.current[videoId];
    if (!state) return;
    
    const delta = currentTime - (lastRecordedTime || 0);
    if (delta > 0) {
      state.watchTime = (state.watchTime || 0) + delta;
      setlastRecordedTime(currentTime);
      
      // if (state.watchTime >= 8 && currentIndex < videos.length - 1) {
      //   flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      //   state.watchTime = -9999; // Prevent re-triggering
      // }
      setStuckLoading(false);
      // console.log('UP progress...........',data.currentTime, lastRecordedTime);
      // console.log('Up progress...........',stuckLoading);
    }
    else{
      setStuckLoading(true);
      setlastRecordedTime(currentTime);
      // console.log('Down 2 values progress...........',data.currentTime, lastRecordedTime);
      // console.log('Down progress...........',stuckLoading);
    }
  };


  useEffect(() => {
    setStuckLoading(stuckLoading);
  }, [stuckLoading]);


  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 200,
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
        {/* <View style={styles.loadingOverlay} pointerEvents={'none'}>
         <ActivityIndicator
           animating={stuckLoading}
           size={'large'}
           color={'red'}
           style= {{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }}
         />
       </View> */}
        <Button title="Switch Video" onPress={switchVideo} />
        <Button 
          title="Restart Current Video" 
          onPress={() => {
            const currentVideoId = videos[currentIndex]?.id;
            if (currentVideoId && videoRefs.current[currentVideoId]) {
              videoRefs.current[currentVideoId].restart();
            }
          }} 
        />
        {/* <Button style={{zIndex:2, position:'absolute'}}
        title={`Print Video Load Times loading : ${stuckLoading}`}
        onPress={() => {
          printComparison();
        }}
      />
      <Button style={{zIndex:2, position:'absolute'}}
        title="printAverages Load Times"
        onPress={() => {
          printAverages();
        }}
      /> */}
      
        <TouchableWithoutFeedback onPress={() => togglePlayPause(item.id)}>
          <View>
            <VideoOverlay
            stuckLoading={stuckLoading}
              videoId={item.id}
              // src={videoUri}
              src={item.video}
              // controls={true}
              ref={(ref) => { videoRefs.current[item.id] = ref; }} // Store ref by ID
              isAutoPlay={false}
              defaultImg={item.defaultImg}
              isPaused={shouldBePaused}
              repeat={false}
              onReadyForDisplay={(isPreloading) => handleReady(item.id, isPreloading)}
              onLoad={(data) => handleOnLoad(item, data)}
              onProgress={(data) => handleOnProgress(item.id, data)}
              currentTime={videoState.currentTime}
              shouldReload={false}
              custom_object={{'PageName':'srp', 'VideoId':item.id, 'url':item.video }}
              resizeMode="contain"
              // Set priority to high for preloaded videos to ensure they load quickly
              priority={isVisible || shouldPreload ? "high" : "normal"}
              // For preloaded videos, we want to load them but not necessarily show them
              preload={isPreloading ? "auto" : "none"}
              loadingIndicatorStyle={{
                color: 'red',
                size: 'large',
                style: { transform: [{ scaleX: 2 }, { scaleY: 2 }] },
              }}
            />
            
            <View style={styles.overlayBox}>
              <View style={styles.contentContainer}>
                <Text style={styles.heading}>{item.heading}</Text>
                {/* <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.component}>{item.component}</Text>
                <Text style={styles.component}>{item.video}</Text> */}
                {/* Status indicator with visibility and preload info */}
                {/* <Text style={styles.playState}>
                  {shouldBePaused ? 'Paused' : 'Playing'} | 
                  {isVisible ? 'Visible' : 'Not Visible'} |
                  {shouldPreload ? 'Preloading' : 'Not Preloading'} |
                  {videoState.preloaded ? 'Preloaded' : 'Not Preloaded'}
                </Text> */}
                {/* <Text style={{marginLeft:-20,
                              width:115,
                              color:'#fff',
                              padding:9,
                              fontSize:14,
                              fontWeight:'600',
                              backgroundColor:'#444',
                              marginTop:582}}>
                                {newCurrentTime}</Text> */}
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
      removeClippedSubviews={true}
      initialNumToRender={1} // Increased to load current + 2 preloaded videos
      maxToRenderPerBatch={1}
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
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'space-between',
    paddingVertical: 20,
    zIndex: 1000,
  },
  contentContainer: {
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex:11
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

// On April 7th 2025

// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Dimensions, FlatList, TouchableWithoutFeedback } from 'react-native';
// import VideoOverlay from '../vFeed/VideoOverlay';
// import VideoWrapper from './Wrapper/VideoWrapper';

// const { width, height } = Dimensions.get('window');

// const VideoOverlayFlatList = () => {
//   const [videos, setVideos] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(1);
//   const [visibleIndices, setVisibleIndices] = useState([]);
//   const [preloadIndices, setPreloadIndices] = useState([]); // Track indices of videos to preload
//   const videoStates = useRef({}); // Store state for each video
//   const flatListRef = useRef(null);
//   const videoRefs = useRef({}); // Store refs for each video item

//   const [watchTime, setWatchTime] = useState(0);
//   const lastUpdateTime = useRef(0);

//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         //const response = await fetch('http://192.168.1.15/backend.json');
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
//             loaded: false,
//             preloaded: false
//           };
//         });
//         videoStates.current = initialStates;
        
//         // Set initial preload indices
//         updatePreloadIndices(1);
//       } catch (error) {
//         console.error('Error fetching videos:', error);
//       }
//     };
//     fetchVideos();
//   }, []);
  
//   // Function to update which videos should be preloaded
//   const updatePreloadIndices = (currentIdx) => {
//     const nextIndices = [];
    
//     // Add next two videos to preload
//     for (let i = 1; i <= 2; i++) {
//       const nextIndex = currentIdx + i;
//       if (nextIndex < videos.length) {
//         nextIndices.push(nextIndex);
//       }
//     }
    
//     setPreloadIndices(nextIndices);
//   };

//   // Update preload indices whenever current index changes
//   useEffect(() => {
//     updatePreloadIndices(currentIndex);
//     lastUpdateTime.current = 0;
//     setWatchTime(0);
//   }, [currentIndex, videos.length]);

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

  // const togglePlayPause = (videoId) => {
  //   if (videoStates.current[videoId]) {
  //     videoStates.current[videoId] = {
  //       ...videoStates.current[videoId],
  //       paused: !videoStates.current[videoId].paused
  //     };
  //     // Force update to rerender
  //     setVideos([...videos]);
  //   }
  // };

//   const handleOnLoad = (videoId, data) => {
//     const videoIndex = videos.findIndex(v => v.id === videoId);
//     const isVisible = videoIndex === currentIndex;
    
//     videoStates.current[videoId] = {
//       ...videoStates.current[videoId],
//       duration: data.duration,
//       loaded: true,
//       preloaded: preloadIndices.includes(videoIndex),
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
//     // console.log('calling..............................',data);
//     const { currentTime } = data;
    
//     if (currentTime - lastUpdateTime.current >= 5) {
//       lastUpdateTime.current = currentTime;
//       setWatchTime(prevTime => prevTime + 5);
//       console.log(`User has watched videoid:${videoId} : ${watchTime + 5} seconds of the video.`);
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
//       loaded: false,
//       preloaded: false
//     };
    
//     // Check if this item is currently visible in the viewport
//     const isVisible = visibleIndices.includes(index);
    
//     // Check if this item should be preloaded
//     const shouldPreload = preloadIndices.includes(index);
    
//     // If not visible and not preloading, ensure it's paused
//     const shouldBePaused = (!isVisible && !shouldPreload) || videoState.paused;
    
//     // For preloaded videos, we want to load them but keep them paused
//     const isPreloading = shouldPreload && !isVisible;

//     return (
//       <View style={[styles.videoContainer]}>
//         <TouchableWithoutFeedback onPress={() => togglePlayPause(item.id)}>
//           <View>
//             <VideoOverlay
//               videoId={item.id}
//               src={item.video}
//               ref={(ref) => { videoRefs.current[item.id] = ref; }} // Store ref by ID
//               isAutoPlay={index === currentIndex}
//               defaultImg={item.defaultImg}
//               isPaused={shouldBePaused}
//               repeat={false}
//               onReadyForDisplay={() => {
//                 console.log('ReadyForDisplay', item.id);
//                 if (isPreloading) {
//                   // Mark as preloaded when ready for display
//                   videoStates.current[item.id] = {
//                     ...videoStates.current[item.id],
//                     preloaded: true
//                   };
//                 }
//               }}
//               onLoad={(data) => handleOnLoad(item.id, data)}
//               onProgress={(data) => handleOnProgress(item.id, data)}
//               currentTime={videoState.currentTime}
//               shouldReload={false}
//               resizeMode="cover"
//               // Set priority to high for preloaded videos to ensure they load quickly
//               priority={isVisible || shouldPreload ? "high" : "normal"}
//               // For preloaded videos, we want to load them but not necessarily show them
//               preload={isPreloading ? "auto" : "none"}
//               loadingIndicatorStyle={{
//                 color: 'white',
//                 size: 'large',
//                 style: { transform: [{ scaleX: 2 }, { scaleY: 2 }] },
//               }}
//             />
            
//             <View style={styles.overlayBox}>
//               <View style={styles.contentContainer}>
//                 <Text style={styles.heading}>{item.heading}</Text>
//                 <Text style={styles.description}>{item.description}</Text>
//                 <Text style={styles.component}>{item.component}</Text>
//                 <Text style={styles.component}>{item.video}</Text>
//                 {/* Status indicator with visibility and preload info */}
//                 <Text style={styles.playState}>
//                   {shouldBePaused ? 'Paused' : 'Playing'} | 
//                   {isVisible ? 'Visible' : 'Not Visible'} |
//                   {shouldPreload ? 'Preloading' : 'Not Preloading'} |
//                   {videoState.preloaded ? 'Preloaded' : 'Not Preloaded'}
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
//       initialNumToRender={1} // Increased to load current + 2 preloaded videos
//       maxToRenderPerBatch={3}
//       windowSize={7} // Increased to better handle preloading
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
//           updatePreloadIndices(newIndex);
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
