import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { FlashList } from '@shopify/flash-list';

// Defining the percentage visibility of a view for tracking threshold
const viewabilityConfig = {
    itemVisiblePercentThreshold: 1,
    minimumViewTime: 1,
    waitForInteraction: false,
};

const NNTrackingFlashlist = (props, ref) => {

    var trackingSentFinal = new Set();

    const onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {

        // iterating through the changed components in view port
        viewableItems?.forEach((element) => {
            // Getting relevant data for tracking object
            const section_name = props?.trackingNameCallback(element.item, element.index);
            // Checking if tracking is already sent or not for the given section
            if (!trackingSentFinal.has(element.index)) {
                // console.log('Flashlist --View port section tracking name : ', section_name);
                // Sending Section View Final Tracking from here
                props.updateViewportItems(section_name);
                // registering that the tracking for the given section view is sent
                trackingSentFinal?.add(element.index);
            }
        });
    }, []);

    const [viewabilityConfigCallbackPairs, setViewabilityConfigCallbackPairs] = useState(() => 
    props.viewabilityConfigCallbackPairs ? [
        ...props.viewabilityConfigCallbackPairs,{viewabilityConfig,onViewableItemsChanged}
    ] :
    props.onViewableItemsChanged ? [
        {viewabilityConfig : props.viewabilityConfig,onViewableItemsChanged : props.onViewableItemsChanged},
        {viewabilityConfig,onViewableItemsChanged}
    ] : [
        {viewabilityConfig,onViewableItemsChanged}
    ]);

    return (
        <FlashList
            ref={ref}
            {...props}
            onViewableItemsChanged={undefined}
            viewabilityConfig={null}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
        />
    )
};

const mdtp = (dispatch) => ({
    updateViewportItems : (section_name) => dispatch({
        type: 'UPDATE/TRACKING_VIEWPORT_ITEMS',
        item: section_name,
    })
})

export default connect(null,mdtp,null,{forwardRef : true})(React.forwardRef(NNTrackingFlashlist));
