import { createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useLayoutEffect } from 'react';
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
            setScreenName(screen_name);
        }, [])
      );

      useLayoutEffect(() => {
            let screen_name = route.key;
            setScreenName(screen_name);
        return () => {
            let screen_name = route.key;
            deleteScreenData(screen_name);
        }
    },[]);

    return <Component {...componentProps} {...props} navigation={{...navigation,trackandNavigate: trackandNavigate}} />;
};

const NNStackTracking = (props) => {

    const { screens = [] , screenOptions,initialRouteName} = props;

    const Stack = createStackNavigator();

    return (
        <Stack.Navigator
            screenOptions={screenOptions}
            initialRouteName={initialRouteName}
        >
            {screens.map((item) => {
                const Component = item.component;
                return (
                <Stack.Screen
                name={item.screenName}
                {...item.screenProps}
                children={(stackProps) => {
                    return <OverrideChildrenComponent name={item.screenName} Component={Component} componentProps = {item.componentProps} {...stackProps} {...props} firstScreen={screens[0].screenName} />} }
                >
                </Stack.Screen>
                );
            })}
        </Stack.Navigator>
    );
};

const mstp = (state) => {
        return {
        stackScreenName : state?.NNTrackingReducer?.stackNavigatorData?.stackScreenName
    }
}

const mdtp = (dispatch) => ({
        setScreenName : (data) => dispatch({type : 'SET/TRACKING_SCREEN_NAME' , data }),
        deleteScreenData : (data) => dispatch({type : 'DELETE/TRACKING_SCREEN_DATA', data}),
        setInternalReferrer : (data) => dispatch({type : 'SET/TRACKING_INTERNAL_REFERRER', data})
})

export default connect(mstp,mdtp)(NNStackTracking);
