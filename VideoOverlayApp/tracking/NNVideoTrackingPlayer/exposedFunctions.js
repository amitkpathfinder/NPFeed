import { NNTrackingDataHandler } from "../NNTrackingDataHandler";
import {
  getTrackingObjectForVideoTracking,
  sendTracking,
} from "../NNTrackingutils";

const EVENT_PLAYBACK_PAUSE = "PLAYBACK_PAUSE";
const EVENT_PLAYBACK_START = "PLAYBACK_START";
const EVENT_PLAYBACK_END = "PLAYBACK_END";
const EVENT_PLAYBACK_ERROR_RETRY = "PLAYBACK_ERROR_RETRY";
const EVENT_PLAYER_LOADED = "PLAYER_LOADED";
const STAGE_FINAL = "FINAL";

export const sendPlaybackPauseTracking = ({
  page_name = "",
  section_name = "",
  custom_object = null,
  payload = null,
}) => {
  let trackingParams = {
    page_name: page_name,
    stage: STAGE_FINAL,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    clientId: NNTrackingDataHandler.getData("clientId"),
    appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
  };
  const updated_trackingParams = {
    ...trackingParams,
    event: EVENT_PLAYBACK_PAUSE,
  };

  const trackingObject = getTrackingObjectForVideoTracking(
    updated_trackingParams
  );
  sendTracking(trackingObject);
};

export const sendPlaybackStartTracking = ({
  page_name = "",
  section_name = "",
  custom_object = null,
  payload = null,
}) => {
  let trackingParams = {
    page_name: page_name,
    stage: STAGE_FINAL,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    clientId: NNTrackingDataHandler.getData("clientId"),
    appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
  };
  const updated_trackingParams = {
    ...trackingParams,
    event: EVENT_PLAYBACK_START,
  };

  const trackingObject = getTrackingObjectForVideoTracking(
    updated_trackingParams
  );
  sendTracking(trackingObject);
};

export const sendPlaybackEndTracking = ({
  page_name = "",
  section_name = "",
  custom_object = null,
  payload = null,
}) => {
  let trackingParams = {
    page_name: page_name,
    stage: STAGE_FINAL,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    clientId: NNTrackingDataHandler.getData("clientId"),
    appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
  };
  const updated_trackingParams = {
    ...trackingParams,
    event: EVENT_PLAYBACK_END,
  };

  const trackingObject = getTrackingObjectForVideoTracking(
    updated_trackingParams
  );
  sendTracking(trackingObject);
};

export const sendPlaybackErrorTracking = ({
  page_name = "",
  section_name = "",
  custom_object = null,
  payload = null,
}) => {
  let trackingParams = {
    page_name: page_name,
    stage: STAGE_FINAL,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    clientId: NNTrackingDataHandler.getData("clientId"),
    appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
  };
  const updated_trackingParams = {
    ...trackingParams,
    event: EVENT_PLAYBACK_ERROR_RETRY,
  };

  const trackingObject = getTrackingObjectForVideoTracking(
    updated_trackingParams
  );
  sendTracking(trackingObject);
};

export const sendPlayerLoadedTracking = ({
  page_name = "",
  section_name = "",
  custom_object = null,
  payload = null,
}) => {
  let trackingParams = {
    page_name: page_name,
    stage: STAGE_FINAL,
    section: section_name,
    custom_object: custom_object,
    payload: payload,
    clientId: NNTrackingDataHandler.getData("clientId"),
    appVersionCode: NNTrackingDataHandler.getData("AppVersionCode"),
  };
  const updated_trackingParams = {
    ...trackingParams,
    event: EVENT_PLAYER_LOADED,
  };

  const trackingObject = getTrackingObjectForVideoTracking(
    updated_trackingParams
  );
  sendTracking(trackingObject);
};
