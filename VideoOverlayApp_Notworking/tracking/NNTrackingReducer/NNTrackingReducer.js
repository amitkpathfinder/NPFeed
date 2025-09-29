// initial state given to the reducer
const initialState = {
    isRNPage: false, // flag for rn page
    page_name: '', // saves page name globally
    clientId: '', // saves client Id in case of apps
    trackingObjects : {}, // saves trackingObjects in case of batching
    appVersionCode : '', // saves app version code in case of apps
    trackIndex : 0, // pointer keeping a track of next element to be fired from viewportSections
    viewPortSections : [], // sections that are in viewport
    customObjects : {}, // for custom info auto pick
    batchForWeb : [], // trackingobjects batch for web
    data_custom_info_global : {}, // custom info to be appended to all objects across page
    enableBatching : false, // flag for batching on web
    batchingAlreadyEnabled : false, // flag that checks batching is already enabled or not
    stackNavigatorData : {
        stackScreenName : null,
        stackScreensData : {}
    },
    pagerViewData:{
        pagerViewIndex : null,
        pagerViewScreenData:{}
    },
    tabNavigatorData : {
        tabScreenName : null,
        tabScreensData : {}
    },
    current_url_native : '',
    referrer_native : '',
    moEngageEvents : {},
    moEngageData : {},
    realTimeEventList : [],
    page_version: ''
};


