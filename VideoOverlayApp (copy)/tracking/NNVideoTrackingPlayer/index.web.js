import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import {
  getTrackingObjectForVideoTracking,
  sendTracking
} from "../NNTrackingutils";
import { createCustomInfoForSection } from "../NNTrackingutils.web";

const EVENT_PLAYBACK_PAUSE = "PLAYBACK_PAUSE";
const EVENT_PLAYBACK_START = "PLAYBACK_START";
const EVENT_PLAYBACK_END = "PLAYBACK_END";
const EVENT_PLAYBACK_ERROR_RETRY = "PLAYBACK_ERROR_RETRY";
const EVENT_PLAYER_LOADED = "PLAYER_LOADED";
const STAGE_FINAL = "FINAL";
const EVENT_PLAYER_BUFFER = "PLAYER_BUFFER";

const NNVideoTrackingPlayer = (props,ref) => {

  const { section_name, page_name, playerConfig, playerProps = {}, custom_object={}, payload = {} } = props;

  const {
    events: {
      onReady = () => {},
      onStateChange = () => {},
      onError = () => {},
    } = {},
  } = props.playerConfig || {};

  const getDataFromDOMNodes = () => {
    let page_name_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('data-label');
    let scope_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('scope');
    let data_global_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('data-custominfo');
    let page_version = '';
    let page_type = '';
    let tab_data = {};

    if(document?.getElementById('srpClickstreamObject') && typeof document?.getElementById('srpClickstreamObject').value == 'string') {
        data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('srpClickstreamObject').value) || {}};
    }
    if((page_name == 'LOCATION_SRP' || page_name_from_body_tag == 'LOCATION_SRP') && document?.getElementById('localitySrpClickstreamObject') && typeof document?.getElementById('localitySrpClickstreamObject').value == 'string') {
        data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('localitySrpClickstreamObject').value) || {}};
    }
    if((page_name == 'NPSRP' || page_name_from_body_tag == 'NPSRP') && document?.getElementById('npsrpClickstreamObject') && typeof document?.getElementById('npsrpClickstreamObject').value == 'string') {
        data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('npsrpClickstreamObject').value) || {}};
    }
    if(document?.getElementsByTagName('body')[0]?.getAttribute('page_version')) {
      page_version = document?.getElementsByTagName('body')[0]?.getAttribute('page_version');
    }
    if(document.getElementById('tab-container') && document.getElementById('tab-container').getAttribute('tab-data')) {
      const tab_dom_data = JSON.parse(document.getElementById('tab-container').getAttribute('tab-data'));
      page_type = tab_dom_data?.label;
      tab_data = typeof tab_dom_data?.data == 'string' ? JSON.parse(tab_dom_data?.data) : tab_dom_data?.data;
    }

    if(typeof data_global_from_body_tag == 'string') {
        data_global_from_body_tag = JSON.parse(data_global_from_body_tag);
    }

    return {
        page_name_from_body_tag,
        scope_from_body_tag,
        data_global_from_body_tag,
        page_version,
        page_type,
        tab_data
    }
  }


  const playerRef = useRef(null);
  const youtubePlayerRef = ref ? ref : useRef(null);

  const loadYouTubeAPI = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onload = () => {
        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };
      };
      tag.onerror = (error) => {
        reject(error);
      };
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
  }, []);

  const initializePlayer = useCallback(() => {
    if (!playerRef.current) {
      return;
    }

    const player = new window.YT.Player(playerRef.current, {
      ...playerConfig,
      events: {
        onReady: onReadyStateChange,
        onStateChange: onStateChanged,
        onError: onErrorOccur,
      },
    });
    youtubePlayerRef.current = player;

  }, []);

  useEffect(() => {
    (async () => {
      await loadYouTubeAPI();
      initializePlayer();
    })();
    return () => {};
  }, []);

  let trackingParams = {
    stage: STAGE_FINAL,
    section: section_name
  };

  const onErrorOccur = (event) => {

    const {
      page_name_from_body_tag,
      scope_from_body_tag,
      data_global_from_body_tag,
      page_version,
      page_type,
      tab_data
    } = getDataFromDOMNodes();

    let data_custom_info_global = data_global_from_body_tag;

    if(Object.keys(tab_data).length > 0) {
      data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
    }
  
    const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);

    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYBACK_ERROR_RETRY,
      error:event.data,
      scope: scope_from_body_tag,
      page_name : page_name || page_name_from_body_tag,
      custom_object : custom_object_new,
      page_version: page_version,
      page_type: page_type
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    console.log("Video Tracking : PLAYBACK_ERROR_RETRY : ", trackingObject);
    sendTracking(trackingObject);
    onError(event);
  };

  const onReadyStateChange = (event) => {
    if (!youtubePlayerRef.current || typeof youtubePlayerRef.current.getDuration !== "function") {
      setTimeout(() => onReadyStateChange(event), 500);
      return;
    }
    
    const {
      page_name_from_body_tag,
      scope_from_body_tag,
      data_global_from_body_tag,
      page_version,
      page_type,
      tab_data
    } = getDataFromDOMNodes();

    let data_custom_info_global = data_global_from_body_tag;

    if(Object.keys(tab_data).length > 0) {
      data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
    }

    const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);

    const total_duration = youtubePlayerRef.current.getDuration();
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_PLAYER_LOADED,
      total_duration: total_duration,
      scope: scope_from_body_tag,
      page_name : page_name || page_name_from_body_tag,
      custom_object : custom_object_new,
      page_type:page_type,
      page_version:page_version
    };

    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    console.log("Video Tracking : PLAYER_LOADED : ", trackingObject);
    sendTracking(trackingObject);
    onReady(event);
  };

  const onStateChanged = (event) => {

    const {
      page_name_from_body_tag,
      scope_from_body_tag,
      data_global_from_body_tag,
      page_version,
      page_type,
      tab_data
  } = getDataFromDOMNodes();

  let data_custom_info_global = data_global_from_body_tag;

  if(Object.keys(tab_data).length > 0) {
    data_custom_info_global = createCustomInfoForSection(tab_data,data_custom_info_global);
  }

    const custom_object_new = createCustomInfoForSection({custom_object : custom_object,payload : payload},data_custom_info_global);

    const current_duration = youtubePlayerRef.current.getCurrentTime();
    const playerState = event.data;
    let updated_trackingParams = {};
    switch (playerState) {
      case window.YT.PlayerState.PLAYING:
        updated_trackingParams = {
          ...trackingParams,
          event: EVENT_PLAYBACK_START,
          current_duration: current_duration,
          scope: scope_from_body_tag,
          page_name : page_name || page_name_from_body_tag,
          custom_object : custom_object_new,
          page_type : page_type,
          page_version: page_version
        };
        break;
      case window.YT.PlayerState.PAUSED:
        updated_trackingParams = {
          ...trackingParams,
          event: EVENT_PLAYBACK_PAUSE,
          current_duration: current_duration,
          scope: scope_from_body_tag,
          page_name : page_name || page_name_from_body_tag,
          custom_object : custom_object_new,
          page_type : page_type,
          page_version: page_version
        };
        break;
      case window.YT.PlayerState.ENDED:
        updated_trackingParams = {
          ...trackingParams,
          event: EVENT_PLAYBACK_END,
          current_duration: current_duration,
          scope: scope_from_body_tag,
          page_name : page_name || page_name_from_body_tag,
          custom_object : custom_object_new,
          page_type : page_type,
          page_version: page_version
        };
        break;
      case window.YT.PlayerState.BUFFERING:
        updated_trackingParams = {
          ...trackingParams,
          event: EVENT_PLAYER_BUFFER,
          current_duration: current_duration,
          scope: scope_from_body_tag,
          page_name : page_name || page_name_from_body_tag,
          custom_object : custom_object_new,
          page_type : page_type,
          page_version: page_version
        };
        break;
      default:
        console.log("Unhandled player state:", playerState);
    }
        const trackingObject = getTrackingObjectForVideoTracking(
        updated_trackingParams
      );

      sendTracking(trackingObject);
      console.log("Video Tracking : ",trackingObject);

    onStateChange(event);
  };


  return <div ref={playerRef} {...playerProps} />;
};

export default forwardRef(NNVideoTrackingPlayer);
