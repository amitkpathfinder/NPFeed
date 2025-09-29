// import httpService from "../networking/httpService";
// import { API_URL } from "../networking/Api";
// import currentUrlAdd from "../tracking/CurrentUrlSupport/index";
import { NativeModules,Platform } from "react-native";
import { getBrand, getModel } from 'react-native-device-info';

let tracking_id = 1;

export const createCustomInfoForSection = (data_custominfo,data_custom_info_global) => {
    var customInfoGlobal = {};
    var customInfoSrp = {};
    var customInfoTarget = {};

    if(data_custom_info_global){
        customInfoGlobal = typeof data_custom_info_global == 'object' ? data_custom_info_global : JSON.parse(data_custom_info_global)
    }

    if(data_custominfo){
        customInfoTarget = typeof data_custominfo == 'object' ? data_custominfo : JSON.parse(data_custominfo)
    }

    if (customInfoGlobal.srp_clickstream_object) {
        customInfoSrp = customInfoGlobal.srp_clickstream_object
    }

    var mergedCustomObject = Object.assign({}, customInfoGlobal.custom_object, customInfoSrp.custom_object, customInfoTarget.custom_object);

    if (customInfoSrp.payload && customInfoTarget.payload) {
        if (customInfoSrp.payload.search_results && customInfoTarget.payload.search_results) {
            var mergedPayload = Object.assign({
                search_results: Object.assign({}, customInfoSrp.payload.search_results, customInfoTarget.payload.search_results)
            });
            if (customInfoTarget.payload.video) {
                mergedPayload = {
                    ...mergedPayload,
                    video: { ...customInfoTarget.payload.video }
                }
            }
        } else if (customInfoGlobal.payload) {
            if (customInfoGlobal.payload.property && customInfoTarget.payload.property) {
                var mergedPayload = Object.assign({
                    property: Object.assign({}, customInfoGlobal.payload.property, customInfoTarget.payload.property)
                });
            } else if (customInfoGlobal.payload.project && customInfoTarget.payload.project) {
                var mergedPayload = Object.assign({
                    project: Object.assign({}, customInfoGlobal.payload.project, customInfoTarget.payload.project)
                });
            } else if (customInfoGlobal.payload.user && customInfoTarget.payload.user) {
                var mergedPayload = Object.assign({
                    user: Object.assign({}, customInfoGlobal.payload.user, customInfoTarget.payload.user)
                });
            } else {
                var mergedPayload = Object.assign({}, customInfoGlobal.payload, customInfoSrp.payload, customInfoTarget.payload);
            }
        } else {
            var mergedPayload = Object.assign({}, customInfoGlobal.payload, customInfoSrp.payload, customInfoTarget.payload);
        }
    } else if (customInfoGlobal.payload && customInfoGlobal.payload.recommendation && customInfoTarget.payload && customInfoTarget.payload.recommendation) {
        var mergedPayload = Object.assign({
            recommendation: Object.assign({}, customInfoGlobal.payload.recommendation, customInfoTarget.payload.recommendation)
        });
    } else {
        var mergedPayload = Object.assign({}, customInfoGlobal.payload, customInfoSrp.payload, customInfoTarget.payload);
    }
    var mergedSearch = Object.assign({}, customInfoSrp.search, customInfoTarget.search);
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

export const getDateTime = () => {
    var timeInMilliseconds = new Date().getTime(); // timeInMilliseconds (1618220075786)
    var timeInMillisecondsInCustomFormat = Platform.OS === 'ios' ? timeInMilliseconds : (timeInMilliseconds / 1000);
    // console.log("timeInMillisecondsInCustomFormat = ",timeInMillisecondsInCustomFormat)
    return timeInMillisecondsInCustomFormat;
  }

export const getTrackingObjectForSectionTacking = ({page_name, event, stage, section, trigger , workflow, source, referrer, custom_object, clientId,appVersionCode, current_url,ota_version_code, ota_version_name, notifToken = '',page_type='',page_version='',scope=''}) => {
    // console.log("page type from the nntracking utils : ",page_type);
    let tracking_data = [];
    let tracking_obj = '';
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
    if(page_version){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            page_version: page_version,
        };
    }

    if(scope){
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            scope: scope,
        };
    }

    var objSdk = { custom_object: { isRnSDK: 'true', notif_token: notifToken } };

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

    if (Platform.OS === 'ios') {
        complete_tracking_obj['platform'] = 'IOS';
    }

    if (Platform.OS === 'android') {
        complete_tracking_obj['platform'] = 'Android';
    }

    complete_tracking_obj['app_version'] = appVersionCode
    complete_tracking_obj['date_time'] = getDateTime();
    complete_tracking_obj["referrer"] = referrer;
    complete_tracking_obj["current_url"] = current_url;
    complete_tracking_obj['ota_version_code'] = ota_version_code ? ota_version_code : "1";
    complete_tracking_obj['ota_version_name'] = ota_version_name ? ota_version_name : "1.0.0";

    var device_info = `${getBrand()} | ${getModel()}`;

    complete_tracking_obj['device'] = device_info;


    var url = '/do/clickStreamTracking/ClickStream/trackData';
    // var url = "http://www.99acres.com/do/clickStreamTracking/ClickStream/trackData";

    if (Platform.OS === 'android') {
        url = 'http://99services.99.jsb9.net/clickstream-validation-service/tracking/app';
    }
            complete_tracking_obj['visitor_id'] = clientId;
            let android_tracking_obj = {};
            android_tracking_obj['csTrackingModel'] = complete_tracking_obj;
            android_tracking_obj['id'] = tracking_id;
            tracking_id = tracking_id + 1;

            tracking_data.push(android_tracking_obj);
            tracking_obj = 'data=' + JSON.stringify(tracking_data);
 
    return tracking_obj;
};

