import React from 'react';
import StoryViewer from './StoryViewer';

// Define stories based on platform
const stories = [
        "https://imagecdn.99acres.com/hls/case14/master.m3u8",
        "https://imagecdn.99acres.com/hls/case13/master.m3u8",
        "https://imagecdn.99acres.com/hls/case12/master.m3u8",
        "https://imagecdn.99acres.com/project/videos/stories/g5kri0c_1730531452_528268489_optOrig.mp4",
        "https://imagecdn.99acres.com/project/videos/stories/wlamzcx_1730531473_528268513_optOrig.mp4",
        "https://imagecdn.99acres.com/project/videos/stories/evuvigl_1730531481_528268545_optOrig.mp4",
        "https://imagecdn.99acres.com/project/videos/stories/vp7xa8e_1730531489_528268633_optOrig.mp4",
        "https://imagecdn.99acres.com/project/videos/stories/ltrtd15_1730531499_528268661_optOrig.mp4",
        "https://imagecdn.99acres.com/loanTest/Horizontal_compressed.mp4",
        "https://imagecdn.99acres.com/loanTest/Shivam_Home_loan_final2_compressed.mp4"
        // Add more app-specific URLs here
    ];

export default function Stories() {
    return <StoryViewer stories={stories} />;
}


// import React from 'react';
// import StoryViewer from './StoryViewer';

// const stories = [
//     "https://imagecdn.99acres.com/project/videos/stories/g5kri0c_1730531452_528268489_optOrig.mp4",
//     "https://imagecdn.99acres.com/project/videos/stories/wlamzcx_1730531473_528268513_optOrig.mp4",
//     "https://imagecdn.99acres.com/project/videos/stories/evuvigl_1730531481_528268545_optOrig.mp4",
//     "https://imagecdn.99acres.com/project/videos/stories/vp7xa8e_1730531489_528268633_optOrig.mp4",
//     "https://imagecdn.99acres.com/project/videos/stories/ltrtd15_1730531499_528268661_optOrig.mp4",
//     "https://imagecdn.99acres.com/loanTest/Horizontal_compressed.mp4",
//     "https://imagecdn.99acres.com/loanTest/Shivam_Home_loan_final2_compressed.mp4"
//     // Add more video URLs here
// ];

// export default function Stories() {
//     return <StoryViewer stories={stories} />;
// }
