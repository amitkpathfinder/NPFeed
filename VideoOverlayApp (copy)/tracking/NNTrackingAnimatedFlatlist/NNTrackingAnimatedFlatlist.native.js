import React, { useCallback, useState, useContext} from 'react';
import {connect} from 'react-redux';
import {useTrackingJsonPicker} from '../TrackingJSONPicker/useTrackingJsonPicker';
import { PagerViewContext } from '../NNPagerView/index';
import { Animated } from 'react-native';

const viewabilityConfig = {
  itemVisiblePercentThreshold: 30,
  minimumViewTime: 1,
  waitForInteraction: false,
};

const NNTrackingAnimatedFlatlist = (props, ref) => {

  let focusRef, index;
  const context = useContext(PagerViewContext);

   if (context) {
     focusRef = context.focusRef;
     index = context.index;
   }
 
   let updatedViewabilityConfig = viewabilityConfig;
 
    if(props.customVisibilityPercent_seventy) {
        updatedViewabilityConfig = {...updatedViewabilityConfig,itemVisiblePercentThreshold : 70}
    }
    else
    if(props.customVisibilityPercent_hundred) {
        updatedViewabilityConfig = {...updatedViewabilityConfig,itemVisiblePercentThreshold : 100}
   }
 
   let trackingJson;

    // if parent_name then trigger custom info auto pick flow
    if(props.parent_name)
    {
        // fetching json config of the current page to send custom info auto pick
     trackingJson = useTrackingJsonPicker(props.page_name)[props.parent_name];
   }
 
    // set that maintains which index trackings are already fired
    var trackingSentFinal = new Set();
 
   const onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
       changed?.forEach((element) => {
         if (!element?.isViewable) 
          return;
 
         const section_name = props?.trackingNameCallback(element.item, element.index);
         if (!trackingSentFinal.has(element.item) || props.allowDuplicate) {
 
         if (props.parent_name) {
             let dispatchData = {
               customObjectsData: {
                 rank: element.index + 1,
               },
               section: section_name,
             };
 
             if (trackingJson) {
               trackingJson.map(key => {
                 dispatchData.customObjectsData[key] = element?.item[key];
               });
             }
             props.saveDataToReducer(dispatchData);
             console.log("trackingJson::",dispatchData)
         }
              console.log("Tracking Name :",section_name)
              trackingSentFinal.add(element.item);
              if(focusRef){
                if(focusRef?.current == index){
                  props.updateViewportItems(section_name);
                }
                else{
                  props.savePreloadedData(index, section_name);
                }
              }
              else{
                 props.updateViewportItems(section_name)
              }
         }
       });
   }, []);
 
    const [viewabilityConfigCallbackPairs,setViewabilityConfigCallbackPairs] = useState(() => 
    props.viewabilityConfigCallbackPairs ? [
        ...props.viewabilityConfigCallbackPairs,{viewabilityConfig : updatedViewabilityConfig,onViewableItemsChanged}
    ] :
      props.onViewableItemsChanged ? [
        {viewabilityConfig : props.viewabilityConfig,onViewableItemsChanged : props.onViewableItemsChanged},
        {viewabilityConfig : updatedViewabilityConfig,onViewableItemsChanged}
    ] : [
        {viewabilityConfig : updatedViewabilityConfig,onViewableItemsChanged}
    ]);

  return (
    <Animated.FlatList
      ref={ref}
      {...props}
      onViewableItemsChanged={undefined}
      viewabilityConfig={null}
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
    />
  );
};

const mdtp = (dispatch) => ({
    updateViewportItems : (section_name) => dispatch({
    type: 'UPDATE/TRACKING_VIEWPORT_ITEMS',
    item: section_name,
    }),
    saveDataToReducer : (data) => dispatch({type:'TRACKING/SAVE_TUPLE_DATA',data:data}),
    savePreloadedData: (index, data) => {
      dispatch({ type: 'SET/PAGER_VIEW_PRELOADED_DATA', index, data: data });
    },
})

export default connect(null,mdtp,null,{forwardRef : true})(React.forwardRef(NNTrackingAnimatedFlatlist));
