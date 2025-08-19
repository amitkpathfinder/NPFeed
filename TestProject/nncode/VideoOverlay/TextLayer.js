import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const TextLayer = (props) => {
  const handlePress = () => {
    console.log('CTA clicked!');
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.heading}>Welcome to React Native Video!</Text>
      <Text style={styles.paragraph}>
        This is a simple example of a heading, a paragraph, and a call-to-action button.
      </Text> */}
      <Button title={props.content} onPress={handlePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,.7)',
    position:'absolute',
    left:0,
    bottom:0,
    width:'100%',
    // height:'100%',
    zIndex:1,
  },
  heading: {
    fontSize:20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default TextLayer;
