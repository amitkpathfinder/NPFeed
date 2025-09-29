/**
 * 
 * Author : @arpit.agari
 * 
 */
import React, {
  forwardRef,
  useEffect,
  useState,
  createContext,
  useRef,
} from "react";
import { View} from "react-native";
import PagerView from "react-native-pager-view";
import { connect } from "react-redux";
import {
  createCustomInfoForSection,
  getTrackingObjectForSectionTacking,
  sendTracking,
} from '../NNTrackingutils';
import { NNTrackingDataHandler } from '../NNTrackingDataHandler';
import { DeviceEventEmitter } from 'react-native';

// constants
const EVENT_NAME_FOR_TAB_SEARCH = 'TAB_SEARCH';
const EVENT_NAME_FOR_TAB_VIEW = 'TAB_VIEW';
const FINAL_STAGE = 'FINAL';

// global variable to keep track of focused page
let focused_Page=-1;

// context
export const PagerViewContext = createContext(null);

// NNPagerView is a HOC over Pager View with the build-in tracking support
const NNPagerView = forwardRef((props, ref) => {

  const {
    pager_views = [],
    initialPage = 0,
    on_Focus = () => {},
    setPagerViewIndex,
    setPagerViewScreenData,
    dataChanged = false,
    style,
    page_name,
    referrer,
    clientId,
    page_name_global,
    appVersionCode = '',
    current_url_native,
    referrer_native,
    pagerViewScreenData,
    pagerViewProps
  } = props;

  const [mount, setMount] = useState(false);
  const focusRef = useRef(initialPage);
  const PAGE_NAME = page_name ? page_name : page_name_global;
  const pagerRef=useRef(null);
  const clientId_fallback = NNTrackingDataHandler.getData('clientId');
  const app_version_fallback = NNTrackingDataHandler.getData('AppVersionCode');
  const pageNameHeaderFallback = NNTrackingDataHandler.getData('commonApiHeadersFromSDK')?.pagename;
  
  
  const triggerTabTracking = (event,pageIndex) => {
    if (PAGE_NAME) {
      if (pageNameHeaderFallback !== PAGE_NAME) {
        NNTrackingDataHandler.setData('commonApiHeadersFromSDK', { pagename: PAGE_NAME, platform: Platform.OS });
      }
      const custom_object = createCustomInfoForSection(null, pager_views[pageIndex].pager_view_data.data);
      const paramsForTabFinalTracking = {
        page_name: PAGE_NAME,
        event:event,
        stage: FINAL_STAGE,
        section: null,
        custom_object:custom_object || {},
        referrer: referrer || referrer_native || "",
        current_url: current_url_native || "",
        clientId: clientId || clientId_fallback || "",
        appVersionCode: appVersionCode || app_version_fallback || "",
        ota_version_name: NNTrackingDataHandler.getData('bundleVersionName') || "",
        ota_version_code: NNTrackingDataHandler.getData('bundleVersionCode') || "",
        notifToken: NNTrackingDataHandler.getData('notifToken')|| "",
      };
      const trackingObjectForTabFinalTracking = getTrackingObjectForSectionTacking(paramsForTabFinalTracking);
      console.log("NNPAGER VIEW TRACKING------ : ",trackingObjectForTabFinalTracking);
      sendTracking(trackingObjectForTabFinalTracking);
    }
  };
  
  // setting global data and mounting the pager view
  useEffect(() => {
    const setGlobalData = () => {
      pager_views.map((item, index) => {
        setPagerViewIndex(index); // intializes all the fields for the given index
        setPagerViewScreenData(index, item.pager_view_data); // sets the pager view data in the given index
      });
      setPagerViewIndex(initialPage) // re-initialize pager view index to initial one
      triggerTabTracking(EVENT_NAME_FOR_TAB_VIEW,initialPage);// trigger TAB_VIEW
      DeviceEventEmitter.emit("TAB_EVENT", null) // emitting TAB_EVENT to notify other components
      setMount(true); // mounting the pager view
      };
      setGlobalData(); // calling setGlobalData function after first render
  }, []);

  // to trigger TAB_SEARCH events
  useEffect(() => {
    if (dataChanged && focused_Page!=-1) {
      props.saveGlobalData(pager_views[focused_Page].pager_view_data)
      triggerTabTracking(EVENT_NAME_FOR_TAB_SEARCH,focused_Page);
      DeviceEventEmitter.emit("TAB_EVENT", null) // emitting TAB_EVENT to notify other components
    }
  }, [dataChanged,focused_Page]);
  
  // to trigger TAB_VIEW events
  const override_On_Focus = (e) => {
    focused_Page = e.nativeEvent.position; // seeing which page is on focus now
      if(focused_Page != props.pagerViewIndex){ // only firing a TAB_VIEW event when page is actually changed
        triggerTabTracking(EVENT_NAME_FOR_TAB_VIEW,focused_Page); // firing TAB_VIEW
        DeviceEventEmitter.emit("TAB_EVENT", null) // emitting TAB_EVENT to notify other components
        /**
         * 
         * Checking for preloadedData : Data which we kept in the reducer of a pager view screen which
         * was mounted earlier but was not in the view port yet.
         * If there is any preloaded data, we are firing those trackings after TAB_VIEW
         */

        const preloadedData = pagerViewScreenData[focused_Page].preloaded_data || [];
        if(preloadedData.length > 0){
          preloadedData.forEach((item) => {
            props.updateViewportItems(item)
          });

          // deleting preloaded data
          props.deletePreloadedData(focused_Page)
        }
      }

      // setting pager-view current focused page index
      setPagerViewIndex(focused_Page);
      focusRef.current = focused_Page;

      // running user's callback function
      if(on_Focus) {
        on_Focus(focused_Page);
      }
  };


  return (
    mount && (
      <PagerView
        ref={pagerRef}
        {...pagerViewProps}
        onPageSelected={override_On_Focus}
        style={style}
      >
        {pager_views.map((item, index) => (
          <View key={index}>
            <PagerViewContext.Provider value={{ focusRef, index }}>
              <item.Component {...props} {...item.component_props} pagerRef={pagerRef}/>
            </PagerViewContext.Provider>
          </View>
        ))}
      </PagerView>
    )
  );
});


