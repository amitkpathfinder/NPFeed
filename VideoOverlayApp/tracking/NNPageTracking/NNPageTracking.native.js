/*
NNPageTracking.native.js sends the PAGE VIEW LOAD and FINAL Tracking in Apps.
*/
import React, { useEffect,useState } from 'react';
import {connect} from 'react-redux';
import {
    createCustomInfoForPage,
    getTrackingObjectForPageTacking,
    sendTracking,
} from '../NNTrackingutils';
import { NNTrackingDataHandler } from '../NNTrackingDataHandler';
import { NativeModules, Platform } from 'react-native';
import  {useSendPageViewFirebaseEvent, useSendPageViewAppsFlyerEvent,useSendMoEngageEvent,sendEventData}  from '@nnshared/nnthirdpartyeventssdk';
import { fetch } from "@react-native-community/netinfo";
import ReactMoE from 'react-native-moengage';

// defining constants
const EVENT_NAME_FOR_PAGE_VIEW = 'PAGE_VIEW';
const EVENT_NAME_FOR_SEARCH_VIEW = 'SEARCH';
const LOAD_STAGE = 'LOAD';
const FINAL_STAGE = 'FINAL';

// initializing NNPageTracking functional component
const NNPageTracking = (props) => {

    // props spreading
    const {
        children,
        data_custominfo,
        data_custominfo_global,
        trigger,
        workflow,
        source,
        page_name,
        section_name,
        referrer,
        setClientId,
        setGlobalData,
        setAppVersionCode,
        setCurrentUrl,
        setRefferer,
        setPageName,
        clientId,
        appVersionCode,
        message_id,
        current_url_native,
        referrer_native,
        internal_referrer,
        setMoEngageData,
        page_type = '',
        page_version='',
        setPageVersion,
        resendPageView = false,
        onResendPageView = () => {},
        scope = "",
        setScope
    } = props;

    // local state flag to mount the page 
    const [mountPage,setMountPage] = useState(false);
    useSendPageViewFirebaseEvent(page_name,mountPage);
    useSendPageViewAppsFlyerEvent(page_name,mountPage);
    const moEngageData = useSendMoEngageEvent(page_name,mountPage,page_name == 'SRP' ? 'SEARCH' : 'PAGE_VIEW');

    useEffect(() => {
        console.log("moengagedata in pv : ",moEngageData);
        if(typeof moEngageData != 'undefined' && Object.keys(moEngageData).length > 0) {
            setMoEngageData(moEngageData);
            const mo_engage_historical_data = NNTrackingDataHandler.getData('moEngageData');
            NNTrackingDataHandler.setData('moEngageData',{...mo_engage_historical_data,[page_name] : moEngageData});
            sendEventData(page_name == 'SRP' ? 'SEARCH' : 'PAGE_VIEW',moEngageData,'MO_ENGAGE');
        }
    },[moEngageData]);

    const getNetworkInfo = async () => {
        
        let speeds = {};

        if(Platform.OS == 'android')
            await NativeModules.AppInfoModule.getConnectionSpeed().then(res => speeds = JSON.parse(res));

        return fetch().then(state => {
            console.log("state in network : ",state);
            return {
                "network_type" : state?.type,
                "frequency" : state?.details?.frequency?.toString(),
                "generation" : state?.details?.cellularGeneration,
                "strength" : state?.details?.strength?.toString(),
                "upload_speed" : speeds?.upSpeed?.split(' ')[0],
                "download_speed" : speeds?.downSpeed?.split(' ')[0]
            }
          }).catch(err => console.log("error in fetch call for network data : ",err));
    }

    const defaultRef = internal_referrer ? `${internal_referrer}_REFERRER` : 'NOT_EXIST';

    useEffect(()=>{
        if(page_name) {
            let context = 'page_'+page_name.toLowerCase()
            console.log("MOE--Reset all contexts")
            ReactMoE.resetCurrentContext()
            console.log("MOE--Setting context ", context)
            ReactMoE.setCurrentContext([context])
            ReactMoE.showInApp()
            ReactMoE.showNudge()
        }
        return () => {
            if(page_name) {
                ReactMoE.resetCurrentContext();
            }
        }
    },[])

    const sendPageViewTracking = () => {
        //creating custom object
        const custom_object = createCustomInfoForPage(data_custominfo, data_custominfo_global);
        // event name changes in case of SRP Pages
        let eventName = EVENT_NAME_FOR_PAGE_VIEW;
        if (
            page_name === 'SRP' ||
            page_name === 'NPSRP' ||
            page_name === 'GROUP_SRP' ||
            page_name === 'NOTIFICATION_PROPERTY_LIST' ||
            page_name === 'NEW_PROJECT_DESTINATION_PAGE' ||
            page_name === 'NEW_PROJECT_DESTINATION_FEED' ||
            page_name === 'LOCATION_SRP'
        ) {
            eventName = EVENT_NAME_FOR_SEARCH_VIEW;
        }
        let paramsForPageLoadTracking = {
            page_name : page_name,
            event : eventName,
            stage : LOAD_STAGE,
            section : section_name,
            trigger : trigger,
            workflow : workflow,
            source : source,
            referrer : referrer || referrer_native || defaultRef,
            custom_object : custom_object,
            clientId : clientId,
            appVersionCode : appVersionCode,
            current_url : current_url_native,
            message_id:message_id,
            ota_version_name: NNTrackingDataHandler.getData('bundleVersionName'),
            ota_version_code: NNTrackingDataHandler.getData('bundleVersionCode'),
            notifToken: NNTrackingDataHandler.getData('notifToken'),
            page_type: page_type,
            scope : scope,
            page_version: page_version
        };
        let paramsForPageFinalTracking = {
            page_name : page_name,
            event : eventName,
            stage : FINAL_STAGE,
            section : section_name,
            trigger : trigger,
            workflow : workflow,
            source : source,
            referrer : referrer || referrer_native || defaultRef,
            custom_object : custom_object,
            clientId : clientId,
            appVersionCode : appVersionCode,
            current_url : current_url_native,
            message_id:message_id,
            ota_version_name: NNTrackingDataHandler.getData('bundleVersionName'),
            ota_version_code: NNTrackingDataHandler.getData('bundleVersionCode'),
            notifToken: NNTrackingDataHandler.getData('notifToken'),
            page_type : page_type,
            scope : scope,
            page_version: page_version
        };

        getNetworkInfo().then(network_data => {
            paramsForPageLoadTracking = {...paramsForPageLoadTracking,network : network_data};
            paramsForPageFinalTracking = {...paramsForPageFinalTracking,network : network_data};
        }).catch(err => {
            console.log("error getting network data in page view tracking!");
        }).finally(() => {
            // creating PAGE_VIEW LOAD Tracking Object
            const trackingObjectForPageLoadTracking =
                getTrackingObjectForPageTacking(paramsForPageLoadTracking);
            // creating PAGE_VIEW FINAL Tracking Object
            const trackingObjectForPageFinalTracking = getTrackingObjectForPageTacking(paramsForPageFinalTracking);
            // sending PAGE_VIEW LOAD and PAGE_VIEW FINAL Trackings
            sendTracking(trackingObjectForPageLoadTracking);
            sendTracking(trackingObjectForPageFinalTracking);
            console.log("page tracking : ",trackingObjectForPageFinalTracking);
        });
    }

    // function that sets the data recieved from native end to NNTrackingReducer
    const setNativeData = async () => {
        const clientIdLocal = NNTrackingDataHandler.getData("clientId");
        const appVersionCodeLocal = NNTrackingDataHandler.getData("AppVersionCode");
        const currentUrlinData = NNTrackingDataHandler.getData("current_url");
        const currentUrlFromNative =  (currentUrlinData == undefined || currentUrlinData == null || currentUrlinData == "") ? "" : encodeURIComponent(currentUrlinData);
        const reffererinData = NNTrackingDataHandler.getData("referrer") || (Platform.OS == 'android' ? NativeModules?.AppInfoModule?.getCurrentActivityReferrer() : '');
        const reffererFromNative = (reffererinData == undefined || reffererinData == null || reffererinData == "") ? "" : encodeURIComponent(reffererinData);
        setScope(scope);
        setClientId(clientIdLocal);
        setAppVersionCode(appVersionCodeLocal);
        if(currentUrlFromNative)
            setCurrentUrl(currentUrlFromNative);
        if(reffererFromNative)
            setRefferer(reffererFromNative);
        // clearing current_url and referrer from native end data to make sure it is not added in other pages as well
        NNTrackingDataHandler.setData("current_url","");
        NNTrackingDataHandler.setData("referrer","");
        NNTrackingDataHandler.setData('commonApiHeadersFromSDK', { pagename: page_name, platform: Platform.OS });
    }

    // function that sets data globally to the NTrackingReducer
    const setGlobalInfoData = async () => {
        // setting the global info to NNTrackingReducer
        await setGlobalData(data_custominfo_global);
        await setPageName(page_name);
        await setNativeData();
        await setPageVersion(page_version)

        // mounting the page now once global data is successfully set
        setMountPage(true);
    }

    //re-fire page tracking on prop state change
    useEffect(() => {
        if(resendPageView) {
            onResendPageView();
            //resend page view tracking here
            sendPageViewTracking();

        }
    },[resendPageView]);

    // executes on page mounting
    useEffect(() => {

        // checking if page is not mounted then set global data firstly
        if(!mountPage)
            setGlobalInfoData();
        else
        if(page_name) // safety check to ensure page_name is there in every tracking object
        {
        sendPageViewTracking();
    }
    },[mountPage]);

    // intially mountPage will be false hence returning null
    return mountPage ? children : null;
};

