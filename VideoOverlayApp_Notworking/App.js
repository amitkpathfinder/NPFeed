import React, { useRef, useState } from "react";
import { View, Text, Slider, StyleSheet, TouchableOpacity } from "react-native";
// import Slider from "@react-native-community/slider";
import VideoOverlay from "./player/VideoOverlay";

// Replace these later with vector icons
const PlayIcon = () => <Text style={styles.icon}>▶️</Text>;
const PauseIcon = () => <Text style={styles.icon}>⏸️</Text>;
const FullscreenIcon = () => <Text style={styles.icon}>⛶</Text>;
const ExitFullscreenIcon = () => <Text style={styles.icon}>❌</Text>;

export default function App() {
  const playerRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  const handleFullscreenToggle = () => {
    setFullscreen(!fullscreen);
  };

  const handleSeek = (time) => {
    playerRef.current?.seekTo?.(time); // tell player to jump
    setCurrentTime(time);
  };

  return (
    <View style={styles.container}>
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
        // 🔹 Callbacks from player
        onBuffer={(state) => setBuffering(state)}
        onLoad={(meta) => setDuration(meta.duration)}
        onProgress={(time) => setCurrentTime(time)}
        onSeek={(time) => setCurrentTime(time)}
        onFullscreenToggle={handleFullscreenToggle}
        onEnd={() => {
          console.log("Video ended");
          // setCurrentTime(0);
          // setPaused(true);
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

      {/* Seekbar */}
      {/* <Slider
        style={styles.seekbar}
        minimumValue={0}
        maximumValue={duration}
        value={currentTime}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#888888"
        thumbTintColor="#FFFFFF"
        onSlidingComplete={handleSeek} // jump when released
      /> */}

      {/* Debug Status */}
      <Text style={styles.status}>
        {buffering
          ? "Buffering..."
          : `Time: ${currentTime.toFixed(1)} / ${duration.toFixed(1)}`}
      </Text>
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
  seekbar: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  icon: { fontSize: 28, color: "white" },
  status: { color: "white", textAlign: "center", marginTop: 10 },
});
