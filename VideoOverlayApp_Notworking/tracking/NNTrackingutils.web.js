// import { API_URL } from "../networking/Api";
import { Platform } from "react-native";

export const createCustomInfoForSection = (data_custominfo,data_custom_info_global) => {
    var customInfoGlobal = {};
    var customInfoTarget = {};

    console.log("inside utilssss")

    if(data_custom_info_global){
        customInfoGlobal = typeof data_custom_info_global == 'object' ? data_custom_info_global : JSON.parse(data_custom_info_global)
    }

    if(data_custominfo){
        customInfoTarget = typeof data_custominfo == 'object' ? data_custominfo : JSON.parse(data_custominfo)
    }

    var mergedCustomObject = Object.assign({}, customInfoGlobal.custom_object, customInfoTarget.custom_object);
    var mergedPayload = Object.assign({}, customInfoGlobal.payload, customInfoTarget.payload);

    if (customInfoGlobal.payload && customInfoTarget.payload) {
        if (customInfoGlobal.payload.search_results && customInfoTarget.payload.search_results) {
            mergedPayload = {
                ...mergedPayload,
                search_results : {
                    ...customInfoGlobal.payload.search_results,
                    ...customInfoTarget.payload.search_results
                }
            }
        }
        if (customInfoGlobal.payload.property && customInfoTarget.payload.property) {
            mergedPayload = {
                ...mergedPayload,
                property : {
                    ...customInfoGlobal.payload.property,
                    ...customInfoTarget.payload.property
                }
            }
        } 
        if (customInfoGlobal.payload.project && customInfoTarget.payload.project) {
            mergedPayload = {
                ...mergedPayload,
                project : {
                    ...customInfoGlobal.payload.project,
                    ...customInfoTarget.payload.project
                }
            }
        }  
        if (customInfoGlobal.payload.user && customInfoTarget.payload.user) {
            mergedPayload = {
                ...mergedPayload,
                user : {
                    ...customInfoGlobal.payload.user,
                    ...customInfoTarget.payload.user
                }
            }
        }
        if(customInfoGlobal.payload.recommendation && customInfoTarget.payload.recommendation) {
            mergedPayload = {
                ...mergedPayload,
                recommendation : {
                    ...customInfoGlobal.payload.recommendation,
                    ...customInfoTarget.payload.recommendation
                }
            }
        }
    }
    var mergedSearch = Object.assign({},customInfoGlobal.search, customInfoTarget.search);
    var customInfo = '';
    customInfo = {
        custom_object: mergedCustomObject,
        payload: mergedPayload,
        search: mergedSearch
    };
    
    return customInfo;
}

export const createCustomInfoForPage = (data_custominfo,data_custom_info_global) => {
    var customInfoGlobal = {};
        var customInfoSrp = {};
        var customInfoTarget = {};

        if (data_custom_info_global) {
            customInfoGlobal = JSON.parse(data_custom_info_global);
        }

        if (data_custominfo) {
            customInfoTarget = JSON.parse(data_custominfo);
        }

        if (customInfoGlobal.srp_clickstream_object) {
            customInfoSrp = customInfoGlobal.srp_clickstream_object;
        }

        var mergedCustomObject = Object.assign(
            {},
            customInfoGlobal.custom_object,
            customInfoSrp.custom_object,
            customInfoTarget.custom_object
        );

        if (customInfoSrp.payload && customInfoTarget.payload) {
            if (customInfoSrp.payload.search_results && customInfoTarget.payload.search_results) {
                var mergedPayload = Object.assign({
                    search_results: Object.assign(
                        {},
                        customInfoSrp.payload.search_results,
                        customInfoTarget.payload.search_results
                    ),
                });
            } else if (customInfoGlobal.payload) {
                if (customInfoGlobal.payload.property && customInfoTarget.payload.property) {
                    var mergedPayload = Object.assign({
                        property: Object.assign(
                            {},
                            customInfoGlobal.payload.property,
                            customInfoTarget.payload.property
                        ),
                    });
                } else if (customInfoGlobal.payload.project && customInfoTarget.payload.project) {
                    var mergedPayload = Object.assign({
                        project: Object.assign(
                            {},
                            customInfoGlobal.payload.project,
                            customInfoTarget.payload.project
                        ),
                    });
                } else if (customInfoGlobal.payload.user && customInfoTarget.payload.user) {
                    var mergedPayload = Object.assign({
                        user: Object.assign(
                            {},
                            customInfoGlobal.payload.user,
                            customInfoTarget.payload.user
                        ),
                    });
                } else {
                    var mergedPayload = Object.assign(
                        {},
                        customInfoGlobal.payload,
                        customInfoSrp.payload,
                        customInfoTarget.payload
                    );
                }
            } else {
                var mergedPayload = Object.assign(
                    {},
                    customInfoGlobal.payload,
                    customInfoSrp.payload,
                    customInfoTarget.payload
                );
            }
        } else if (
            customInfoGlobal.payload &&
            customInfoGlobal.payload.recommendation &&
            customInfoTarget.payload &&
            customInfoTarget.payload.recommendation
        ) {
            var mergedPayload = Object.assign({
                recommendation: Object.assign(
                    {},
                    customInfoGlobal.payload.recommendation,
                    customInfoTarget.payload.recommendation
                ),
            });
        } else {
            var mergedPayload = Object.assign(
                {},
                customInfoGlobal.payload,
                customInfoSrp.payload,
                customInfoTarget.payload
            );
        }
        var mergedSearch = Object.assign({}, customInfoSrp.search, customInfoTarget.search);
        var customInfo = '';
        customInfo = {
            custom_object: mergedCustomObject,
            payload: mergedPayload,
            search: mergedSearch,
        };
        // console.log("complete custom info = ", customInfo)
        return customInfo;
}

