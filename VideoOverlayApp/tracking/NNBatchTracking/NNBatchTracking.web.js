/*
NNBatchTracking.web.js is a non-mandatory file for web which handles batching of the SECTION_VIEW FINAL calls in web.
*/
import React, { useEffect, useRef } from "react";
import {connect} from "react-redux";
import { sendTracking } from "../NNTrackingutils";

// initializing the NNBatchTracking functional component
const NNBatchTracking = (props) => {

    // props spreading
    const {
        batchForWeb,
        emptyBatch,
        enableBatchingForWeb,
        batchingAlreadyEnabled,
        enableAlreadyBatch
    } = props;

    let batchForWebRef = useRef(batchForWeb);

    // function that posts tracking objects
    const executeTracking = () => {
        let batchLocal = batchForWebRef.current;
        if(batchLocal.length == 0)
            return;
        let trackingData = "trackingData[]=" + JSON.stringify(batchLocal);
        console.log("trackingData in batchtracking :: ",trackingData);
        
        // sending tracking object to clicksteam service
        sendTracking(trackingData)
        
        // emptying the batch that is sent
        emptyBatch();
    }

    // callback function executed from useEffect event listeners
    const executeOnUnload = () => {
        executeTracking();
    };
    
    let interval;

    // sets batching flag in NNTrackingReducer to true
    useEffect(() => {
        window.rn_track_batch = true;
    },[]);

    useEffect(() => {

        /*  This is a callback fuction passed to the below event listeners that 
            fires remaining tracking objects when tab is in a hidden state
        */
        const handleVisibilityChange = () => {
            if (document.hidden) {
                executeOnUnload();
            }
        };

        // event listener that executes when the tab is closed
        window.addEventListener('beforeunload', executeOnUnload);

        // event listener that executes when the tab visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // on component unmount, these event listeners gets removed
        return () => {
            window.removeEventListener('beforeunload', executeOnUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        batchForWebRef.current = batchForWeb;
    },[batchForWeb]);
    
    /* timer function that checks the count of tracking objects every 3 seconds
       if count is greater than 5, then sends the batched tracking
    */
    const startTimer = () => {
        interval = setInterval(() => {
            if (batchForWebRef.current.length >= 5) {
                executeTracking();
            }
        }, 3000);
    }

    // checks if batching is not already applied on page, then starts the timer function
    useEffect(() => {
        if(!batchingAlreadyEnabled)
        {
            enableAlreadyBatch();
            startTimer();
        }
    });

    return null;
};

// subscribing the required states from the NNTrackingReducer
const mstp = (state) => {
    return {
        batchForWeb : state.NNTrackingReducer.batchForWeb || [],
        batchingAlreadyEnabled : state.NNTrackingReducer.batchingAlreadyEnabled || false,
    };
};

// defining the required action methods to modify states' values in NNTrackingReducer
const mdtp = (dispatch) => ({
    emptyBatch : () => dispatch({type : 'EMPTY/TRACK_BATCH'}),
    enableBatchingForWeb : () => dispatch({type : 'ENABLE/BATCH_WEB'}),
    enableAlreadyBatch : () => dispatch({type : 'SET/BATCH_FLAG'})
})

// default exporting the NNBatchTracking component
export default connect(mstp,mdtp)(NNBatchTracking);
