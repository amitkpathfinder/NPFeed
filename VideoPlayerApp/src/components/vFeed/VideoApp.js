import React, {useState, useEffect} from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import VerticalVideoFeed from './VerticalVideoFeed';
import { VideoContextProvider } from './VideoContext';

const VideoApp = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      // const response = await fetch('http://192.168.1.15/backend.json');
      const response = await fetch('http://10.112.4.67/backend.json');
      const data = await response.json();
      setVideos(data);
      
    };
    fetchVideos();console.log('--------------',videos)
  }, []);

  return (
    <VideoContextProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <VerticalVideoFeed videos={videos} />
      </SafeAreaView>
    </VideoContextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default VideoApp;