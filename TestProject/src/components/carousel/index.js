import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native'
import React from 'react'
import VideoOverlay from '../vFeed/VideoOverlay';
const { width, height } = Dimensions.get('window');

const Carousel = () => {
  return (
    <ScrollView style={styles.container}>
        <View>
            <View style={styles.cardBox}>
                <VideoOverlay 
                    isPaused={false} 
                    src={'https://imagecdn.99acres.com/ABR/146/master480First.m3u8'}
                    />
                <View>
                    <View style={[styles.cardContent,styles.iconNudges]}>
                        <View><Text>Screen 1</Text></View>
                        <View><Text>Screen 1</Text></View>
                    </View>
                    <View style={[styles.cardInterestPanel,styles.iconNudges]}>
                        <Text>Interest Panel</Text>
                    </View>
                    <View style={[styles.cardEOIPanel,styles.iconNudges]}>
                        <Text>EOI Panel</Text>
                    </View>
                </View>
            </View>
            <View style={styles.cardBox}>
                <Text>Screen 2</Text>
            </View>
            <View style={styles.cardBox}>
                <Text>Screen 3</Text>
            </View>
            <View style={styles.cardBox}>
                <Text>Screen 4</Text>
            </View>
            <View style={styles.cardBox}>
                <Text>Screen 5</Text>
            </View>
        </View>
        
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        padding:10,
    },
    cardBox:{
        width:'100%',
        height:height,
        padding:10,
        marginBottom:10,
        backgroundColor:'#999',
        borderRadius:10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent:{bottom:150,width:'100%'},
    cardInterestPanel:{bottom:100,width:'100%'},
    cardEOIPanel:{bottom:50,width:'100%'},
    iconNudges:{
        position:'absolute',
        backgroundColor:'rgba(255,255,255,1)',
        padding:10,
    }
});

export default Carousel