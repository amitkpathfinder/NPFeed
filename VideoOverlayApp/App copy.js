import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import VideoOverlay from "./player/VideoOverlay";

// Replace these later with vector icons
const PlayIcon = () => <Text style={styles.icon}>▶️</Text>;
const PauseIcon = () => <Text style={styles.icon}>⏸️</Text>;
const FullscreenIcon = () => <Text style={styles.icon}>⛶</Text>;
const ExitFullscreenIcon = () => <Text style={styles.icon}>❌</Text>;

export default function App() {
  const playerRef = useRef(null);

  const [paused, setPaused] = useState(true); // 🔹 Preload in paused state
  const [buffering, setBuffering] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlayPause = () => setPaused(!paused);

  const handleFullscreenToggle = () => setFullscreen(!fullscreen);

  const handleSeek = (time) => {
    playerRef.current?.seekTo?.(time);
    setCurrentTime(time);
  };

  const handleShowPlayer = () => {
    setShowPlayer(true);
    setPaused(false); // 🔹 Start instantly
  };

  return (
    <View style={styles.container}>
      {/* Placeholder box */}
      <View style={{ backgroundColor: "red", width: 200, height: 200 }} />

      {!showPlayer && (
        <TouchableOpacity style={styles.showButton} onPress={handleShowPlayer}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Show Video</Text>
        </TouchableOpacity>
      )}

      {/* Always mount video, preload silently */}
      <View style={{ display: showPlayer ? "flex" : "none", flex: 1 }}>
        <VideoOverlay
          ref={playerRef}
          src={"https://imagecdn.99acres.com/ABR/146/master.m3u8"}
          defaultImg={
            "https://www.99acres.com/universalapp/img/hp_ppf_banner.png"
          }
          isPaused={paused}
          isBuffering={buffering}
          duration={duration}
          currentTime={currentTime}
          isFullscreen={fullscreen}
          showControls={true}
          repeat={false}
          repeatBuffering={false}
          // 🔹 Callbacks
          onBuffer={(state) => setBuffering(state)}
          onLoad={(meta) => setDuration(meta.duration)}
          onProgress={(time) => setCurrentTime(time)}
          onSeek={(time) => setCurrentTime(time)}
          onFullscreenToggle={handleFullscreenToggle}
          onEnd={() => {
            console.log("Video ended");
            setPaused(true);
          }}
        />

        {/* Custom Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePlayPause}>
            {paused ? <PlayIcon /> : <PauseIcon />}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFullscreenToggle}>
            {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </TouchableOpacity>
        </View>

        {/* Debug Status */}
        <Text style={styles.status}>
          {buffering
            ? "Buffering..."
            : `Time: ${currentTime.toFixed(1)} / ${duration.toFixed(1)}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  icon: { fontSize: 28, color: "white" },
  status: { color: "white", textAlign: "center", marginTop: 10 },
  showButton: {
    backgroundColor: "blue",
    padding: 12,
    marginTop: 20,
    alignSelf: "center",
    borderRadius: 8,
  },
});