const getDateTime = () => {
    var timeInMilliseconds = new Date().getTime(); // timeInMilliseconds (1618220075786)
    var timeInMillisecondsInCustomFormat = Platform.OS === 'ios' ? timeInMilliseconds : (timeInMilliseconds / 1000);
    // console.log("timeInMillisecondsInCustomFormat = ",timeInMillisecondsInCustomFormat)
    return timeInMillisecondsInCustomFormat;
  }

  export const getTrackingObjectForSectionTacking = ({page_name, event, stage, section, trigger , workflow, source, referrer, custom_object,enableBatching,page_type='',page_version='',scope=''}) => {


    var complete_tracking_obj = {};

    complete_tracking_obj['action'] = {
        page: page_name,
        event: event || '',
        stage: stage || 'FINAL',
        referrer_section: '',
        section: section || null ,
    };

    if (trigger) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            trigger: trigger,
        };
    }

    if (workflow) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            workflow: workflow,
        };
    }

    if (source) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            source: source,
        };
    }

    if(page_type){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            page_type: page_type,
        };
    }

    if(scope){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            scope: scope,
        }
    }
    if(page_version){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            page_version: page_version,
        };
    }

    var objSdk = { custom_object: { isRnSDK: 'true' } };

    if(typeof window != 'undefined'){
        objSdk = { custom_object: { isRnSDK: 'true', isBrowserCookieEnabled: navigator.cookieEnabled } }
    }

    complete_tracking_obj['custom_object'] = Object.assign({}, objSdk.custom_object);

    if (custom_object) {
        if (custom_object.search && Object.getOwnPropertyNames(custom_object.search).length) {
            complete_tracking_obj['search'] = custom_object.search;
        }
        if (custom_object.payload && Object.getOwnPropertyNames(custom_object.payload).length) {
            complete_tracking_obj['payload'] = custom_object.payload;
        }
        if (
            custom_object.custom_object &&
            Object.getOwnPropertyNames(custom_object.custom_object).length
        ) {
            complete_tracking_obj['custom_object'] = Object.assign(
                {},
                custom_object.custom_object,
                objSdk.custom_object
            );
        }
    }

    if(window) {
        const queryParams = new URLSearchParams(window.location.search);
        if(queryParams.has('tracking_platform'))
        {
            const value = queryParams.get('tracking_platform').toLowerCase();
            if(value == 'android'){
                complete_tracking_obj['platform'] = 'Android';
            }
            else
            if(value == 'ios'){
                complete_tracking_obj['platform'] = 'IOS';
            }
        }
        complete_tracking_obj['tracking_id'] = document.getElementById('__tracking_id')?.value || '';
        complete_tracking_obj['ab_cookie'] = getCookieData('99_ab');
    }

    complete_tracking_obj['date_time'] = getDateTime();
    if (referrer || document.referrer) {
        complete_tracking_obj['referrer'] = referrer || encodeURIComponent(document.referrer);
    } else {
        complete_tracking_obj['referrer'] = 'NOT_EXIST';
    }
    if (window.location.href) {
        complete_tracking_obj['current_url'] = encodeURIComponent(window.location.href);
    } else {
        complete_tracking_obj['current_url'] = 'NOT_EXIST';
    }
    
    if(enableBatching)
    {
        return complete_tracking_obj;
    }

    let tracking_data = [];
    tracking_data.push(complete_tracking_obj);
    return 'trackingData[]=' + JSON.stringify(tracking_data);
};

