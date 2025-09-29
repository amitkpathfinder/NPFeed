import {Switch} from 'react-native';
import { connect } from "react-redux";
import { createCustomInfoForSection, getTrackingObjectForSectionTacking, sendTracking } from "../NNTrackingutils";

// Define constants for tracking event
const EVENT_NAME_FOR_CLICK = 'CLICK';
const FINAL_STAGE = 'FINAL';

const NNSwitchTracking = (props) => {

    const {
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
        appVersionCode = '',
        current_url_native,
        referrer_native,
        internal_referrer,
        onValueChange
    } = props;

    // Determine the PAGE_NAME based on provided props
    const PAGE_NAME = page_name ? page_name : page_name_global;

    const overrideOnValueChange = (event) => {

        // Create custom info object for tracking
        let custom_object = createCustomInfoForSection(data_custominfo, data_custominfo_global);
        
        // Define parameters for click tracking
        const paramsForClickTracking = {
            page_name: PAGE_NAME,
            event: EVENT_NAME_FOR_CLICK,
            stage: FINAL_STAGE,
            section: section_name,
            trigger: trigger,
            workflow: workflow,
            source: source,
            referrer: referrer || referrer_native || `${internal_referrer}_REFERRER`,
            current_url: current_url_native,
            custom_object: custom_object,
            clientId: clientId,
            appVersionCode: appVersionCode
        };
        
        // Create tracking object for click tracking
        const trackingObjectForClickTracking = getTrackingObjectForSectionTacking(paramsForClickTracking);
        
        // Send tracking if page_name and section_name are provided
        if (PAGE_NAME && section_name) {
            sendTracking(trackingObjectForClickTracking);
        }

        onValueChange(event);

    }

    return (
        <Switch 
        {...props}
        onValueChange={overrideOnValueChange}
        />
    )

}


const mapStateToProps = (state) => {
    const stackScreenName = state?.NNTrackingReducer?.stackNavigatorData?.stackScreenName;
    let dataForNormalTracking =  {
        clientId: state?.NNTrackingReducer?.clientId || '',
        page_name_global: state?.NNTrackingReducer?.page_name || '',
        appVersionCode: state?.NNTrackingReducer?.appVersionCode || ''
    };
    if (stackScreenName == null) {
        dataForNormalTracking = {
            ...dataForNormalTracking,
            current_url_native: state?.NNTrackingReducer?.current_url_native || '',
            referrer_native : state?.NNTrackingReducer?.referrer_native || '',
            data_custominfo_global : state?.NNTrackingReducer?.data_custom_info_global || {},
        }
    } else {
        dataForNormalTracking = {
            ...dataForNormalTracking,
            current_url_native: state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.current_url_native || '',
            referrer_native : state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.referrer_native || '',
            internal_referrer : state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.internal_referrer || '',
            data_custominfo_global : state?.NNTrackingReducer?.stackNavigatorData?.stackScreensData[stackScreenName]?.data_custom_info_global || {}
        }
    }
    return dataForNormalTracking;
};

export default connect(mapStateToProps, null)(NNSwitchTracking);