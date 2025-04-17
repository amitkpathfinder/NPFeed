import { requireNativeComponent } from 'react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyyExoPlayer = requireNativeComponent('MyExoPlayer');

const VideoPlayer = ({ videoUrl }) => {
  return (
    <View style={styles.container}>
      <Text>MyExoPlayer PlaceHolder...</Text>
      <MyyExoPlayer style={styles.video} videoUrl={videoUrl} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: 250,
  },
});

export default VideoPlayer;

