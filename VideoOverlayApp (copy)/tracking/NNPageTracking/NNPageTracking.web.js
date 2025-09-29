/*
NNPageTracking.web.js sends the PAGE VIEW LOAD and FINAL Tracking in Web.
*/
import React, { useEffect } from 'react';
import {connect} from 'react-redux';
import {
    createCustomInfoForPage,
    getTrackingObjectForPageTacking,
    sendTracking,
} from '../NNTrackingutils';

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
        setGlobalData,
        setPageName,
        message_id,
        enableTrackingOnWeb = false,
        page_type='',
        scope = '',
        setScope,
        page_version='',
        setPageVersion
    } = props;

    // local state flag to mount the page 
    // const [mountPage,setMountPage] = useState(false); // commenting this because of hydration issue faced on web

    const getDataFromDOMNodes = () => {
        let page_name_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('data-label');
        let scope_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('scope');
        let data_global_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('data-custominfo');
        let page_version_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('page_version');
        
        if(document?.getElementById('srpClickstreamObject') && typeof document?.getElementById('srpClickstreamObject').value == 'string') {
            data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('srpClickstreamObject').value) || {}};
        }
        if((page_name == 'LOCATION_SRP' || page_name_from_body_tag == 'LOCATION_SRP') && document?.getElementById('localitySrpClickstreamObject') && typeof document?.getElementById('localitySrpClickstreamObject').value == 'string') {
            data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('localitySrpClickstreamObject').value) || {}};
        }
        if((page_name == 'NPSRP' || page_name_from_body_tag == 'NPSRP') && document?.getElementById('npsrpClickstreamObject') && typeof document?.getElementById('npsrpClickstreamObject').value == 'string') {
            data_global_from_body_tag = {"srp_clickstream_object" : JSON.parse(document?.getElementById('npsrpClickstreamObject').value) || {}};
        }

        if(typeof data_global_from_body_tag == 'string') {
            data_global_from_body_tag = JSON.parse(data_global_from_body_tag);
        }

        return {
            page_name_from_body_tag,
            scope_from_body_tag,
            data_global_from_body_tag,
            page_version_from_body_tag
        }
    }

    // function that sets data globally to the NTrackingReducer
    const setGlobalInfoData = async () => {
        // fetching page name and data custom info global from body tag of DOM Tree as fallback
        const {
            page_name_from_body_tag,
            scope_from_body_tag,
            page_version_from_body_tag
        } = getDataFromDOMNodes();

        if((typeof data_custominfo_global == 'object' && Object.keys(data_custominfo_global).length > 0) || (typeof data_custominfo_global == 'string' && Object.keys(JSON.parse(data_custominfo_global)).length > 0)) {
            await setGlobalData(data_custominfo_global);
        }
        await setPageName(page_name || page_name_from_body_tag);
        await setScope(scope || scope_from_body_tag);
        await setPageVersion(page_version || page_version_from_body_tag);
        // setMountPage(true); // commenting this because of hydration issue faced on web
    }

    // executes on page mounting
    useEffect(() => {

        // checking if page is not mounted then set global data firstly
        // if(!mountPage)
        //     setGlobalInfoData(); // commenting this because of hydration issue faced on web
        // else

        setGlobalInfoData();
        if(enableTrackingOnWeb && page_name) // on web, page view tracking by default is send from web sdk
        {
        // fetching page name and data custom info global from body tag of DOM Tree as fallback
        let {
            page_name_from_body_tag,
            scope_from_body_tag,
            data_global_from_body_tag,
            page_version_from_body_tag
        } = getDataFromDOMNodes();
        
        let page_type_from_body_tag = '';
        let tab_data = {};
        let data_custominfo_global_local = data_custominfo_global;
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

        // adding tab level data to the global data
        if(document.getElementById('tab-container') && document.getElementById('tab-container').getAttribute('tab-data')) {
            const tab_dom_data = JSON.parse(document.getElementById('tab-container').getAttribute('tab-data'));
            page_type_from_body_tag = tab_dom_data?.label;
            tab_data = typeof tab_dom_data?.data == 'string' ? JSON.parse(tab_dom_data?.data) : tab_dom_data?.data;
        }

        if(tab_data && Object.keys(tab_data).length > 0) {
            data_global_from_body_tag = {
                ...data_global_from_body_tag,
                ...tab_data,
            }
            data_custominfo_global_local = {
                ...data_custominfo_global,
                ...tab_data,
            }
        }

        //creating custom object
        const custom_object = createCustomInfoForPage(data_custominfo,data_custominfo_global && Object.keys(data_custominfo_global).length > 0 ? data_custominfo_global_local : data_global_from_body_tag);

        const paramsForPageLoadTracking = {
            page_name : page_name || page_name_from_body_tag,
            event : eventName,
            stage : LOAD_STAGE,
            section : section_name,
            trigger : trigger,
            workflow : workflow,
            source : source,
            referrer : referrer,
            custom_object : custom_object,
            message_id:message_id,
            page_type:page_type || page_type_from_body_tag,
            page_version:page_version || page_version_from_body_tag,
            scope:scope || scope_from_body_tag
        };
        const paramsForPageFinalTracking = {
            page_name : page_name || page_name_from_body_tag,
            event : eventName,
            stage : FINAL_STAGE,
            section : section_name,
            trigger : trigger,
            workflow : workflow,
            source : source,
            referrer : referrer,
            custom_object : custom_object,
            message_id:message_id,
            page_type:page_type || page_type_from_body_tag,
            page_version:page_version || page_version_from_body_tag,
            scope:scope || scope_from_body_tag
        };
        // creating PAGE_VIEW LOAD Tracking Object
        const trackingObjectForPageLoadTracking =
            getTrackingObjectForPageTacking(paramsForPageLoadTracking);

        // creating PAGE_VIEW FINAL Tracking Object
        const trackingObjectForPageFinalTracking = getTrackingObjectForPageTacking(paramsForPageFinalTracking);

        // sending PAGE_VIEW LOAD and PAGE_VIEW FINAL Trackings
        sendTracking(trackingObjectForPageLoadTracking);
        sendTracking(trackingObjectForPageFinalTracking);
    }
    },[]);

    // intially mountPage will be false hence returning null
    // return mountPage || typeof window == 'undefined' ? children : null; // commenting this because of hydration issue faced on web
    return children;
};

const mdtp = (dispatch) => ({
    setGlobalData : (data) => dispatch({ type: 'SET/TRACKING_GLOBAL_DATA', data: data }),
    setPageName : (data) => dispatch({ type: "SET/TRACKING_PAGE_NAME", data: data }),
    setScope : (data) => dispatch({ type: "SET/TRACKING_SCOPE", data: data }),
    setPageVersion : (data) => dispatch({ type: "SET/TRACKING_PAGE_VERSION", data: data })
});

export default connect(null,mdtp)(NNPageTracking);
