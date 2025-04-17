import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import VideoPlayer from '../VideoPlayer';

const StoryViewer = ({ stories }) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const progressBarRef = useRef(null);

    const handleStoryEnd = () => {
        // Move to the next story if it exists, otherwise loop back to the start
        if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
        } else {
            setCurrentStoryIndex(0);
        }
    };

    const handleSeekForward = () => {
        if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
        }
    };

    const handleSeekBackward = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        }
    };

    return (
        <View style={styles.container}>
            {/* Progress indicators for each story */}
            <View style={styles.progressContainer}>
                {stories.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.progressBar,
                            {
                                width: `${100 / stories.length}%`,
                                opacity: index === currentStoryIndex ? 1 : 0.5,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Video Player with event to handle end of video */}
            <VideoPlayer
                key={currentStoryIndex} // Re-mount on story change to start from beginning
                id={`story-${currentStoryIndex}`}
                src={stories[currentStoryIndex]}
                onEnded={handleStoryEnd}
                onDoubleTapSeekBackward={handleSeekBackward}
                onDoubleTapSeekForward={handleSeekForward}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        
    },
    progressContainer: {
        flexDirection: 'row',
        position: 'absolute',
        top: 20,
        width: '100%',
        height: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex:1000,
        height:16,
    },
    progressBar: {
        borderRadius:10,
        height: 4,
        backgroundColor: 'white',
        margin:5
    },
});

export default StoryViewer;
