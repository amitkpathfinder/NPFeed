import React from 'react';
import { View, Text } from 'react-native';
// import VideoApp from './src/components/vFeed/VideoApp';
import VideoOverlayFlatList from './src/components/VideoOverlay/VideoOverlayFlatList';
// import VideoOverlay from './src/components/VideoOverlay/VideoOverlay';

const App = () => {
  return (
    <View style={{height:'100%'}}>
        <VideoOverlayFlatList />
        {/* <VideoOverlay /> */}
    </View>
    // <VideoApp/>
  );
};

export default App;
