// utils/videoLogger.js

const videoLogStore = {};

export function logVideoEvent(videoId, eventType) {
  if (!videoLogStore[videoId]) {
    videoLogStore[videoId] = [];
  }

  const logs = videoLogStore[videoId];

  if (
    eventType === "onLoad" ||
    (logs.length === 0 || logs[logs.length - 1].onLoad && logs[logs.length - 1].onReadyForDisplay)
  ) {
    // Start a new session if first log or last one is complete
    logs.push({ [eventType]: Date.now() });
  } else {
    // Update the last session
    logs[logs.length - 1][eventType] = Date.now();
  }
}

export function getVideoLog(videoId) {
  return videoLogStore[videoId] || [];
}

export function getAllLogs() {
  return videoLogStore;
}

export function printComparison() {
  console.log("==== VIDEO LOAD TIME COMPARISON ====");
  Object.entries(videoLogStore).forEach(([videoId, sessions]) => {
    sessions.forEach(({ onLoad, onReadyForDisplay }, index) => {
      const diff = (onLoad && onReadyForDisplay) ? onReadyForDisplay - onLoad : "-";
      console.log(`videoId${videoId} [${index}] - onLoad: ${onLoad}, onReady: ${onReadyForDisplay}, Diff: ${diff}ms`);
    });
  });
}

export function printAverages() {
  console.log("\n==== AVERAGE VIDEO LOAD TIME ====");
  Object.entries(videoLogStore).forEach(([videoId, sessions]) => {
    const diffs = sessions
      .filter(({ onLoad, onReadyForDisplay }) => onLoad && onReadyForDisplay)
      .map(({ onLoad, onReadyForDisplay }) => onReadyForDisplay - onLoad);

    if (diffs.length > 0) {
      const avg = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      console.log(`${videoId} - Average Load Time: ${avg}ms over ${diffs.length} samples`);
    } else {
      console.log(`${videoId} - No valid samples`);
    }
  });
}


// utils/videoLogger.js

// const videoLogStore = {};

// export function logVideoEvent(videoId, eventType) {
//   if (!videoLogStore[videoId]) {
//     videoLogStore[videoId] = {};
//   }
//   videoLogStore[videoId][eventType] = Date.now();

//   // console.log(`[${videoId}] ${eventType} at ${new Date(videoLogStore[videoId][eventType]).toLocaleTimeString()}`);
// }

// export function getVideoLog(videoId) {
//   return videoLogStore[videoId] || {};
// }

// export function getAllLogs() {
//   return videoLogStore;
// }

// export function printComparison() {
//   console.log("==== VIDEO LOAD TIME COMPARISON ====");
//   Object.entries(videoLogStore).forEach(([videoId, times]) => {
//     const load = times.onLoad || 0;
//     const ready = times.onReadyForDisplay || 0;
//     const diff = ready && load ? ready - load : "-";
//     console.log(`${videoId} - onLoad: ${load}, onReady: ${ready}, Diff: ${diff}ms`);
//   });
// }
