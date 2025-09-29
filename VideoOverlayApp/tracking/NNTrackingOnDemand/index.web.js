// Import necessary functions from the NNTrackingutils module
import { createCustomInfoForSection, getTrackingObjectForSectionTacking, sendTracking } from "../NNTrackingutils";

// Define the NNTrackingOnDemand function which takes an object as input with various tracking parameters
export const NNTrackingOnDemand = ({
    data_custominfo, // Custom information related to the tracking event
    event,           // Type of event being tracked
    page_name,       // Name of the page where the event occurred
    section_name,    // Name of the section within the page where the event occurred
    trigger,         // Trigger for the tracking event
    workflow,        // Workflow associated with the event
    source,          // Source of the event
    referrer,
    data_custominfo_global = {},         // Referrer for the event
    stage,            // Stage for the event
    page_type = ''
}) => {
    // Create custom information object for the tracking event
    let custom_object = createCustomInfoForSection(data_custominfo,data_custominfo_global);
    
    // Construct parameters for the tracking event
    const paramsForTracking = {
        page_name: page_name,           // Name of the page
        event: event,                   // Type of event
        stage: stage,                   // Stage of the event
        section: section_name,          // Name of the section
        trigger: trigger,               // Trigger for the event
        workflow: workflow,             // Workflow associated with the event
        source: source,                 // Source of the event
        referrer: referrer,             // Referrer for the event (may be undefined)
        custom_object: custom_object,    // Custom information object
        page_type : page_type
    };

    // Generate tracking object based on the parameters
    const trackingObjectForTracking = getTrackingObjectForSectionTacking(paramsForTracking);
    
    if(page_name && (event == 'PAGE_VIEW' || event == 'SEARCH')) {
        console.log("Tracking On Demand : ", trackingObjectForTracking);
        sendTracking(trackingObjectForTracking); // Send the tracking data
    }

    // Check if both page_name and section_name are provided before logging and sending the tracking data
    if (page_name && section_name) {
        console.log("Tracking On Demand : ", trackingObjectForTracking);
        sendTracking(trackingObjectForTracking); // Send the tracking data
    }
}