// initializing NNTrackingReducer with initial State
const NNTrackingReducer = (state = initialState, action) => {



    // All different actions for different states updates
    switch(action.type) {
        case "SET/PAGER_VIEW_INDEX":{
            // console.log("Recieved the value of the SET_PAGER_VIEW_INDEX as the INDEX----------",action,"  ",Date.now())
        if (state.pagerViewData.pagerViewScreenData.hasOwnProperty(action.data)) {
                    return {
                    ...state,
                     pagerViewData : {
                        ...state.pagerViewData,
                        pagerViewIndex : action.data,
                }
              }
            }

            return {
                ...state,
                pagerViewData : {
                    ...state.pagerViewData,
                    pagerViewIndex:action.data,
                    pagerViewScreenData : {
                        ...state.pagerViewData.pagerViewScreenData,
                        [action.data] : {
                            viewPortSections : [],
                            trackingObjects : {},
                            trackIndex : 0,
                            current_url_native : '',
                            referrer_native : '',
                            pager_view_data : {},
                            preloaded_data:[]
                        }
                    }
                  
                }
            }
        }
     case "UPDATE/PAGER_VIEW_SCREEN_DATA": 
//   console.log("Recieved the value of the SET_PAGER_VIEW_SCREEN_DATA as the INDEX--------",action)
return {
  ...state,
  pagerViewData: {
    ...state.pagerViewData,
    pagerViewScreenData: {
      ...state.pagerViewData.pagerViewScreenData,
      [action.index]: {
        ...state.pagerViewData.pagerViewScreenData[action.index],
        pager_view_data:{...action.data}
      }
    }
  }
};

     case "SET/PAGER_VIEW_PRELOADED_DATA": 
//   console.log("Recieved the value of the SET_PAGER_VIEW_PRELOADED_DATA as the INDEX--------",action)
return {
  ...state,
  pagerViewData: {
    ...state.pagerViewData,
    pagerViewScreenData: {
      ...state.pagerViewData.pagerViewScreenData,
      [action.index]: {
        ...state.pagerViewData.pagerViewScreenData[action.index],
        preloaded_data:[...state.pagerViewData.pagerViewScreenData[action.index].preloaded_data,action.data]}
    }
  }
};

case "DELETE/PAGER_VIEW_PRELOADED_DATA":
    // console.log("delete the pager view data=-=-=-=-=-=-=-=-=-",action)
    return{
        ...state,
        pagerViewData:{
            ...state.pagerViewData,
            pagerViewScreenData:{
                ...state.pagerViewData.pagerViewScreenData,
                [action.index]:{
                    ...state.pagerViewData.pagerViewScreenData[action.index],
                    preloaded_data:[]
                }
            }
        }
    };

 
        case "SET/TRACKING_IS_RN_PAGE":
            return {
                ...state,
                isRNPage: action.data
            }
        case "SET/TRACKING_REAL_TIME_EVENT":
            return {
                ...state,
                realTimeEventList : [...state.realTimeEventList,action.item]
            }
        case "SET/TRACKING_CLIENT_ID":
            return {
                ...state,
                clientId: action.data
            }
        case "SET/TRACKING_PAGE_NAME":
            if(state.tabNavigatorData.tabScreenName != null)
            {
                return {
                    ...state,
                    tabNavigatorData : {
                        ...state.tabNavigatorData,
                        tabScreensData : {
                            ...state.tabNavigatorData.tabScreensData,
                            [state.tabNavigatorData.tabScreenName] : {
                                ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName],
                                page_name : action.data
                            }
                        }
                    }
                }
            }
            else {
                return {
                    ...state,
                    page_name: action.data
                }
            }
        case "SET/TRACKING_PAGE_VERSION":
            return{
                ...state,
                page_version:action.data
            }
        case "SET/TRACKING_SCREEN_NAME":{
            if(state.stackNavigatorData.stackScreensData.hasOwnProperty(action.data))
            {
                return {
                    ...state,
                    stackNavigatorData : {
                        ...state.stackNavigatorData,
                        stackScreenName : action.data
                    }
                }
            }
            return {
                ...state,
                stackNavigatorData : {
                    ...state.stackNavigatorData,
                    stackScreenName : action.data,
                    stackScreensData : {
                        ...state.stackNavigatorData.stackScreensData,
                        [action.data] : {
                            viewPortSections : [],
                            trackingObjects : {},
                            trackIndex : 0,
                            current_url_native : '',
                            referrer_native : ''
                        }
                    }
                }
            }
        }
        case "SET/TRACKING_TAB_SCREEN_NAME":{
            if(state.tabNavigatorData.tabScreensData.hasOwnProperty(action.data))
                {
                    return {
                        ...state,
                        tabNavigatorData : {
                            ...state.tabNavigatorData,
                            tabScreenName : action.data
                        }
                    }
                }
                return {
                    ...state,
                    tabNavigatorData : {
                        ...state.tabNavigatorData,
                        tabScreenName : action.data,
                        tabScreensData : {
                            ...state.tabNavigatorData.tabScreensData,
                            [action.data] : {
                                viewPortSections : [],
                                trackingObjects : {},
                                trackIndex : 0,
                                current_url_native : '',
                                referrer_native : ''
                            }
                        }
                    }
                }
        }
        case "DELETE/TRACKING_SCREEN_DATA":{
            delete state.stackNavigatorData.stackScreensData[action.data];
            return state;
        }
        case "DELETE/TRACKING_TAB_SCREEN_DATA":{
            delete state.tabNavigatorData.tabScreensData[action.data];
            return state;
        }
        case "UPDATE/TRACKING_VIEWPORT_ITEMS":
            // console.log("UPDATE/TRACKING_VIEWPORT_ITEMS",action);
            if(state.stackNavigatorData.stackScreenName != null)
            {
                return {
                    ...state,
                    stackNavigatorData : {
                        ...state.stackNavigatorData,
                        stackScreensData : {
                            ...state.stackNavigatorData.stackScreensData,
                            [state.stackNavigatorData.stackScreenName] : {
                                ...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName],
                                viewPortSections : [...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName].viewPortSections,action.item]
                            }
                        }
                    }
                }
            }
             else if(state.pagerViewData.pagerViewIndex != null ){
                 return {
                    ...state,
                    pagerViewData:{
                        ...state.pagerViewData,
                        pagerViewScreenData : {
                            ...state.pagerViewData.pagerViewScreenData,
                            [state.pagerViewData.pagerViewIndex] : {
                                ...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex],
                                viewPortSections : [...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex].viewPortSections,action.item]
                            }
                        }

                    }
                 }
             }

            else
            if(state.tabNavigatorData.tabScreenName != null)
                {
                    return {
                        ...state,
                        tabNavigatorData : {
                            ...state.tabNavigatorData,
                            tabScreensData : {
                                ...state.tabNavigatorData.tabScreensData,
                                [state.tabNavigatorData.tabScreenName] : {
                                    ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName],
                                    viewPortSections : [...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName].viewPortSections,action.item]
                                }
                            }
                        }
                    }
                }
            else
            {
                return {
                    ...state,
                    viewPortSections : [...state.viewPortSections,action.item]
                }
            }
        case "TRACKING/SAVE_TUPLE_DATA":
            console.log("data in reducer : ",action.data)
            return {
                ...state,
                customObjects : {
                    ...state.customObjects,
                    [action.data.section] : action.data.customObjectsData
                }
            }
    
        case "ADD/TRACKING_OBJECT_FOR_SECTION":
        if(state.stackNavigatorData.stackScreenName != null)
        {
            const updatedState = {
                ...state,
                stackNavigatorData : {
                    ...state.stackNavigatorData,
                    stackScreensData : {
                        ...state.stackNavigatorData.stackScreensData,
                        [state.stackNavigatorData.stackScreenName] : {
                            ...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName],
                            trackingObjects : {
                                ...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName].trackingObjects,
                                [action.section_name] : action.item
                            }
                        }
                    }
                }
            }
            return updatedState;
        }
        else if(state.pagerViewData.pagerViewIndex != null) {
            return {
                ...state,
                pagerViewData : {
                    ...state.pagerViewData,
                    pagerViewScreenData : {
                        ...state.pagerViewData.pagerViewScreenData,
                        [state.pagerViewData.pagerViewIndex] : {
                            ...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex],
                            trackingObjects : {
                                ...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex].trackingObjects,
                                [action.section_name] : action.item
                            }
                        }
                    }
                }
            }
        }
            
        else
        if(state.tabNavigatorData.tabScreenName != null)
            {
                const updatedState = {
                    ...state,
                    tabNavigatorData : {
                        ...state.tabNavigatorData,
                        tabScreensData : {
                            ...state.tabNavigatorData.tabScreensData,
                            [state.tabNavigatorData.tabScreenName] : {
                                ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName],
                                trackingObjects : {
                                    ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName].trackingObjects,
                                    [action.section_name] : action.item
                                }
                            }
                        }
                    }
                }
                return updatedState;
            }
        else
        {
            return {
                ...state,
                trackingObjects : {
                    ...state.trackingObjects,
                    [action.section_name] : action.item
                }
            }
        }
        case "UPDATE/TRACK_INDEX":
            if(state.stackNavigatorData.stackScreenName != null)
            {
                return {
                    ...state,
                    stackNavigatorData : {
                        ...state.stackNavigatorData,
                        stackScreensData : {
                            ...state.stackNavigatorData.stackScreensData,
                            [state.stackNavigatorData.stackScreenName] : {
                                ...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName],
                                trackIndex : state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName].trackIndex + 1
                            }
                        }
                    }
                }
            }
            else if(state.pagerViewData.pagerViewIndex != null) {
                return {
                    ...state,
                    pagerViewData : {
                        ...state.pagerViewData,
                        pagerViewScreenData : {
                            ...state.pagerViewData.pagerViewScreenData,
                            [state.pagerViewData.pagerViewIndex] : {
                                ...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex],
                                trackIndex : state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex].trackIndex + 1
                            }
                        }
                    }
                }
            }
            else
            if(state.tabNavigatorData.tabScreenName != null)
                {
                    return {
                        ...state,
                        tabNavigatorData : {
                            ...state.tabNavigatorData,
                            tabScreensData : {
                                ...state.tabNavigatorData.tabScreensData,
                                [state.tabNavigatorData.tabScreenName] : {
                                    ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName],
                                    trackIndex : state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName].trackIndex + 1
                                }
                            }
                        }
                    }
                }
            else
            {
                return {
                    ...state,
                    trackIndex : state.trackIndex + 1
                }
            }
        case "ADD/TRACKING_BATCH_WEB":
            return {
                ...state,
                batchForWeb : [...state.batchForWeb , action.data]
            }
        case "ENABLE/BATCH_WEB":
            return {
                ...state,
                enableBatching : true
            }
        case "EMPTY/TRACK_BATCH":
            return {
                ...state,
                batchForWeb : []
            }
        case "SET/BATCH_FLAG":
            return {
                ...state,
                batchingAlreadyEnabled : true
            }
        case "SET/TRACKING_APP_VERSION":
            return {
                ...state,
                appVersionCode : action.data
            }
        case "SET/TRACKING_MO_ENGAGE_DATA":
            return {
                ...state,
                moEngageData : action.data
            }
        case "SET/TRACKING_GLOBAL_DATA":
            console.log("Recieved the value of the SET_TRACKING_GLOBAL_DATA as the DATA--------",action.data)
            if(state.stackNavigatorData.stackScreenName != null) {
                return {
                    ...state,
                    stackNavigatorData : {
                        ...state.stackNavigatorData,
                        stackScreensData : {
                            ...state.stackNavigatorData.stackScreensData,
                            [state.stackNavigatorData.stackScreenName] : {
                                ...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName],
                                data_custom_info_global : action.data
                            }
                        }
                    }
                }
            }
            else if(state.pagerViewData.pagerViewIndex != null) {
                return {
                    ...state,
                    pagerViewData : {
                        ...state.pagerViewData,
                        pagerViewScreenData : {
                            ...state.pagerViewData.pagerViewScreenData,
                            [state.pagerViewData.pagerViewIndex] : {
                                ...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex],
                                data_custom_info_global : action.data
                            }
                        }
                    }
                }
            }
            else
            if(state.tabNavigatorData.tabScreenName != null) {
                return {
                    ...state,
                    tabNavigatorData : {
                        ...state.tabNavigatorData,
                        tabScreensData : {
                            ...state.tabNavigatorData.tabScreensData,
                            [state.tabNavigatorData.tabScreenName] : {
                                ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName],
                                data_custom_info_global : action.data
                            }
                        }
                    }
                }
            }
            else
            {
                return {
                    ...state,
                    data_custom_info_global : action.data
                }
            }
        case "SET/TRACKING_REFERRER":
            if(state.stackNavigatorData.stackScreenName != null) {
                return {
                    ...state,
                    stackNavigatorData : {
                        ...state.stackNavigatorData,
                        stackScreensData : {
                            ...state.stackNavigatorData.stackScreensData,
                            [state.stackNavigatorData.stackScreenName] : {
                                ...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName],
                                referrer_native : action.data
                            }
                        }
                    }
                }
            }
            else if(state.pagerViewData.pagerViewIndex != null) {
                return {
                    ...state,
                    pagerViewData : {
                        ...state.pagerViewData,
                        pagerViewScreenData : {
                            ...state.pagerViewData.pagerViewScreenData,
                            [state.pagerViewData.pagerViewIndex] : {
                                ...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex],
                                referrer_native : action.data
                            }
                        }
                    }
                }
            }
            else if(state.tabNavigatorData.tabScreenName != null) {
                return {
                    ...state,
                    tabNavigatorData : {
                        ...state.tabNavigatorData,
                        tabScreensData : {
                            ...state.tabNavigatorData.tabScreensData,
                            [state.tabNavigatorData.tabScreenName] : {
                                ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName],
                                referrer_native : action.data
                            }
                        }
                    }
                }
            }
            else
            {
                return {
                    ...state,
                    referrer_native : action.data
                }
            }
        case "SET/TRACKING_CURRENT_URL":
            if(state.stackNavigatorData.stackScreenName != null) {
                return {
                    ...state,
                    stackNavigatorData : {
                        ...state.stackNavigatorData,
                        stackScreensData : {
                            ...state.stackNavigatorData.stackScreensData,
                            [state.stackNavigatorData.stackScreenName] : {
                                ...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName],
                                current_url_native : action.data
                            }
                        }
                    }
                }
            }
            else if(state.pagerViewData.pagerViewIndex != null) {
                return {
                    ...state,
                    pagerViewData : {
                        ...state.pagerViewData,
                        pagerViewScreenData : {
                            ...state.pagerViewData.pagerViewScreenData,
                            [state.pagerViewData.pagerViewIndex] : {
                                ...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex],
                                current_url_native : action.data
                            }
                        }
                    }
                }
            }
            else
            if(state.tabNavigatorData.tabScreenName != null) {
                return {
                    ...state,
                    tabNavigatorData : {
                        ...state.tabNavigatorData,
                        tabScreensData : {
                            ...state.tabNavigatorData.tabScreensData,
                            [state.tabNavigatorData.tabScreenName] : {
                                ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName],
                                current_url_native : action.data
                            }
                        }
                    }
                }
            }
            else
            {
                return {
                    ...state,
                    current_url_native : action.data
                }
            }
        case 'SET/TRACKING_INTERNAL_REFERRER' : {
            if(state.stackNavigatorData.stackScreenName != null) {
                return {
                    ...state,
                    stackNavigatorData : {
                        ...state.stackNavigatorData,
                        stackScreensData : {
                            ...state.stackNavigatorData.stackScreensData,
                            [state.stackNavigatorData.stackScreenName] : {
                                ...state.stackNavigatorData.stackScreensData[state.stackNavigatorData.stackScreenName],
                                internal_referrer : action.data
                            }
                        }
                    }
                }
            }
            else if(state.pagerViewData.pagerViewIndex != null) {
                return {
                    ...state,
                    pagerViewData : {
                        ...state.pagerViewData,
                        pagerViewScreenData : {
                            ...state.pagerViewData.pagerViewScreenData,
                            [state.pagerViewData.pagerViewIndex] : {
                                ...state.pagerViewData.pagerViewScreenData[state.pagerViewData.pagerViewIndex],
                                internal_referrer : action.data
                            }
                        }
                    }
                }
            }
            else if(state.tabNavigatorData.tabScreenName != null) {
                return {
                    ...state,
                    tabNavigatorData : {
                        ...state.tabNavigatorData,
                        tabScreensData : {
                            ...state.tabNavigatorData.tabScreensData,
                            [state.tabNavigatorData.tabScreenName] : {
                                ...state.tabNavigatorData.tabScreensData[state.tabNavigatorData.tabScreenName],
                                internal_referrer : action.data
                            }
                        }
                    }
                }
            }
            }
        case 'SET/TRACKING_MO_ENGAGE' : {
            return {
                ...state,
                moEngageEvents : {
                    ...state.moEngageEvents,
                    [action.item] : action.data
                }
            }
        }
        default: 
            return {
                ...state
            }
    };
};

export default NNTrackingReducer;