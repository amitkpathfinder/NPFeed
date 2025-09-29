/*
NNSectionTracking.web.js sends SECTION_VIEW LOAD , SECTION_VIEW FINAL and CLICK FINAL Trackings.
*/
import React, { useEffect, useRef, createContext, useContext } from 'react';
import { connect } from 'react-redux';
import {
    createCustomInfoForSection,
    getTrackingObjectForSectionTacking,
    sendTracking,
} from '../NNTrackingutils';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { removeDuplicates } from '../NNTrackingutils';

// defining constants
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
        data_custominfo = null,
        data_custominfo_global = {},
        trigger,
        workflow,
        source,
        page_name,
        section_name,
        referrer,
        page_name_global,
        saveSectionViewTracking,
        sendSectionTracking = false,
        sendSectionFinalOnMount = false,
        customObjects={},
        enableSectionLoadTracking = false,
        enableBatching,
        page_type='',
        scope = '',
        page_version = '',
        onValueChange
    } = props;

    const parentName = useContext(SectionContext);

    // Concatenate parent and current names
    const concatenatedName = (parentName && !sendSectionFinalOnMount) ? `${parentName}.${section_name}` : section_name;

    /* setting PAGE_NAME, checking if page name is passed in props
       otherwise taking the page name value from NNTrackingReducer 
    */
    const PAGE_NAME = page_name ? page_name : page_name_global;

	const rectState = useRef({
        rectTop: 0,
        rectBottom: 0,
        rectWidth: 0,
    });

	const viewRef = useRef();

    const VISIBILITY_THRESHOLD = 0.3;

	let interval;

    const getDataFromDOMNodes = () => {
        let page_name_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('data-label');
        let scope_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('scope');
        let data_global_from_body_tag = document?.getElementsByTagName('body')[0]?.getAttribute('data-custominfo');
        
        if(document?.getElementById('srpClickstreamObject') && typeof document?.getElementById('srpClickstreamObject').value == 'string') {
            data_global_from_body_tag = JSON.parse(document?.getElementById('srpClickstreamObject').value) || {};
        }
        if((page_name == 'LOCATION_SRP' || page_name_from_body_tag == 'LOCATION_SRP') && document?.getElementById('localitySrpClickstreamObject') && typeof document?.getElementById('localitySrpClickstreamObject').value == 'string') {
            data_global_from_body_tag = JSON.parse(document?.getElementById('localitySrpClickstreamObject').value) || {};
        }
        if((page_name == 'NPSRP' || page_name_from_body_tag == 'NPSRP') && document?.getElementById('npsrpClickstreamObject') && typeof document?.getElementById('npsrpClickstreamObject').value == 'string') {
            data_global_from_body_tag = JSON.parse(document?.getElementById('npsrpClickstreamObject').value) || {};
        }

        if(typeof data_global_from_body_tag == 'string') {
            data_global_from_body_tag = JSON.parse(data_global_from_body_tag);
        }

        return {
            page_name_from_body_tag,
            scope_from_body_tag,
            data_global_from_body_tag
        }
    }

    const getSectionViewTrackingObject = ({
        load = false
    } = {}) => {

        let {
            page_name_from_body_tag,
            scope_from_body_tag,
            data_global_from_body_tag,
            page_version_from_body_tag
            } = getDataFromDOMNodes();
            
            let page_type_from_body_tag = '';
            let tab_data = {};
            let data_custominfo_global_local = data_custominfo_global;

            if(document.getElementById('tab-container') && document.getElementById('tab-container').getAttribute('tab-data')) {
                const tab_dom_data = JSON.parse(document.getElementById('tab-container').getAttribute('tab-data'));
                page_type_from_body_tag = tab_dom_data?.label;
                tab_data = typeof tab_dom_data?.data == 'string' ? JSON.parse(tab_dom_data?.data) : tab_dom_data?.data;
            }

            if(Object.keys(tab_data).length > 0) {
                data_global_from_body_tag = createCustomInfoForSection(
                    tab_data,
                    data_global_from_body_tag
                );
                data_custominfo_global_local = createCustomInfoForSection(
                    tab_data,
                    data_custominfo_global_local
                );
            }

            let customInfo = typeof data_custominfo === 'object' ? data_custominfo : data_custominfo ? JSON.parse(data_custominfo) : {};
            // custom info data auto pick from reducer
            if(customObjects[section_name] && Object.keys(customObjects[section_name]).length > 0)
            {
                customInfo = { ...customInfo, custom_object : { ...customInfo?.custom_object , ...customObjects[section_name]} } 
            }
            const custom_object = createCustomInfoForSection(
                customInfo,
                data_custominfo_global && Object.keys(data_custominfo_global).length > 0 ? data_custominfo_global_local : data_global_from_body_tag
            );

        const paramsForSectionTracking = {
            page_name: page_name_from_body_tag || PAGE_NAME,
            event: EVENT_NAME_FOR_SECTION_VIEW,
            stage: load ? LOAD_STAGE : FINAL_STAGE,
            section: section_name,
            trigger: trigger,
            workflow: workflow,
            source: source,
            referrer: referrer,
            custom_object: custom_object,
            enableBatching: load ? false : window.rn_track_batch,
            page_type: page_type || page_type_from_body_tag,
            page_version: page_version || page_version_from_body_tag,
            scope : scope || scope_from_body_tag
        };
        
        // creating tracking object for SECTION_VIEW FINAL Tracking
        const trackingObjectForSectionTracking = getTrackingObjectForSectionTacking(
            paramsForSectionTracking
        );
        
        return trackingObjectForSectionTracking;

    }
	
    // function that checks whether the component is in viewport or not
	const isInViewPort = () => {

        const {
            page_name_from_body_tag
        } = getDataFromDOMNodes();

        if(window.visitedScroll && window.visitedScroll.has(section_name)) {
            return;
        }

        const windowDimen = Dimensions.get('window');
        const { rectBottom, rectTop, rectWidth } = rectState.current;

        const sizeIncreaseForThreshold = (1 - VISIBILITY_THRESHOLD) * (rectBottom - rectTop);

        // checking if component is in viewport or not
        const isVisibleNow =
            rectBottom != 0 &&
            rectTop >= -sizeIncreaseForThreshold &&
            rectBottom <= windowDimen.height + sizeIncreaseForThreshold &&
            rectWidth > 0 &&
            rectWidth <= windowDimen.width;

        if (isVisibleNow && (page_name_from_body_tag || PAGE_NAME)) {
            const trackingObjectForSectionFinalTracking = getSectionViewTrackingObject();
            // if batching is enabled, then save the tracking object otherwise fire the tracking object
            if(window.rn_track_batch)
            {
                saveSectionViewTracking(trackingObjectForSectionFinalTracking);
            }
            else
			    {
                    sendTracking(trackingObjectForSectionFinalTracking);
            }
            // clear the interval for the component whose FINAL tracking is sent
            if(document.body.getAttribute("pageidentifier") && document.body.getAttribute("pageidentifier") == "IA_Page") {
                if(window.visitedScroll) {
                    window.visitedScroll.add(section_name);
                }
            }
            else
			clearInterval(interval);
        }
        }

    // executed on component mount
    useEffect(() => {

        // checking if sendSectionTracking is enabled for this component or not
        if (sendSectionTracking && section_name) {

            // SECTION_VIEW LOAD is off by default
            if(enableSectionLoadTracking)
            {
                const trackingObjectForSectionLoadTracking = getSectionViewTrackingObject({
                    load : true
                });

                // sending SECTION_VIEW LOAD Tracking to clickstream service
                sendTracking(trackingObjectForSectionLoadTracking);
            }

            // interval that checks for viewability status every 100ms
            interval = setInterval(() => {
                if(viewRef && viewRef.current && viewRef.current.measureInWindow) {
                    viewRef?.current?.measureInWindow((x, y, width, height) => {
                        rectState.current = {
                            rectTop: y,
                            rectBottom: y + height,
                            rectWidth: x + width,
                        }	
                    })
                    isInViewPort()
                }
		}, 100)
		return () => clearInterval(interval)
        }
    }, []);

    /*
     Callback function for onPress which firstly triggers the click tracking and then executes the onPress callback
     given by the developer
     */
    const sectionClickHandler = (event) => {

        console.log("inside tracking click handler")

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

        if(document.getElementById('tab-container') && document.getElementById('tab-container').getAttribute('tab-data')) {
            const tab_dom_data = JSON.parse(document.getElementById('tab-container').getAttribute('tab-data'));
            page_type_from_body_tag = tab_dom_data?.label;
            tab_data = typeof tab_dom_data?.data == 'string' ? JSON.parse(tab_dom_data?.data) : tab_dom_data?.data;
        }

        if(Object.keys(tab_data).length > 0) {
            data_global_from_body_tag = createCustomInfoForSection(
                tab_data,
                data_global_from_body_tag
            );
            data_custominfo_global_local = createCustomInfoForSection(
                tab_data,
                data_custominfo_global_local
            );
        }

        let customInfo = typeof data_custominfo === 'object' ? data_custominfo : JSON.parse(data_custominfo);
        if(customObjects[section_name] && Object.keys(customObjects[section_name]).length > 0)
        {
            customInfo = { ...customInfo, custom_object : { ...customInfo?.custom_object , ...customObjects[section_name]} } 
        }
        const custom_object = createCustomInfoForSection(customInfo, data_custominfo_global && Object.keys(data_custominfo_global).length > 0 ? data_custominfo_global_local : data_global_from_body_tag);
        const paramsForClickTracking = {
            page_name: page_name_from_body_tag || PAGE_NAME,
            event: EVENT_NAME_FOR_CLICK,
            stage: FINAL_STAGE,
            section: removeDuplicates(concatenatedName),
            trigger: trigger,
            workflow: workflow,
            source: source,
            referrer: referrer,
            custom_object: custom_object,
            page_type: page_type || page_type_from_body_tag,
            scope : scope || scope_from_body_tag,
            page_version: page_version || page_version_from_body_tag
        };
        const trackingObjectForClickTracking =
            getTrackingObjectForSectionTacking(paramsForClickTracking);

        // sending CLICK Tracking
        if((page_name_from_body_tag || PAGE_NAME) && concatenatedName) {
            sendTracking(trackingObjectForClickTracking);
        }

        if(onValueChange)
            onValueChange(event);
        else
            onPress(event);
    };

    // Wrapping the children with the ComponentType given by the developer and passing the onPress callback function
    return (
      <SectionContext.Provider value={removeDuplicates(concatenatedName)}>
        <ComponentType ref={viewRef} {...props} onPress={sectionClickHandler} onValueChange={sectionClickHandler}>
          {children}
        </ComponentType>
      </SectionContext.Provider>
    )
};

const mstp = (state) => {
    return {
        // clientId: state.NNTrackingReducer.clientId || '', commenting this code, no use on web
        page_name_global: state.NNTrackingReducer.page_name || '',
        customObjects : state?.NNTrackingReducer?.customObjects || {},
        enableBatching : state.NNTrackingReducer.enableBatching || false,
        data_custominfo_global : state?.NNTrackingReducer?.data_custom_info_global || {},
        scope : state?.NNTrackingReducer?.scope || '',
        page_version : state?.NNTrackingReducer?.page_version || ''
    };
};

const mdtp = (dispatch) => ({
    saveSectionViewTracking: (trackingObj) =>
        dispatch({
            type: 'ADD/TRACKING_BATCH_WEB',
            data: trackingObj,
        }),
});

export default connect(mstp, mdtp)(NNSectionTracking);
