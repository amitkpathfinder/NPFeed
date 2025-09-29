import Video from "react-native-video";
import React, { useEffect, useRef } from "react";
import YoutubePlayer from "react-native-youtube-iframe";
import {
  getTrackingObjectForVideoTracking,
  sendTracking,
  getTrackingObjectForSectionTacking
} from "../NNTrackingutils";
import { NNTrackingDataHandler } from "../NNTrackingDataHandler";
import { connect } from "react-redux";

const EVENT_PLAYBACK_PAUSE = "PLAYBACK_PAUSE";
const EVENT_PLAYBACK_START = "PLAYBACK_START";
const EVENT_PLAYBACK_END = "PLAYBACK_END";
const EVENT_PLAYBACK_ERROR_RETRY = "PLAYBACK_ERROR_RETRY";
const EVENT_PLAYER_LOADED = "PLAYER_LOADED";
const STAGE_FINAL = "FINAL";
const EVENT_NAME_FOR_CLICK = "CLICK";

const NNVideoTrackingPlayer = (props, ref) => {
  const {
    onEnd = null,
    onError = null,
    onLoad = null,
    iFrame = false,
    onReady = null,
    onChangeState = null,
    page_name = '',
    section_name = '',
    custom_object = null,
    payload = null,
    referrer = '',
    paused = false,
    muted = false,
    onReadyForDisplay = null,
    page_type = '',
    search = {}
  } = props;

  const reference = useRef(null);
  const onreadyReference=useRef(null);


  useEffect(() => {

    // PAUSE Tracking
    if(!iFrame && paused && onreadyReference.current){
      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYBACK_PAUSE,
      };
      reference.current = true;
      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );
      console.log("Video Tracking : PLAYBACK_PAUSE : ",trackingObject);
      sendTracking(trackingObject);
    }
    else
    if(!iFrame && reference.current && !paused && onreadyReference.current){
      // PLAYBACK_START
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_START,
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );

    console.log("Video Tracking : PLAYBACK_START : ",trackingObject);

    sendTracking(trackingObject);
    }

  },[paused]);

  useEffect(() => {

    if(!iFrame && muted && onreadyReference.current) {
      // muted
      fireCustomEvents(`${section_name}_MUTED`,EVENT_NAME_FOR_CLICK);
    }
    else
    if(!iFrame && !muted && onreadyReference.current) {
      // unmuted
      fireCustomEvents(`${section_name}_UNMUTED`,EVENT_NAME_FOR_CLICK);
    }

  },[muted]);

  const fireCustomEvents = (section_name,event) => {
    const paramsForCustomEvent = {
      page_name: page_name,
      event: event,
      stage: STAGE_FINAL,
      section: section_name ,
      custom_object: {custom_object,payload,search},
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
      referrer: NNTrackingDataHandler.getData("referrer") || referrer,
      current_url : NNTrackingDataHandler.getData("current_url"),
      page_type : page_type
  };
    const trackingObjectForCustomTracking = getTrackingObjectForSectionTacking(paramsForCustomEvent);
    console.log("Custom Event Tracking : ",trackingObjectForCustomTracking);
    sendTracking(trackingObjectForCustomTracking);
  }

  let trackingParams = {
    page_name: page_name,
    stage: STAGE_FINAL,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    search: search,
    clientId: NNTrackingDataHandler.getData("clientId"),
    appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    referrer: NNTrackingDataHandler.getData("referrer") || referrer,
    current_url : NNTrackingDataHandler.getData("current_url"),
    page_type : page_type
  };

  const override_onEnd = () => {
    // PLAYBACK_END
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_END,
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
    console.log("Video Tracking : PLAYBACK_END : ",trackingObject);
    if(onEnd){
      onEnd();
    }
  };

  const override_onError = () => {
    // PLAYBACK_ERROR_RETRY
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_ERROR_RETRY,
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    console.log("Video Tracking : PLAYBACK_ERROR_RETRY : ",trackingObject);
    sendTracking(trackingObject);
    if(onError){
      onError();
    }
  };

  const override_onLoad = (event) => {
    // PLAYER_LOADED
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYER_LOADED,
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    console.log("Video Tracking : PLAYER_LOADED : ",trackingObject);
    sendTracking(trackingObject);
    if(onLoad){
      onLoad(event);
    }
  };

  const override_onReady = () => {
    // PLAYER_LOADED
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYER_LOADED,
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );

    console.log("Video Tracking : PLAYER_LOADED : ",trackingObject);

    sendTracking(trackingObject);
    if(onReady){
      onReady();
    }
  };

  const override_onChangeState = (event) => {
    if (event == "paused") {
      // PLAYBACK_PAUSE
      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYBACK_PAUSE,
      };

      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );

      console.log("Video Tracking : PLAYBACK_PAUSE : ",trackingObject);

      sendTracking(trackingObject);
    } else if (event == "playing") {
      // PLAYBACK_START
      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYBACK_START,
      };

      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );

      console.log("Video Tracking : PLAYBACK_START : ",trackingObject);

      sendTracking(trackingObject);
    } else if (event == "ended") {
      // PLAYBACK_END
      const updated_trackingParams = {
        ...trackingParams,
        event: EVENT_PLAYBACK_END,
      };

      const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );

      console.log("Video Tracking : PLAYBACK_END : ",trackingObject);

      sendTracking(trackingObject);
    }
    if(onChangeState){
      onChangeState(event);
    }
  };

  const override_onReadyForDisplay = () => {
    // PLAYBACK_START
    if (!onreadyReference.current) {
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_START,
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );

      console.log("Video Tracking : PLAYBACK_START : ", trackingObject);

    sendTracking(trackingObject);
      onreadyReference.current = true;
      if (onReadyForDisplay) {
      onReadyForDisplay();
      }
    }
  }

  return iFrame ? (
    <YoutubePlayer
      {...props}
      ref={ref}
      onReady={override_onReady}
      onChangeState={override_onChangeState}
      onError={override_onError}
    />
  ) : (
    <Video
      {...props}
      ref={ref}
      onEnd={override_onEnd}
      onError={override_onError}
      onLoad={override_onLoad}
      onReadyForDisplay={override_onReadyForDisplay}
    />
  );
};

const mstp = (state) => {
  const pagerViewIndex = state?.NNTrackingReducer?.pagerViewData?.pagerViewIndex;
  const page_type = state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.pager_view_data?.label || '';
  return { page_type };
};

export default connect(mstp, null, null, { forwardRef: true })(React.forwardRef(NNVideoTrackingPlayer));