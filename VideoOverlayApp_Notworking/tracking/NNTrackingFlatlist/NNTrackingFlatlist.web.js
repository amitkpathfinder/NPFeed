/*
NNTrackingFlatlist in web is required in case of custom info auto pick
*/
import React from "react";
import { FlatList } from "react-native";
import {connect} from "react-redux";
import { useTrackingJsonPicker } from "../TrackingJSONPicker/useTrackingJsonPicker";

// intializing NNTrackingFlatlist functional component
const NNTrackingFlatlist = (props , ref) => {

    let trackingJson;

    // checking if parent_name is present then getting the JSON Config of the current page
    if(props.parent_name)
    {
        trackingJson = useTrackingJsonPicker(props.page_name)[props.parent_name];
    }

    // overriding render item of flatlist to add support of custom info auto pick
    const overrideRenderItem = (data) => {
        if(props.parent_name){
            const {item,index} = data;
            let dispatchData = {
                customObjectsData : {
                    rank : index+1, // auto adding the rank to every tuple's custom object
                },
                section : props.trackingNameCallback(item,index)
            }
            // Fetching keys mentioned in the config from the data
            trackingJson?.map(key => {
                dispatchData.customObjectsData[key] = item[key]
            })
            props.saveDataToReducer(dispatchData)
        }
        return props.renderItem(data);

    }

    return (
        <FlatList 
        ref={ref}
        {...props}
        renderItem={overrideRenderItem}
        />
    );
}

const mstp = (state = {}) => ({
    page_name : state?.NNTrackingReducer?.page_name || ''
});

const mdtp = (dispatch) => ({
    saveDataToReducer : (data) => dispatch({type:'TRACKING/SAVE_TUPLE_DATA',data:data})
})

export default connect(mstp,mdtp,null,{forwardRef : true})(React.forwardRef(NNTrackingFlatlist));