export const getTrackingObjectForPageTacking = ({page_name, event, stage, section, trigger , workflow, source, referrer, custom_object, clientId,appVersionCode,current_url,message_id,ota_version_code, ota_version_name, notifToken = '',network = {},page_type='',page_version='',scope=''}) => {
// console.log("page type from the nntracking utils : ",page_type);
    let tracking_data = [];
    let tracking_obj = '';
    var complete_tracking_obj = {};
    complete_tracking_obj['action'] = {
        page: page_name,
        event: event || '',
        stage: stage || 'FINAL',
        referrer_section: '',
        section: '' ,
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

    if(page_type) {
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

    if(scope) {
        complete_tracking_obj['action'] = {
            ...complete_tracking_obj['action'],
            scope: scope
        }
    }

    var objSdk = { custom_object: { isRnSDK: 'true', notif_token: notifToken } };

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

    if(message_id || section != null)
    {
        complete_tracking_obj['message_id'] = message_id || section;
    }

    if (Platform.OS === 'ios') {
        complete_tracking_obj['platform'] = 'IOS';
    }

    if (Platform.OS === 'android') {
        complete_tracking_obj['platform'] = 'Android';
    }

    complete_tracking_obj['app_version'] = appVersionCode;
    complete_tracking_obj['date_time'] = getDateTime();
    complete_tracking_obj["referrer"] = referrer;
    complete_tracking_obj['current_url'] = current_url != null ? current_url : page_name;
    complete_tracking_obj['ota_version_code'] = ota_version_code ? ota_version_code : "1";
    complete_tracking_obj['ota_version_name'] = ota_version_name ? ota_version_name : "1.0.0";
    complete_tracking_obj['network'] = network;
    // complete_tracking_obj = currentUrlAdd(complete_tracking_obj);

    var device_info = `${getBrand()} | ${getModel()}`;

    complete_tracking_obj['device'] = device_info;


    var url = '/do/clickStreamTracking/ClickStream/trackData';
    // var url = "http://www.99acres.com/do/clickStreamTracking/ClickStream/trackData";

    if (Platform.OS === 'android') {
        url = 'http://99services.99.jsb9.net/clickstream-validation-service/tracking/app';
    }
            complete_tracking_obj['visitor_id'] = clientId;
            let android_tracking_obj = {};
            android_tracking_obj['csTrackingModel'] = complete_tracking_obj;
            // android_tracking_obj['id'] = tracking_id;
            // tracking_id = tracking_id + 1;

            tracking_data.push(android_tracking_obj);
            tracking_obj = 'data=' + JSON.stringify(tracking_data);

            return tracking_obj;
}

export const getTrackingObjectForVideoTracking = ({
    page_name = '',
    event = '',
    stage = '',
    section = '',
    custom_object = {},
    payload = {},
    clientId,
    appVersionCode,
    referrer = '',
    current_url = '',
    total_duration = '',
    current_duration = '',
    page_type = '',
    page_version = '',
    search = {}
}) => {
    let tracking_data = [];
    let tracking_obj = '';
    var complete_tracking_obj = {};

    complete_tracking_obj['action'] = {
        page: page_name,
        event: event || '',
        stage: stage || 'FINAL',
        referrer_section: '',
        section: section || null ,
    };
  var objSdk = { custom_object: { isRnSDK: "true" } };

  complete_tracking_obj["custom_object"] = Object.assign(
    {},
    objSdk.custom_object
  );

    if (
      payload &&
      Object.getOwnPropertyNames(payload).length
    ) {
      complete_tracking_obj["payload"] = payload;
    }
    if (
      custom_object &&
      Object.getOwnPropertyNames(custom_object).length
    ) {
      complete_tracking_obj["custom_object"] = Object.assign(
        {},
        custom_object,
        objSdk.custom_object
      );
    }
    if (
        search &&
        Object.getOwnPropertyNames(search).length
      ) {
        complete_tracking_obj["search"] = search;
      }

  if (Platform.OS === "ios") {
    complete_tracking_obj["platform"] = "IOS";
  }

  if (Platform.OS === "android") {
    complete_tracking_obj["platform"] = "Android";
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
  if(total_duration) {
    complete_tracking_obj["payload"] = payload ? {
        ...complete_tracking_obj["payload"],
        video : payload["video"] ? 
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
    complete_tracking_obj["payload"] = payload ? {
        ...complete_tracking_obj["payload"],
        video : payload["video"] ? 
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

  complete_tracking_obj["app_version"] = appVersionCode;
  complete_tracking_obj["date_time"] = getDateTime();
  complete_tracking_obj["referrer"] = referrer;
  complete_tracking_obj["current_url"] = current_url;

  complete_tracking_obj["visitor_id"] = clientId;
  let android_tracking_obj = {};
  android_tracking_obj["csTrackingModel"] = complete_tracking_obj;
  android_tracking_obj["id"] = tracking_id;
  tracking_id = tracking_id + 1;

  tracking_data.push(android_tracking_obj);
  tracking_obj = "data=" + JSON.stringify(tracking_data);

  return tracking_obj;
};


export const sendTracking = (trackingObject) => {
    fetch(`http://sanity1.infoedge.com/99api/v24/clickstreamtracking/`, {
        method: 'POST',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: trackingObject,
    })
        .then((response) => response.json())
        .then((response) => console.log('Tracking Response == ', response))
        .catch((error) => {
            NativeModules?.NativeHelperModule?.reportAndShowErrorMessage("CLICKSTREAM ERROR",trackingObject)
            console.error('Tracking Error == ', error);
        });
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