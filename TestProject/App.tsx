import React from 'react';
import { View, Text } from 'react-native';
import Carousel from './src/components/carousel';
// import VideoApp from './src/components/vFeed/VideoApp';
import VideoOverlayFlatList from './src/components/VideoOverlay/VideoOverlayFlatList';
// import VideoOverlay from './src/components/VideoOverlay/VideoOverlay';

const App = () => {
  return (
    <View style={{height:'100%'}}>
        {/* <View style={{backgroundColor:'#ececec', height:'100%'}}>
          <View style={{position:'absolute'}}><Text>Text</Text></View>
          <Carousel/>   
        </View> */}
        <VideoOverlayFlatList />
        {/* <VideoOverlay /> */}
    </View>
    // <VideoApp/>
  );
};

export default App;
