import React, { useEffect, useState, useRef, useCallback, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Hls from 'hls.js';
import { getTrackingObjectForVideoTracking, sendTracking } from "@nnshared/nntrackingsdk/NNTrackingutils";

const VideoPlayer = forwardRef(({
    id, src, page_name = '', section_name = '', custom_object = null, payload = null,
    referrer = '', style = '', paused = false, onQualityChange = null, controls = false,
    autoPlay = false, repeat = true, muted = false, onLoad = null, onEnd = null,
    onProgress = null, onBuffer = null, onError = null, onPlay = null, onPause = null,
    resizeMode = 'contain', onPlaying = null, preload = 'auto'
}, ref) => {
    const videoRef = useRef(null);
    const [currentQuality, setCurrentQuality] = useState(null);
    const lastQualityCheck = useRef(0);
    const QUALITY_CHECK_INTERVAL = 5000;
    const videoElement = ref?.current || videoRef.current;

    const objectFitMap = {
        'contain': 'contain',
        'cover': 'cover',
        'fill': 'fill',
        'none': 'none',
        'scale-down': 'scale-down'
    };

    const trackingParams = {
        page_name,
        stage: "FINAL",
        section: section_name,
        custom_object,
        payload,
        referrer,
    };

    const checkHTML5VideoQuality = (videoElement) => {
        if (!videoElement) return null;
        const { videoHeight: height, videoWidth: width, currentTime, webkitVideoDecodedByteCount } = videoElement;
        const playbackQuality = videoElement.getVideoPlaybackQuality?.() || {};
        
        return {
            height, width, timestamp: Date.now(), currentTime,
            droppedFrames: playbackQuality.droppedVideoFrames || 0,
            totalFrames: playbackQuality.totalVideoFrames || 0,
            qualityLabel: `${width}x${height}`,
            estimatedBandwidth: webkitVideoDecodedByteCount ? webkitVideoDecodedByteCount * 8 / currentTime : null
        };
    };

    const setupHLSQualityMonitoring = (hls) => {
        if (!hls) return;

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const currentLevel = hls.levels[data.level];
            const qualityInfo = {
                height: currentLevel.height, width: currentLevel.width,
                bitrate: currentLevel.bitrate, qualityLabel: `${currentLevel.width}x${currentLevel.height}`,
                bandwidth: currentLevel.bitrate, levelIndex: data.level, timestamp: Date.now()
            };
            
            setCurrentQuality(qualityInfo);
            onQualityChange?.(qualityInfo);
        });

        hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            const { tload, tfirst, total } = data.stats;
            const loadTime = tload - tfirst;
            const bw = total * 8 / loadTime;
            const qualityInfo = { ...currentQuality, measuredBandwidth: Math.round(bw), loadTime, timestamp: Date.now() };
            
            setCurrentQuality(qualityInfo);
            onQualityChange?.(qualityInfo);
        });
    };

    useEffect(() => {
        if (!videoElement) return;

        if (videoElement.hlsInstance) {
            videoElement.hlsInstance.destroy();
            videoElement.hlsInstance = null;
        }

        if (src.includes('.m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(videoElement);
                hls.on(Hls.Events.MANIFEST_PARSED, () => !paused && videoElement.play().catch(onError));
                setupHLSQualityMonitoring(hls);
                videoElement.hlsInstance = hls;
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                videoElement.src = src;
                videoElement.addEventListener('loadedmetadata', () => {
                    const quality = checkHTML5VideoQuality(videoElement);
                    setCurrentQuality(quality);
                    onQualityChange?.(quality);
                });
            }
        } else {
            videoElement.addEventListener('loadedmetadata', () => {
                const quality = checkHTML5VideoQuality(videoElement);
                setCurrentQuality(quality);
                onQualityChange?.(quality);
            });
        }

        return () => {
            videoElement.hlsInstance?.destroy();
        };
    }, [src, videoElement]);

    useEffect(() => {
        if (!videoElement) return;

        const updated_trackingParams = { ...trackingParams, event: paused ? "PLAYBACK_PAUSE" : "PLAYBACK_START" };
        const trackingObject = getTrackingObjectForVideoTracking(updated_trackingParams);
        
        console.log(`Video Tracking : ${paused ? 'PLAYBACK_PAUSE' : 'PLAYBACK_START'} : `, trackingObject);
        sendTracking(trackingObject);

    }, [paused]);

    useEffect(() => {
        const handlePlay = async () => {
            try {
                if (paused) {
                    videoElement.pause();
                } else if (!videoElement.ended && videoElement.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                    await videoElement.play();
                } else {
                    videoElement.addEventListener('canplay', async () => await videoElement.play().catch(onError), { once: true });
                }
            } catch {
                console.error("Playback failed. Retrying...");
                setTimeout(() => videoElement.play().catch(onError), 1000);
            }
        };

        handlePlay();

        return () => videoElement.removeEventListener('canplay', handlePlay);
    }, [paused, videoElement, onError]);

    const handleProgress = useCallback(() => onProgress?.(videoElement), [onProgress, videoElement]);

    useEffect(() => {
        videoElement.addEventListener('timeupdate', handleProgress);
        
        return () => videoElement.removeEventListener('timeupdate', handleProgress);
    }, [handleProgress]);

    const handleMetadataLoaded = useCallback(() => onLoad?.({ duration: videoElement.duration }), [onLoad]);

    useEffect(() => {
        videoElement.addEventListener('waiting', onBuffer);

        return () => videoElement.removeEventListener('waiting', onBuffer);
    }, [onBuffer]);

    const handleVideoEnd = () => {
        console.log('Video Ended - Triggered');

        const updated_trackingParams = { ...trackingParams, event: "PLAYBACK_END" };
        const trackingObject = getTrackingObjectForVideoTracking(updated_trackingParams);
        
        sendTracking(trackingObject);
        console.log("Video Tracking : PLAYBACK_END : ", trackingObject);
        
        onEnd?.();
    };

    const handlePlay = () => onPlay?.();
    const handlePause = () => onPause?.();

    return (
        <View style={[styles.container, style]}>
            <video
                ref={ref || videoRef}
                id={id}
                src={src}
                loop={repeat}
                controls={controls}
                autoPlay={autoPlay}
                playsInline
                muted={muted}
                preload={preload}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={handleVideoEnd}
                onPlaying={onPlaying}
                onLoadedMetadata={handleMetadataLoaded}
                onError={onError}
                style={{ ...styles.video, objectFit: objectFitMap[resizeMode] || 'initial' }}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
        justifyContent: 'center',
        height: '100%',
    },
    video: {
        cursor: 'pointer',
        width: '100%',
        height: '100%',
    }
});

export default VideoPlayer;