export const getTrackingObjectForVideoTracking = ({
    page_name = '',
    event = '',
    stage = '',
    section = '',
    custom_object = {},
    clientId,
    appVersionCode,
    referrer = '',
    current_url = '',
    total_duration = '',
    current_duration = '',
    scope = '',
    page_type = '',
    page_version = ''
}
) => {

    var complete_tracking_obj = {};
    complete_tracking_obj['action'] = {
        page: page_name,
        event: event || '',
        stage: stage || 'FINAL',
        referrer_section: '',
        section: section || null ,
    };

    var objSdk = { custom_object: { isRnSDK: 'true' } };

    complete_tracking_obj['custom_object'] = Object.assign({}, objSdk.custom_object);

    if (custom_object) {
        if (custom_object.search && Object.getOwnPropertyNames(custom_object.search).length) {
            complete_tracking_obj['search'] = custom_object.search;
        }
        if (custom_object.payload && Object.getOwnPropertyNames(custom_object.payload).length) {
            complete_tracking_obj['payload'] = custom_object.payload;
        }
        if (
            custom_object.custom_object &&
            Object.getOwnPropertyNames(custom_object.custom_object).length
        ) {
            complete_tracking_obj['custom_object'] = Object.assign(
                {},
                custom_object.custom_object,
                objSdk.custom_object
            );
        }
    }

    if(window) {
        const queryParams = new URLSearchParams(window.location.search);
        if(queryParams.has('tracking_platform'))
        {
            const value = queryParams.get('tracking_platform').toLowerCase();
            if(value == 'android'){
                complete_tracking_obj['platform'] = 'Android';
            }
            else
            if(value == 'ios'){
                complete_tracking_obj['platform'] = 'IOS';
            }
        }
        complete_tracking_obj['tracking_id'] = document.getElementById('__tracking_id')?.value || '';
        complete_tracking_obj['ab_cookie'] = getCookieData('99_ab');
    }

    complete_tracking_obj['date_time'] = getDateTime();
    if (referrer || document.referrer) {
        complete_tracking_obj['referrer'] = referrer || encodeURIComponent(document.referrer);
    } else {
        complete_tracking_obj['referrer'] = 'NOT_EXIST';
    }
    if (window.location.href) {
        complete_tracking_obj['current_url'] = encodeURIComponent(window.location.href);
    } else {
        complete_tracking_obj['current_url'] = 'NOT_EXIST';
    }

    if(total_duration) {
        complete_tracking_obj["payload"] = complete_tracking_obj["payload"] ? {
            ...complete_tracking_obj["payload"],
            video : complete_tracking_obj["payload"]["video"] ? 
                {
                    ...complete_tracking_obj["payload"]["video"],
                    total_duration : total_duration
                }
                :
                {
                    total_duration : total_duration
                }
        } : { 
            video : {
                total_duration : total_duration
            }
        }
      }
    
      if(current_duration) {
        complete_tracking_obj["payload"] = complete_tracking_obj["payload"] ? {
            ...complete_tracking_obj["payload"],
            video : complete_tracking_obj["payload"]["video"] ? 
                {
                    ...complete_tracking_obj["payload"]["video"],
                    current_duration : current_duration
                }
                :
                {
                    current_duration : current_duration
                }
        } : { 
            video : {
                current_duration : current_duration
            }
        }
      }

      if(scope) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            scope: scope
        }
    }
    
    if(page_type){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            page_type: page_type,
        };
    }

    if(page_version){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            page_version: page_version,
        };
    }
    
      let tracking_data = [];
      tracking_data.push(complete_tracking_obj);
      return 'trackingData[]=' + JSON.stringify(tracking_data);
};

