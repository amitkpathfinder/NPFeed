import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import Hls from 'hls.js';

const SEEK_TIME = 10; // Time in seconds to seek on double tap
const ICON_TIMEOUT = 3000; // Time in milliseconds to hide the icons
const SEEK_INDICATOR_TIMEOUT = 800; // Time to show seek indicator

const VideoPlayer = ({
    id,
    src,
    onEnded,
    onDoubleTapSeekForward,
    onDoubleTapSeekBackward,
    }) => {
    const videoRef = useRef(null);
    // const { id } = props;

    const [isPaused, setIsPaused] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [showSeekIndicator, setShowSeekIndicator] = useState(null); // Shows seek direction and time
    const [progress, setProgress] = useState(0); // For seekbar progress

    let controlTimeoutRef = useRef(null);
    let lastTap = useRef(0);

    // Toggle play/pause and show controls briefly
    const handleVideoClick = () => {
        setIsPaused((prev) => !prev);
        setShowControls(true);

        if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
        controlTimeoutRef.current = setTimeout(() => setShowControls(false), ICON_TIMEOUT);
    };

    // Seek on double tap with progress indicator
    const handleDoubleTapSeek = (direction) => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            if (direction === 'forward' && onDoubleTapSeekForward) {
                onDoubleTapSeekForward();
            } else if (direction === 'backward' && onDoubleTapSeekBackward) {
                onDoubleTapSeekBackward();
            }
        }
        lastTap.current = now;
    };

    useEffect(() => {
        if (videoRef.current) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src); // `src` should be the HLS (.m3u8) file URL
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current.play();
                });
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = src;
                videoRef.current.addEventListener('loadedmetadata', () => {
                    videoRef.current.play();
                });
            }
        }
    }, [src, videoRef]);

    // Auto play/pause based on state change
    useEffect(() => {
        if (videoRef.current) {
            isPaused ? videoRef.current.pause() : videoRef.current.play();
        }
    }, [isPaused]);

    // Toggle fullscreen mode
    const toggleFullScreen = () => {
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        } else if (videoRef.current.webkitRequestFullscreen) {
            videoRef.current.webkitRequestFullscreen();
        }
    };

    // Update progress for seekbar
    useEffect(() => {
        const updateProgress = () => {
            if (videoRef.current) {
                const progressPercentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                setProgress(progressPercentage || 0);
            }
        };
        videoRef.current.addEventListener('timeupdate', updateProgress);

        return () => videoRef.current && videoRef.current.removeEventListener('timeupdate', updateProgress);
    }, []);

    return (
        <View style={styles.container}>
            <video
                ref={videoRef}
                id={id}
                src={src}
                autoPlay
                playsInline
                muted
                preload="auto"
                width="100%"
                onEnded={onEnded}
                onClick={handleVideoClick}
                style={styles.video}
            />
            {/* Double-tap handlers */}
            <div
                style={styles.touchableLeftSide}
                onClick={() => handleDoubleTapSeek('backward')}
            />
            <div
                style={styles.touchableRightSide}
                onClick={() => handleDoubleTapSeek('forward')}
            />

            {/* Seek Indicator */}
            {showSeekIndicator && (
                <div style={styles.seekIndicator}>
                    {showSeekIndicator}
                </div>
            )}

            {/* Play/Pause and Fullscreen Controls */}
            {showControls && (
                <div style={styles.controls}>
                    <button onClick={handleVideoClick} style={styles.playPauseButton}>
                        {isPaused ? '▶️' : '⏸️'}
                    </button>
                    <button onClick={toggleFullScreen} style={styles.fullscreenButton}>
                        🔲
                    </button>
                </div>
            )}

            {/* Seekbar */}
            {showControls && (
                <div style={styles.seekbarContainer}>
                    <div style={{ ...styles.seekbar, width: `${progress}%` }} />
                </div>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
        justifyContent: 'center',
    },
    video: {
        cursor: 'pointer',
        width: '100%',
    },
    controls: {
        position: 'absolute',
        bottom: '50%',
        left: '50%',
        transform: 'translate(-50%, 50%)',
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 5,
        borderRadius: 5,
    },
    playPauseButton: {
        fontSize: 20,
        color: 'white',
        backgroundColor: 'transparent',
        border: 'none',
    },
    fullscreenButton: {
        fontSize: 20,
        color: 'white',
        backgroundColor: 'transparent',
        border: 'none',
    },
    touchableLeftSide: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '30%',
        height: '100%',
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    touchableRightSide: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '30%',
        height: '100%',
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    seekIndicator: {
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 18,
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 5,
    },
    seekbarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#555',
    },
    seekbar: {
        height: '100%',
        backgroundColor: '#fff',
    },
});

export default VideoPlayer;



// import React, { useEffect, useRef, useState } from 'react';
// import { View, StyleSheet } from 'react-native';

// const SEEK_TIME = 10; // Time in seconds to seek on double tap
// const ICON_TIMEOUT = 3000; // Time in milliseconds to hide the icons

// const VideoPlayer = (props) => {
//     const videoRef = useRef(null);
//     const { id } = props;

