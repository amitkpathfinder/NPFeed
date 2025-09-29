/*
It is a utility function that picks the JSON config based on the page name for custom info auto pick
*/
export const useTrackingJsonPicker = (page_name) => {

    console.log("props page name :: ",page_name)
        switch(page_name)
        {
            case 'HP':
                const trackingJson = (require('../TrackingJSONs/DefaultHP.json'));
                console.log("trackinggggg :: ",trackingJson)
                return trackingJson
            default:
                return {}
        }

}