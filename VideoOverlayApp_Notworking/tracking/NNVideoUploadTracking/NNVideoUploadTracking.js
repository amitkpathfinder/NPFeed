import { NNTrackingDataHandler } from "../NNTrackingDataHandler";
import {
    getTrackingObjectForVideoTracking,
    sendTracking,
  } from "../NNTrackingutils";

const EVENT_NAME = 'VIDEO_UPLOAD';
const STAGE_INITIATION = 'INITIATION';
const STAGE_COMPRESSION_COMPLETION = 'COMPRESSION_COMPLETION';
const STAGE_CHUNK_CREATION = 'CHUNK_CREATION';
const STAGE_CHUNK_INITIATION = 'CHUNK_INITIATION';
const STAGE_CHUNK_COMPLETION = 'CHUNK_COMPLETION';
const STAGE_CHUNK_FAILURE = 'CHUNK_FAILURE';
const STAGE_CHUNK_RETRY = 'CHUNK_RETRY';
const STAGE_FAILURE = 'FAILURE';
const STAGE_COMPLETION = 'COMPLETION';

export const sendVideoInitiationTracking = ({
  page_name = "",
  section_name = "",
  custom_object = null,
  payload = null,
}) => {
  let trackingParams = {
    page_name: page_name,
    stage: STAGE_INITIATION,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    clientId: NNTrackingDataHandler.getData("clientId"),
    appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
  };
  const updated_trackingParams = {
    ...trackingParams,
    event: EVENT_NAME,
  };

  const trackingObject = getTrackingObjectForVideoTracking(
    updated_trackingParams
  );
  sendTracking(trackingObject);
};

export const sendVideoCompressionTracking = ({
    page_name = "",
    section_name = "",
    custom_object = null,
    payload = null,
  }) => {
    let trackingParams = {
      page_name: page_name,
      stage: STAGE_COMPRESSION_COMPLETION,
      section: section_name,
      custom_object: custom_object,
      payload: payload,
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    };
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_NAME,
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
  };

  export const sendVideoChunkCreationTracking = ({
    page_name = "",
    section_name = "",
    custom_object = null,
    payload = null,
  }) => {
    let trackingParams = {
      page_name: page_name,
      stage: STAGE_CHUNK_CREATION,
      section: section_name,
      custom_object: custom_object,
      payload: payload,
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    };
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_NAME,
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
  };

  export const sendVideoChunkInitiationTracking = ({
    page_name = "",
    section_name = "",
    custom_object = null,
    payload = null,
  }) => {
    let trackingParams = {
      page_name: page_name,
      stage: STAGE_CHUNK_INITIATION,
      section: section_name,
      custom_object: custom_object,
      payload: payload,
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    };
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_NAME,
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
  };

  export const sendVideoChunkCompletionTracking = ({
    page_name = "",
    section_name = "",
    custom_object = null,
    payload = null,
  }) => {
    let trackingParams = {
      page_name: page_name,
      stage: STAGE_CHUNK_COMPLETION,
      section: section_name,
      custom_object: custom_object,
      payload: payload,
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    };
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_NAME,
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
  };

  export const sendVideoChunkFailureTracking = ({
    page_name = "",
    section_name = "",
    custom_object = null,
    payload = null,
  }) => {
    let trackingParams = {
      page_name: page_name,
      stage: STAGE_CHUNK_FAILURE,
      section: section_name,
      custom_object: custom_object,
      payload: payload,
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    };
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_NAME,
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
  };

  export const sendVideoChunkRetryTracking = ({
    page_name = "",
    section_name = "",
    custom_object = null,
    payload = null,
  }) => {
    let trackingParams = {
      page_name: page_name,
      stage: STAGE_CHUNK_RETRY,
      section: section_name,
      custom_object: custom_object,
      payload: payload,
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    };
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_NAME,
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
  };

  export const sendVideoFailureTracking = ({
    page_name = "",
    section_name = "",
    custom_object = null,
    payload = null,
  }) => {
    let trackingParams = {
      page_name: page_name,
      stage: STAGE_FAILURE,
      section: section_name,
      custom_object: custom_object,
      payload: payload,
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    };
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_NAME,
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
  };

  export const sendVideoCompletionTracking = ({
    page_name = "",
    section_name = "",
    custom_object = null,
    payload = null,
  }) => {
    let trackingParams = {
      page_name: page_name,
      stage: STAGE_COMPLETION,
      section: section_name,
      custom_object: custom_object,
      payload: payload,
      clientId: NNTrackingDataHandler.getData("clientId"),
      appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
    };
    const updated_trackingParams = {
      ...trackingParams,
      event: EVENT_NAME,
    };
  
    const trackingObject = getTrackingObjectForVideoTracking(
      updated_trackingParams
    );
    sendTracking(trackingObject);
  };