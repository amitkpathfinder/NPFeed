const VideoPlayer = ({
    id,
    src,
    onEnded,
    onDoubleTapSeekForward,
    onDoubleTapSeekBackward,
}) => {
    // Update double-tap handler
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
            {/* Rest of the controls, seek indicator, and styles */}
        </View>
    );
};