const mstp = (state) => {
    const stackScreenName = state?.NNTrackingReducer?.stackNavigatorData?.stackScreenName;
    const pagerViewIndex = state?.NNTrackingReducer?.pagerViewData?.pagerViewIndex;
    const tabScreenName = state?.NNTrackingReducer?.tabNavigatorData?.tabScreenName;
    let dataForNormalTracking =  {
        clientId: state?.NNTrackingReducer?.clientId || '',
        appVersionCode: state?.NNTrackingReducer?.appVersionCode || ''
    };
    if(stackScreenName == null && pagerViewIndex == null && tabScreenName == null) {
        dataForNormalTracking = {
            ...dataForNormalTracking,
            current_url_native: state?.NNTrackingReducer?.current_url_native || '',
            referrer_native : state?.NNTrackingReducer?.referrer_native || ''
        }
    }
    else {
        if(stackScreenName){
            dataForNormalTracking = {
                ...dataForNormalTracking,
                current_url_native: state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.current_url_native || '',
                referrer_native : state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.referrer_native || '',
                internal_referrer : state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.internal_referrer || ''
            }
        }
        else if(pagerViewIndex){
            dataForNormalTracking = {
                ...dataForNormalTracking,
                current_url_native: state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.current_url_native || '',
                referrer_native : state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.referrer_native || '',
                internal_referrer : state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.internal_referrer || '',
                page_type:state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.pager_view_data?.label|| ''
            }
        }
      else{
            dataForNormalTracking = {
                ...dataForNormalTracking,
                current_url_native: state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.current_url_native || '',
                referrer_native : state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.referrer_native || '',
                internal_referrer : state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.internal_referrer || ''
            }
    }
}
    return dataForNormalTracking;
};

const mdtp = (dispatch) => ({
    setClientId : (data) => dispatch({ type: 'SET/TRACKING_CLIENT_ID', data: data }),
    setGlobalData : (data) => dispatch({ type: 'SET/TRACKING_GLOBAL_DATA', data: data }),
    setAppVersionCode : (data) => dispatch({type : 'SET/TRACKING_APP_VERSION', data : data}),
    setPageName : (data) => dispatch({ type: "SET/TRACKING_PAGE_NAME", data: data }),
    setRefferer : (data) => dispatch({type:"SET/TRACKING_REFERRER",data:data}),
    setCurrentUrl: (data) => dispatch({type:"SET/TRACKING_CURRENT_URL",data: data}),
    setMoEngageData : (data) => dispatch({type : 'SET/TRACKING_MO_ENGAGE_DATA',data:data}),
    setPageVersion:(data)=>dispatch({type:"SET/TRACKING_PAGE_VERSION",data:data}),
    setScope : (data) => dispatch({ type: "SET/TRACKING_SCOPE", data: data })
});

export default connect(mstp,mdtp)(NNPageTracking);