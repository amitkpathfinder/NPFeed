/*
NNSectionTracking.native.js sends SECTION_VIEW LOAD , SECTION_VIEW FINAL and CLICK FINAL Trackings.
*/
import React, { useEffect, createContext, useContext } from 'react';
import { connect } from 'react-redux';
import {
    createCustomInfoForSection,
    getTrackingObjectForSectionTacking,
    sendTracking,
} from '../NNTrackingutils';
import { TouchableOpacity, View, NativeModules, Platform } from 'react-native';
import { NNTrackingDataHandler } from '../NNTrackingDataHandler';
import { removeDuplicates } from '../NNTrackingutils';
import { sendEventData } from '@nnshared/nnthirdpartyeventssdk';

// defining constants here
const EVENT_NAME_FOR_SECTION_VIEW = 'SECTION_VIEW';
const EVENT_NAME_FOR_CLICK = 'CLICK';
const LOAD_STAGE = 'LOAD';
const FINAL_STAGE = 'FINAL';

const SectionContext = createContext();

// initializing NNSectionTracking functional component
const NNSectionTracking = (props) => {

    // props spreading
    const {
        children,
        ComponentType = props.onPress ? TouchableOpacity : View,
        onPress,
        data_custominfo,
        data_custominfo_global,
        trigger,
        workflow,
        source,
        page_name,
        section_name,
        referrer,
        clientId,
        page_name_global,
        saveSectionViewTracking,
        sendSectionTracking = false,
        sendSectionFinalOnMount = false,
        customObjects = {},
        appVersionCode = '',
        current_url_native,
        referrer_native,
        enableSectionLoadTracking = false,
        internal_referrer,
        saveMoEngageEvents,
        isEoiFlow = false,
        sendMoEngageEvent = false,
        eoiData,
        moEngageData = {},
        page_type = '',
        disableBatch = false,
        setRealTimeEvents,
        page_version = '',
        scope = ""
    } = props;

    const parentName = useContext(SectionContext);

    // Concatenate parent and current names
    const concatenatedName = (parentName && !sendSectionFinalOnMount) ? `${parentName}${section_name ? `.${section_name}` : ''}` : section_name;

    /* setting PAGE_NAME, checking if page name is passed in props
       otherwise taking the page name value from NNTrackingReducer 
    */
    const PAGE_NAME = page_name ? page_name : page_name_global;

    // Fallback visitorId support
    const clientId_fallback = NNTrackingDataHandler.getData('clientId');
    const app_version_fallback = NNTrackingDataHandler.getData('AppVersionCode');
    const pageNameHeaderFallback = NNTrackingDataHandler.getData('commonApiHeadersFromSDK')?.pagename

    let page_data_mo_engage = Object.keys(moEngageData).length > 0 ? moEngageData : (NNTrackingDataHandler.getData('moEngageData') && NNTrackingDataHandler.getData('moEngageData')[PAGE_NAME]) ? NNTrackingDataHandler.getData('moEngageData')[PAGE_NAME] : {} ;

    let mo_engage_click_event_data = {
        ...page_data_mo_engage,
        section_name : parentName || section_name,
        page_name : PAGE_NAME,
        CTA_name : section_name,
        visitor_id : clientId || clientId_fallback
    };

    let mo_engage_section_event_data = {
        ...page_data_mo_engage,
        section_name : section_name,
        page_name : PAGE_NAME,
        visitor_id : clientId || clientId_fallback
    };

    if(sendMoEngageEvent && isEoiFlow) {
        mo_engage_click_event_data = {...mo_engage_click_event_data,...eoiData};
        mo_engage_section_event_data = {...mo_engage_section_event_data,...eoiData};
    }

    const defaultRef = internal_referrer ? `${internal_referrer}_REFERRER` : 'NOT_EXIST';

    // executed when the component is mounted
    useEffect(() => {

        // starts the flow for SECION_VIEW only if the given condition is true
        if (sendSectionTracking && PAGE_NAME && section_name ) {

            if(pageNameHeaderFallback !== PAGE_NAME){
                NNTrackingDataHandler.setData('commonApiHeadersFromSDK', { pagename: PAGE_NAME, platform: Platform.OS });
            }

            // creating custom_object using NNTrackingutils' function
            const custom_object = createCustomInfoForSection(
                data_custominfo,
                data_custominfo_global
            );
            if(enableSectionLoadTracking) {
                const paramsForSectionLoadTracking = {
                    page_name: PAGE_NAME,
                    event: EVENT_NAME_FOR_SECTION_VIEW,
                    stage: LOAD_STAGE,
                    section: section_name,
                    trigger: trigger,
                    workflow: workflow,
                    source: source,
                    referrer: referrer || referrer_native || defaultRef,
                    current_url: current_url_native,
                    custom_object: custom_object,
                    clientId: clientId || clientId_fallback,
                    appVersionCode: appVersionCode || app_version_fallback,
                    ota_version_name: NNTrackingDataHandler.getData('bundleVersionName'),
                    ota_version_code: NNTrackingDataHandler.getData('bundleVersionCode'),
                    notifToken: NNTrackingDataHandler.getData('notifToken'),
                    page_type: page_type,
                    page_version: page_version,
                    scope: scope
                };
                
                // creating SECTION_VIEW LOAD Tracking Object using NNTrackingUtils' function
                const trackingObjectForSectionLoadTracking = getTrackingObjectForSectionTacking(
                    paramsForSectionLoadTracking
                );
            
                // sending the SECTION_VIEW LOAD Tracking
                sendTracking(trackingObjectForSectionLoadTracking);
            }
            
            const paramsForSectionFinalTracking = {
                page_name: PAGE_NAME,
                event: EVENT_NAME_FOR_SECTION_VIEW,
                stage: FINAL_STAGE,
                section: section_name,
                trigger: trigger,
                workflow: workflow,
                source: source,
                referrer: referrer || referrer_native || defaultRef,
                current_url: current_url_native,
                custom_object: custom_object,
                clientId: clientId || clientId_fallback,
                appVersionCode: appVersionCode || app_version_fallback,
                ota_version_name: NNTrackingDataHandler.getData('bundleVersionName'),
                ota_version_code: NNTrackingDataHandler.getData('bundleVersionCode'),
                notifToken: NNTrackingDataHandler.getData('notifToken'),
                page_type: page_type,
                page_version: page_version,
                scope: scope
            };

            // creating SECTION_VIEW FINAL Tracking Object using NNTrackingUtils' function
            const trackingObjectForSectionFinalTracking = getTrackingObjectForSectionTacking(
                paramsForSectionFinalTracking
            );

            /*
            if component is part of a list, then we call saveSectionViewTracking to save the trackingobject
            to the NNTrackingReducer otherwise we send the tracking object to clickstream service
            */
            if (sendSectionFinalOnMount) {
                sendTracking(trackingObjectForSectionFinalTracking);
                if(sendMoEngageEvent && (Object.keys(page_data_mo_engage).length > 0 || isEoiFlow)) {
                    sendEventData('SECTION_VIEW',mo_engage_section_event_data,'MO_ENGAGE');
                }
            } else {
                if(disableBatch) {
                    setRealTimeEvents(section_name);
                }
                saveSectionViewTracking(trackingObjectForSectionFinalTracking, section_name);
                if(sendMoEngageEvent && (Object.keys(page_data_mo_engage).length > 0 || isEoiFlow)) {
                    saveMoEngageEvents(mo_engage_section_event_data,section_name);
                }
            }
        }
    }, []);

    /*
     Callback function for onPress which firstly triggers the click tracking and then executes the onPress callback
     given by the developer
     */
    const sectionClickHandler = (event) => {
        // checking if onPress passed by developer is not undefined or null
        try {
        if(onPress){
        let custom_object = createCustomInfoForSection(data_custominfo, data_custominfo_global);
        if (customObjects[section_name] && Object.keys(customObjects[section_name]).length > 0)
        {
            custom_object["custom_object"] = { ...custom_object.custom_object, ...customObjects[section_name] }
        }
        const paramsForClickTracking = {
            page_name: PAGE_NAME,
            event: EVENT_NAME_FOR_CLICK,
            stage: FINAL_STAGE,
            section: removeDuplicates(concatenatedName) ,
            trigger: trigger,
            workflow: workflow,
            source: source,
            referrer: referrer || referrer_native || defaultRef,
            current_url: current_url_native,
            custom_object: custom_object,
            clientId: clientId || clientId_fallback,
            appVersionCode: appVersionCode || app_version_fallback,
            ota_version_name: NNTrackingDataHandler.getData('bundleVersionName'),
            ota_version_code: NNTrackingDataHandler.getData('bundleVersionCode'),
            notifToken: NNTrackingDataHandler.getData('notifToken'),
            page_type: page_type,
            page_version: page_version,
            scope:scope
        };
        const trackingObjectForClickTracking =
            getTrackingObjectForSectionTacking(paramsForClickTracking);
            if(PAGE_NAME && removeDuplicates(concatenatedName))
            {
                // sending CLICK Tracking
                sendTracking(trackingObjectForClickTracking);
            }
            // executing the onPress given by developer
            onPress(event);
            if(Object.keys(page_data_mo_engage).length > 0 || isEoiFlow)
                sendEventData('CLICK',mo_engage_click_event_data,'MO_ENGAGE');
    }
    }
    catch (error) {
        console.log("Error in Tracking : ",error.toString()+" : "+section_name);
        switch(Platform.OS) {
            case 'android':
                NativeModules?.StartActivity?.sendCrashDataFromRNtoFirebase(error.toString()+" : "+section_name);
                break;
            case 'ios':
                NativeModules?.ReactCommManager?.sendCrashDataFromRNtoFirebase(error.toString()+" : "+section_name);
                break;
        }
    }
    };

    // Wrapping the children with the ComponentType given by the developer and passing the onPress callback function
    return (
        <SectionContext.Provider value={removeDuplicates(concatenatedName)}>
            <ComponentType {...props} onPress={sectionClickHandler}>
                {children}
            </ComponentType>
        </SectionContext.Provider>
    ) 
};