const mstp = (state) => {
  const pagerViewIndex = state?.NNTrackingReducer?.pagerViewData?.pagerViewIndex;
  const pagerViewScreenData = state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData;
  const dataForNormalTracking = {
    clientId: state?.NNTrackingReducer?.clientId || '',
    page_name_global: state?.NNTrackingReducer?.page_name || '',
    appVersionCode: state?.NNTrackingReducer?.appVersionCode || '',
    current_url_native:state?.NNTrackingReducer?.current_url_native || '',
    referrer_native:state?.NNTrackingReducer?.referrer_native || '',
  };
  return {
    ...dataForNormalTracking,
    pagerViewScreenData,
    pagerViewIndex,
  };
};

const mdtp = (dispatch) => ({
  updateViewportItems: (section_name) =>{    
    dispatch(
    {
      type: 'UPDATE/TRACKING_VIEWPORT_ITEMS',
      item: section_name,
    })},
  setPagerViewIndex: (data) => {
    dispatch({ type: "SET/PAGER_VIEW_INDEX", data });
  },
  setPagerViewScreenData: (index, data) => {
    dispatch({ type: "UPDATE/PAGER_VIEW_SCREEN_DATA", index, data });
  },
  saveGlobalData:(data)=>{
    dispatch({type:"SET/TRACKING_GLOBAL_DATA",data})
  },
  deletePreloadedData:(index)=>
    dispatch({type:"DELETE/PAGER_VIEW_PRELOADED_DATA",index,data:[]})
});

export default connect(mstp, mdtp)(NNPagerView);
