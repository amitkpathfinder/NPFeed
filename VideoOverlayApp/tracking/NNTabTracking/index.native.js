import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { connect } from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

const OverrideChildrenComponent = ( props ) => {

    const { navigation, name = '', Component = null, componentProps = {} , setScreenName, stackScreenName, deleteScreenData, firstScreen, setInternalReferrer,route } = props;
    
    const trackandNavigate = (screenName,screenProps,pushOrNavigate = false) => {
        setInternalReferrer(name);
            if(!pushOrNavigate)
                navigation.navigate(screenName,screenProps)
            else
                navigation.push(screenName,screenProps)
}

    useFocusEffect(
        useCallback(() => {
            let screen_name = route.key;
            console.log("setting screen_name : ", screen_name);
            const timeout = setTimeout(() => {
                setScreenName(screen_name);
                clearTimeout(timeout);
            },0);
        }, [])
      );

    useLayoutEffect(() => {
            let screen_name = route.key;
            console.log("setting screen_name : ", screen_name);
            setScreenName(screen_name);
            return () => {
                deleteScreenData(screen_name);
            }
    },[]);

    return <Component {...componentProps} />;
};

const NNTabTracking = (props) => {

    const { screens = [] , screenOptions,initialRouteName, tabBar} = props;

    const Tab = createMaterialTopTabNavigator();

    return (
        <Tab.Navigator
            tabBar={tabBar}
            {...screenOptions}
            initialRouteName={initialRouteName}
        >
            {screens.map((item) => {
                const Component = item.component;
                return (
                <Tab.Screen
                name={item.screenName}
                {...item.screenProps}
                children={(tabProps) => {
                    return <OverrideChildrenComponent name={item.screenName} Component={Component} componentProps = {item.componentProps} {...tabProps} {...props} firstScreen={screens[0].screenName} />} }
                >
                </Tab.Screen>
                );
            })}
        </Tab.Navigator>
    );
};

const mstp = (state) => {
        return {
        stackScreenName : state?.NNTrackingReducer?.stackNavigatorData?.stackScreenName
    }
}

const mdtp = (dispatch) => ({
        setScreenName : (data) => {
            console.log("dispatching action : ",data);
            dispatch({type : 'SET/TRACKING_TAB_SCREEN_NAME' , data });
        },
        deleteScreenData : (data) => dispatch({type : 'DELETE/TRACKING_TAB_SCREEN_DATA', data}),
        setInternalReferrer : (data) => dispatch({type : 'SET/TRACKING_INTERNAL_REFERRER', data})
})

export default connect(mstp,mdtp)(NNTabTracking);