//     const [isPaused, setIsPaused] = useState(true);
//     const [showControls, setShowControls] = useState(false);

//     let controlTimeoutRef = useRef(null);
//     let lastTap = useRef(0);

//     // Toggle play/pause and show controls briefly
//     const handleVideoClick = () => {
//         setIsPaused((prev) => !prev);
//         setShowControls(true);

//         // Reset hide controls timer
//         if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
//         controlTimeoutRef.current = setTimeout(() => setShowControls(false), ICON_TIMEOUT);
//     };

//     // Seek on double tap
//     const handleDoubleTapSeek = (direction) => {
//         const now = Date.now();
//         if (now - lastTap.current < 300) {
//             const newTime = Math.max(0, videoRef.current.currentTime + (direction === 'forward' ? SEEK_TIME : -SEEK_TIME));
//             videoRef.current.currentTime = newTime;
//         }
//         lastTap.current = now;
//     };

//     // Auto play/pause based on state change
//     useEffect(() => {
//         if (videoRef.current) {
//             isPaused ? videoRef.current.pause() : videoRef.current.play();
//         }
//     }, [isPaused]);

//     // Toggle fullscreen mode
//     const toggleFullScreen = () => {
//         if (videoRef.current.requestFullscreen) {
//             console.log('Toggle fullscreen mode');
//             videoRef.current.requestFullscreen();
//         } else if (videoRef.current.webkitRequestFullscreen) {
//             console.log('Toggle webkit fullscreen mode');
//             videoRef.current.webkitRequestFullscreen();
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <div
//                 style={styles.touchableLeftSide}
//                 onClick={() => handleDoubleTapSeek('backward')}
//             />
//             <div
//                 style={styles.touchableRightSide}
//                 onClick={() => handleDoubleTapSeek('forward')}
//             />
//             <video
//                 ref={videoRef}
//                 id={id}
//                 autoPlay
//                 playsInline
//                 muted
//                 preload="auto"
//                 width="100%"
//                 onClick={handleVideoClick}
//                 style={styles.video}
//             >
//                 <source src="https://imagecdn.99acres.com/loanTest/Horizontal_compressed.mp4" type="video/mp4" />
//             </video>
//             {showControls && (
//                 <div style={styles.controls}>
//                     <button onClick={handleVideoClick} style={styles.playPauseButton}>
//                         {isPaused ? '▶️' : '⏸️'}
//                     </button>
//                     <button onClick={toggleFullScreen} style={styles.fullscreenButton}>
//                         🔲
//                     </button>
//                 </div>
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         position: 'relative',
//         width: '100%',
//         justifyContent: 'center',
//     },
//     video: {
//         cursor: 'pointer',
//         width: '100%',
//     },
//     controls: {
//         position: 'absolute',
//         bottom: 10,
//         left: 0,
//         right:0,
//         margin:'auto',
//         display: 'flex',
//         flexDirection: 'row',
//         justifyContent:'center',
//         gap: 10,
//         alignItems: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         padding: 5,
//         borderRadius: 5,
//     },
//     playPauseButton: {
//         fontSize: 20,
//         color: 'white',
//         backgroundColor: 'transparent',
//         border: 'none',
//     },
//     fullscreenButton: {
//         fontSize: 20,
//         color: 'white',
//         backgroundColor: 'transparent',
//         border: 'none',
//     },
//     touchableLeftSide: {
//         position: 'absolute',
//         left: 0,
//         top: 0,
//         width: '30%',
//         height: '100%',
//         backgroundColor: 'transparent',
//         zIndex: 1,
//     },
//     touchableRightSide: {
//         position: 'absolute',
//         right: 0,
//         top: 0,
//         width: '30%',
//         height: '100%',
//         backgroundColor: 'transparent',
//         zIndex: 1,
//     },
// });

// export default VideoPlayer;



// import React, { useEffect, useRef, useState } from 'react';
// import { View, StyleSheet } from 'react-native';

// const VideoPlayer = (props) => {
//     const videoRef = useRef(null);
//     const { id } = props;

//     // Local state to track play/pause
//     const [isPaused, setIsPaused] = useState(true);

//     // Toggle play/pause state when video is clicked
//     const handleVideoClick = () => {
//         setIsPaused((prev) => !prev);
//     };

//     // Play or pause video when isPaused state changes
//     useEffect(() => {
//         if (videoRef.current) {
//             isPaused ? videoRef.current.pause() : videoRef.current.play();
//         }
//     }, [isPaused]);

//     return (
//         <View style={styles.container}>
//             <video
//                 ref={videoRef}
//                 id={id}
//                 controls
//                 autoPlay
//                 playsInline
//                 muted
//                 preload="auto"
//                 poster="https://via.placeholder.com/300x200.png?text=Popup+Video"
//                 width="100%"
//                 onClick={handleVideoClick}
//                 style={styles.video}
//             >
//                 <source src="https://imagecdn.99acres.com/loanTest/Horizontal_compressed.mp4" type="video/mp4" />
//             </video>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         width: '100%',
//         justifyContent: 'center',
//     },
//     video: {
//         cursor: 'pointer', // shows a pointer cursor to indicate clickability
//     },
// });

// export default VideoPlayer;
