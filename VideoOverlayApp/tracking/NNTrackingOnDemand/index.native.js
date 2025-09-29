// Import necessary modules and functions for tracking
import { NNTrackingDataHandler } from "../NNTrackingDataHandler";
import { createCustomInfoForSection, getTrackingObjectForSectionTacking, sendTracking } from "../NNTrackingutils";
// import { sendEventData } from '@nnshared/nnthirdpartyeventssdk';

// Define the NNTrackingOnDemand function which takes an object with tracking parameters as input
export const NNTrackingOnDemand = ({
    data_custominfo,    // Custom information related to the tracking event
    event,              // Type of event being tracked
    page_name,          // Name of the page where the event occurred
    section_name,       // Name of the section within the page where the event occurred
    trigger,            // Trigger for the tracking event
    workflow,           // Workflow associated with the event
    source,             // Source of the event
    referrer,           // Referrer for the event
    stage,              // Stage for the event
    sendMoEngageEvent = false,
    isEoiFlow = false,
    data_custominfo_global = {},
    page_type = '',
    eoiData = {}
}) => {
    // Retrieve client ID from data handler
    const clientId = NNTrackingDataHandler.getData("clientId");
    // Retrieve application version code from data handler
    const appVersionCode = NNTrackingDataHandler.getData("AppVersionCode");
    // Retrieve current URL from data handler and encode it if it exists
    const currentUrlinData = NNTrackingDataHandler.getData("current_url");
    const currentUrlFromNative = (currentUrlinData == undefined || currentUrlinData == null || currentUrlinData == "") ? "" : encodeURIComponent(currentUrlinData);
    // Retrieve referrer from data handler
    const reffererFromNative = NNTrackingDataHandler.getData("referrer");

    let page_data_mo_engage = NNTrackingDataHandler.getData("moEngageData") && NNTrackingDataHandler.getData("moEngageData")[page_name] ? NNTrackingDataHandler.getData("moEngageData")[page_name] : {} ;

    let mo_engage_event_data = {
        ...page_data_mo_engage,
        section_name : section_name,
        page_name : page_name,
        CTA_name : section_name,
        visitor_id : clientId
    };

    if(sendMoEngageEvent && isEoiFlow) {
        mo_engage_event_data = {
            ...mo_engage_event_data,
            ...eoiData
        }
    }

    // Create custom information object for the tracking event
    let custom_object = createCustomInfoForSection(data_custominfo, data_custominfo_global);

    // Construct parameters for the tracking event
    const paramsForTracking = {
        page_name: page_name,                       // Name of the page
        event: event,                               // Type of event
        stage: stage,                               // Stage of the event
        section: section_name,                      // Name of the section
        trigger: trigger,                           // Trigger for the event
        workflow: workflow,                         // Workflow associated with the event
        source: source,                             // Source of the event
        referrer: referrer || reffererFromNative,  // Referrer for the event (if not provided, use referrer from data handler)
        current_url: currentUrlFromNative,          // Current URL of the page
        custom_object: custom_object,               // Custom information object
        clientId: clientId,                         // Client ID
        appVersionCode: appVersionCode,             // Application version code
        page_type: page_type
    };

    // Generate tracking object based on the parameters
    const trackingObjectForTracking = getTrackingObjectForSectionTacking(paramsForTracking);

    // Check if both page_name and section_name are provided before logging and sending the tracking data
    if(page_name && (event == 'PAGE_VIEW' || event == 'SEARCH')) {
        sendTracking(trackingObjectForTracking); // Send the tracking data
        if(sendMoEngageEvent && (Object.keys(page_data_mo_engage).length > 0 || isEoiFlow))
            sendEventData(event,mo_engage_event_data,'MO_ENGAGE');
    }
    else
    if (page_name && section_name) {
        console.log("Tracking On Demand : ", trackingObjectForTracking);
        sendTracking(trackingObjectForTracking); // Send the tracking data
        if(sendMoEngageEvent && (Object.keys(page_data_mo_engage).length > 0 || isEoiFlow))
            sendEventData(event,mo_engage_event_data,'MO_ENGAGE');
    }
}