export const getTrackingObjectForPageTacking = ({page_name, event, stage, section, trigger , workflow, source, custom_object,page_type = '',page_version='',scope=''}) => {

    var complete_tracking_obj = {};
    complete_tracking_obj['action'] = {
        page: page_name,
        event: event || '',
        stage: stage || 'FINAL',
        referrer_section: '',
        section: section ? section : '' ,
    };

    if (trigger) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            trigger: trigger,
        };
    }

    if (workflow) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            workflow: workflow,
        };
    }

    if (source) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            source: source,
        };
    }

    if(page_type){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            page_type: page_type,
        };
    }

    if(scope) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            scope: scope
        }
    }
    if(page_version){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            page_version: page_version,
        };
    }

    var objSdk = { custom_object: { isRnSDK: 'true' } };

    complete_tracking_obj['custom_object'] = Object.assign({}, objSdk.custom_object);

    if (custom_object) {
        if (custom_object.search && Object.getOwnPropertyNames(custom_object.search).length) {
            complete_tracking_obj['search'] = custom_object.search;
        }
        if (custom_object.payload && Object.getOwnPropertyNames(custom_object.payload).length) {
            complete_tracking_obj['payload'] = custom_object.payload;
        }
        if (
            custom_object.custom_object &&
            Object.getOwnPropertyNames(custom_object.custom_object).length
        ) {
            complete_tracking_obj['custom_object'] = Object.assign(
                {},
                custom_object.custom_object,
                objSdk.custom_object
            );
        }
    }

    if(window) {
        const queryParams = new URLSearchParams(window.location.search);
        if(queryParams.has('tracking_platform'))
        {
            const value = queryParams.get('tracking_platform').toLowerCase();
            if(value == 'android'){
                complete_tracking_obj['platform'] = 'Android';
            }
            else
            if(value == 'ios'){
                complete_tracking_obj['platform'] = 'IOS';
            }
        }
        complete_tracking_obj['tracking_id'] = document.getElementById('__tracking_id')?.value || '';
        complete_tracking_obj['ab_cookie'] = getCookieData('99_ab');
    }

    complete_tracking_obj['date_time'] = getDateTime();
    if (document.referrer) {
        complete_tracking_obj['referrer'] = encodeURIComponent(document.referrer);
    } else {
        complete_tracking_obj['referrer'] = 'NOT_EXIST';
    }
    if (window.location.href) {
        complete_tracking_obj['current_url'] = encodeURIComponent(window.location.href);
    } else {
        complete_tracking_obj['current_url'] = 'NOT_EXIST';
    }

    let tracking_data = [];
    tracking_data.push(complete_tracking_obj);
    return 'trackingData[]=' + JSON.stringify(tracking_data);
}

export const sendTracking = (trackingObject) => {
    console.log("tracking fired for :: ",trackingObject);
    try{
        fetch(`/do/clickStreamTracking/ClickStream/trackData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: trackingObject,
    });
    }catch(error){
        console.error('Tracking Error == ', error);
    }
}

export const removeDuplicates = (inputString) => {
    if(inputString){
        let elements = inputString.split('.');
        let seen = new Set();
        let result = [];
    
        for (let element of elements) {
            if (!seen.has(element)) {
                seen.add(element);
                result.push(element);
            }
        }
    
        return result.join('.');
    }
    else return inputString;
}


function getCookieData(cookieName) {
    if (typeof document !== 'undefined') {
        var allcookies = document.cookie;
        var cookieArray = allcookies.split(';');
        
        // Trim each cookie
        for (var i = 0; i < cookieArray.length; i++) {
            var cookie = cookieArray[i].trim();
            
            // Check if the cookie contains the specified name
            if (cookie.indexOf(cookieName + "=") === 0) {
                // Extract the value of the cookie after the '=' sign
                var cookieValue = cookie.substring(cookieName.length + 1);
                return cookieValue; // Return the full value without splitting further
            }
        }
    }
    return null;
}
