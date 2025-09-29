/*
This was intially designed for RN Widgets on Native Pages
*/
import NNTrackingReducer from "../NNTrackingReducer/NNTrackingReducer";
import { createStore } from "redux";

const NNTrackingStore = createStore(NNTrackingReducer);

export default NNTrackingStore;