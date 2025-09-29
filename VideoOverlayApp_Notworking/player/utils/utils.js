// utils.js

export async function fetchManifest(url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      return text;
    } catch (error) {
      throw new Error('Failed to fetch manifest:', error);
    }
  }

 export function extractHlsUrlsFromManifest(manifest) {
  const lines = manifest.split('\n');
  const urls = [];
  let isStreamInf = false;

  for (const line of lines) {
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      isStreamInf = true;
    } else if (isStreamInf) {
      urls.push(line.trim());
      isStreamInf = false;
    }
  }
  return urls;
}

export function getBaseUrl(src){
    // Use regex to remove everything after the last '/'
    return src.replace(/\/[^/]*$/, '/');
}

export function extractResolutionHeightsFromManifest(manifest) {
    const lines = manifest.split('\n');
    const resolutions = [];
    
    let isStreamInf = false;
  
    // Iterate through each line in the manifest
    for (const line of lines) {
      if (line.startsWith('#EXT-X-STREAM-INF')) {
        // Match the resolution height using a regular expression from the EXT-X-STREAM-INF line
        const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
        if (resolutionMatch) {
          const resolution = resolutionMatch[1].split('x')[1]; // Get the height (second part of the resolution)
          resolutions.push(parseInt(resolution, 10));
        }
      }
    }
  
    return resolutions;
  }
  


// export const resolutions = [240, 360, 720, 1080];