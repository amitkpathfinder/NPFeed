import React from 'react';
import { View, Text } from 'react-native';
import VideoOverlayFlatList from './components/VideoOverlay/VideoOverlayFlatList';
// import VideoOverlay from './components/VideoOverlay/VideoOverlay';

const App = () => {
  return (
    <View style={{height:'100%'}}>
        <VideoOverlayFlatList />
        {/* <VideoOverlay /> */}
    </View>
  );
};

export default App;