const mstp = (state) => {
    const stackScreenName = state?.NNTrackingReducer?.stackNavigatorData?.stackScreenName;
    const pagerViewIndex = state?.NNTrackingReducer?.pagerViewData?.pagerViewIndex;
    const tabScreenName = state?.NNTrackingReducer?.tabNavigatorData?.tabScreenName;
    let dataForNormalTracking =  {
        clientId: state?.NNTrackingReducer?.clientId || '',
        page_name_global: state?.NNTrackingReducer?.page_name || '',
        appVersionCode: state?.NNTrackingReducer?.appVersionCode || '',
        moEngageData: state?.NNTrackingReducer?.moEngageData || '',
        page_version: state?.NNTrackingReducer?.page_version || '',
        scope : state?.NNTrackingReducer?.scope || ''
    };
    if(stackScreenName == null && tabScreenName == null && pagerViewIndex == null) {
        dataForNormalTracking = {
            ...dataForNormalTracking,
            current_url_native: state?.NNTrackingReducer?.current_url_native || '',
            referrer_native : state?.NNTrackingReducer?.referrer_native || '',
            data_custominfo_global : state?.NNTrackingReducer?.data_custom_info_global || {},
        }
    }
        else {
            if(stackScreenName){
                dataForNormalTracking = {
                    ...dataForNormalTracking,
                    current_url_native: state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.current_url_native || '',
                    referrer_native : state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.referrer_native || '',
                    internal_referrer : state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.internal_referrer || '',
                    data_custominfo_global : state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.data_custom_info_global || {}
                }
            }
            else if(pagerViewIndex) {
                dataForNormalTracking = {
                    ...dataForNormalTracking,
                    current_url_native: state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.current_url_native || '',
                    referrer_native : state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.referrer_native || '',
                    internal_referrer : state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.internal_referrer || '',
                    data_custominfo_global : state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.data_custom_info_global || {},
                    page_type:state?.NNTrackingReducer?.pagerViewData?.pagerViewScreenData?.[pagerViewIndex]?.pager_view_data?.label|| ''  
                }
            }
            else{
                dataForNormalTracking = {
            ...dataForNormalTracking,
            current_url_native: state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.current_url_native || '',
            referrer_native : state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.referrer_native || '',
            internal_referrer : state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.internal_referrer || '',
            data_custominfo_global : state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.data_custom_info_global || {},
            page_name_global : state?.NNTrackingReducer?.tabNavigatorData?.tabScreensData[tabScreenName]?.page_name || ''
               }
            }
       }
    return dataForNormalTracking;

};

const mdtp = (dispatch) => ({
    saveSectionViewTracking: (trackingObj, section_name) =>
        dispatch({
            type: 'ADD/TRACKING_OBJECT_FOR_SECTION',
            section_name: section_name,
            item: trackingObj
        }),
    saveMoEngageEvents: (eventdata,section_name) => 
        dispatch({
            type : 'SET/TRACKING_MO_ENGAGE',
            item: section_name,
            data : eventdata
        }),
    setRealTimeEvents: (section_name) => 
        dispatch({
            type: 'SET/TRACKING_REAL_TIME_EVENT',
            item: section_name
        })
});

export default connect(mstp, mdtp)(NNSectionTracking);
