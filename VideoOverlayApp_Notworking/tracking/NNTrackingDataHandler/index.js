/*
NNTrackingDataHandler is designed to keep data from native end in a singleton component with getters and setters
*/

// IIFE for saving data recieved from native side like app version code , client id , deeplink details etc.
export const NNTrackingDataHandler = (() => {
    let dataFromNative = null;
    if(dataFromNative == null){
        dataFromNative = {};
    }

    // getter method
    const getData = (key) => {
        if(dataFromNative && dataFromNative.hasOwnProperty(key)){
            return dataFromNative[key];
        }
        return null;
    }

    // setter method
    const setData = (key,value) => {
        dataFromNative[key] = value;
    }

    return {
        getData,
        setData
    }
})();