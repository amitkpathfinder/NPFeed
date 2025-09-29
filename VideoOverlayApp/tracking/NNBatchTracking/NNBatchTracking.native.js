import { useEffect } from 'react';
import { connect } from 'react-redux';
import { AppState} from 'react-native';
import { sendEventData } from '@nnshared/nnthirdpartyeventssdk';
import { sendTracking } from '../NNTrackingutils';
import { fetch } from '@react-native-community/netinfo';
import { MMKV } from 'react-native-mmkv';
import { getDateTime } from '../NNTrackingutils';

// const {CsTrackingModule,ReactCommManager} = NativeModules;

// Initialize MMKV storage
export const storage = new MMKV();

const NNBatchTracking = ({
  viewPortSections,
  trackIndex,
  trackingObjects,
  updateTrackIndex,
  customObjects,
  moEngageEvents,
  disableNativeWorker = false,
  realTimeEventList = []
}) => {
  // const sendEventsToNative = (trackingObjectToSend) => {
  //   switch (Platform.OS) {
  //     case 'android':
  //         console.log("TRACKING OBJECT ----> ",trackingObjectToSend);
  //         CsTrackingModule?.saveRNFinalViewTracking(trackingObjectToSend);
  //         break;
  //     case 'ios':
  //         console.log("IOS TRACKING OBJECT ----> ",trackingObjectToSend);
  //         ReactCommManager?.saveRNFinalViewTracking(trackingObjectToSend);
  //         break;
  //     default:
  //         break;
  // }
  // }

  const fireEvents = (trackingObjectToSend) => {
    fetch().then(state => {
      if (state?.isConnected) {
        try {
          const storedData = JSON.parse(storage.getString('track_data'));
          console.log("Data to fire:", JSON.stringify([...storedData, trackingObjectToSend]));
          sendTracking("data=" + JSON.stringify([...storedData, trackingObjectToSend]));
          // Clear stored data
          storage.set('track_data', '');
          storage.set('track_data_count', 0);
        }
        catch(e) {
          console.log("error sending tracking : ",e);
        }
      }
    });
  }

  const fireRemainingEvents = () => {
     // Check network connectivity
     fetch().then(state => {
      if (state?.isConnected) {
        try {
        // Retrieve and send stored tracking data
        const storedData = JSON.parse(storage.getString('track_data'));
        console.log("Data to fire:", JSON.stringify(storedData));
        sendTracking("data=" + JSON.stringify(storedData));
        // Clear stored data
        storage.set('track_data', '');
        storage.set('track_data_count', 0);
      }
      catch(e) {
        console.log("error in sending tracking : ",e);
      }
      }
    });
  }

  const saveEventInBatch = (trackingObjectToSend,data_count) => {
    console.log("Saving tracking:", trackingObjectToSend);
          try {
          if (data_count > 0) {
            storage.set('track_data', JSON.stringify([...JSON.parse(storage.getString('track_data')), trackingObjectToSend]));
          } else {
            storage.set('track_data', JSON.stringify([trackingObjectToSend]));
          }
          storage.set('track_data_count', data_count + 1);
        }
        catch(e) {
          console.log("error in saving tracking : ",e);
        }
  }

  // Effect to handle background tracking and network connectivity
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState.includes('background') && storage.getNumber('track_data_count') > 0) {
        fireRemainingEvents();
      }
    });

    // Cleanup function to remove the event listener
    return () => {
      subscription.remove();
    };
  }, []);

  // Effect to track viewport sections and send tracking events
  useEffect(() => {
    if (Object.keys(trackingObjects).length > 0 && trackIndex < viewPortSections.length) {
      const trackingObject = trackingObjects[viewPortSections[trackIndex]];

      if (trackingObject && trackingObject != null) {
        try {
        // Parse tracking object and merge custom objects
        let trackingObjectToSend = JSON.parse(trackingObject.slice(5))[0];
        trackingObjectToSend["csTrackingModel"]['date_time'] = getDateTime();
        if (customObjects[viewPortSections[trackIndex]] && Object.keys(customObjects[viewPortSections[trackIndex]]).length > 0) {
          trackingObjectToSend["csTrackingModel"] = {
            ...trackingObjectToSend.csTrackingModel,
            custom_object: {
              ...trackingObjectToSend.csTrackingModel.custom_object,
              ...customObjects[viewPortSections[trackIndex]]
            }
          };
        }

        if(realTimeEventList.includes(viewPortSections[trackIndex])) {
          console.log("sending real time tracking : ",viewPortSections[trackIndex]);
          sendTracking("data="+JSON.stringify([trackingObjectToSend]));
        }
        else
        // if(disableNativeWorker) 
          {
          // Check if the number of stored tracking events exceeds a threshold
          const data_count = storage.getNumber('track_data_count') || 0;
          if (data_count >= 9) {
            // Send stored tracking events if connected
            fireEvents(trackingObjectToSend);
          } else {
            // Store tracking event locally
            saveEventInBatch(trackingObjectToSend,data_count);
          }
        }
        // else {
        //   sendEventsToNative(trackingObjectToSend);
        // }

        // Send MoEngage event if available
        if (moEngageEvents && moEngageEvents[viewPortSections[trackIndex]]) {
          const event_data = moEngageEvents[viewPortSections[trackIndex]];
          sendEventData('SECTION_VIEW', event_data, 'MO_ENGAGE');
        }
        }
        catch {
          console.log("error in sending tracking");
        }
      }

      // Update track index
      updateTrackIndex();
    }
  }, [viewPortSections]);

  return null;
};

// Map state to props
const mstp = (state) => {
  const stackScreenName = state?.NNTrackingReducer?.stackNavigatorData?.stackScreenName;
  const pagerViewIndex = state?.NNTrackingReducer?.pagerViewData?.pagerViewIndex;
  const tabScreenName = state?.NNTrackingReducer?.tabNavigatorData?.tabScreenName;
  // Determine tracking data based on stack screen name
  const dataForNormalTracking = {
    viewPortSections: state?.NNTrackingReducer?.viewPortSections || [],
    trackIndex: state?.NNTrackingReducer?.trackIndex || 0,
    trackingObjects: state?.NNTrackingReducer?.trackingObjects || {},
    customObjects: state?.NNTrackingReducer?.customObjects || {},
    moEngageEvents: state?.NNTrackingReducer?.moEngageEvents || {},
    realTimeEventList: state?.NNTrackingReducer?.realTimeEventList || []
  };
  const dataForStackTracking = {
    viewPortSections: state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.viewPortSections || [],
    trackIndex: state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.trackIndex || 0,
    trackingObjects: state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.trackingObjects || {},
    customObjects: {}
  };
  const dataForPagerTracking = {
    viewPortSections: state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.viewPortSections || [],
    trackIndex: state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.trackIndex || 0,
    trackingObjects: state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.trackingObjects || {},
    customObjects: {}
  };
  const dataForTabTracking = {
    viewPortSections: state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.viewPortSections || [],
    trackIndex: state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.trackIndex || 0,
    trackingObjects: state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.trackingObjects || {},
    customObjects: {}
  }
  if(stackScreenName==null && pagerViewIndex==null && tabScreenName==null) {
    return dataForNormalTracking;
  }
else{
  return stackScreenName?dataForStackTracking: pagerViewIndex?dataForPagerTracking: dataForTabTracking;
}
}
// Map dispatch to props
const mdtp = (dispatch) => ({
  updateTrackIndex: () => dispatch({
    type: 'UPDATE/TRACK_INDEX'
  })
});

export default connect(mstp, mdtp)(NNBatchTracking);