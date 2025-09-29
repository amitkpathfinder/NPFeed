import React from "react";
import { FlatList } from "react-native";

const NNTrackingFlashlist = (props, ref) => {
    return (
        <FlatList 
            ref={ref}
            {...props}
        />
    );
}

export default React.forwardRef(NNTrackingFlashlist);