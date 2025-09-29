import { useEffect } from 'react';
import { InteractionManager, NativeModules, Platform } from 'react-native';
import { NNTrackingDataHandler } from './NNTrackingDataHandler';
import { getKeyIdStack, logWithNative } from './NNGlobalStackUtils';

export const usePageLoadTracking = ({
  isLoaded,
  pageNameFromPage
}) => {
  useEffect(() => {
    if (isLoaded) {
      // logWithNative("HOOKS IF:: ")
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {

          const shimmerTime = new Date().getTime();
          const initTimePage = parseInt(NNTrackingDataHandler.getData("INIT_PAGE_TIME"));
          const currentStack = getKeyIdStack();
          const pageName = pageNameFromPage ? pageNameFromPage : currentStack.length > 0 ? currentStack[currentStack.length - 1] : 'UNKNOWN_PAGE_FROM_STACK';

          if(initTimePage == 0) return;
          if(Platform.OS == 'android') {
            NativeModules.RNHPModule.prodLogger(`Page Shimmer Time : ${pageName} : ${((shimmerTime - initTimePage)/1000).toFixed(2)} sec`); 
            NativeModules.AppInfoModule.sendAppTracking("RN_PAGE_SHIMMER_LOADED", {
              custom_object: {
                pageName: pageName,
                total_time: shimmerTime - initTimePage
              },
              component: pageName
            });
          } else if(Platform.OS == 'ios') {
            NativeModules.AppInfoModule.sendAppTracking({
              custom_object : {
                pageName: pageName,
                total_time : shimmerTime - initTimePage
              },
              component : pageName
            }, "RN_PAGE_SHIMMER_LOADED");
          }
          
          setTimeout(() => {
            const renderTime = new Date().getTime();
            const initTime = parseInt(NNTrackingDataHandler.getData("INIT_PAGE_TIME"));
            const currentStack = getKeyIdStack();
            const pageName = pageNameFromPage ? pageNameFromPage : currentStack.length > 0 ? currentStack[currentStack.length - 1] : 'UNKNOWN_PAGE_FROM_STACK';

            if(initTime == 0) return;
            if(Platform.OS == 'android') {
              // NativeModules.RNHPModule.prodLogger(`Page Rendered : ${pageName} : ${new Date(renderTime).toLocaleTimeString()}`);
              NativeModules.RNHPModule.prodLogger(`Page Load Time : ${pageName} : ${((renderTime - initTime)/1000).toFixed(2)} sec`);
              NativeModules.AppInfoModule.sendAppTracking("RN_PAGE_LOADED", {
                custom_object: {
                  pageName: pageName,
                  total_time: renderTime - initTime
                },
                component: pageName
              });
            } else if(Platform.OS == 'ios') {
              NativeModules.AppInfoModule.sendAppTracking({
                custom_object : {
                  pageName: pageName,
                  total_time : renderTime - initTime
                },
                component : pageName
              }, "RN_PAGE_LOADED");
            }
            
            NNTrackingDataHandler.setData("INIT_PAGE_TIME", 0);
          }, 0);
        });
      });
    } else {
      if (NNTrackingDataHandler.getData("INIT_PAGE_TIME") == 0) {
        logWithNative("HOOKS ELSE:: ")
        const initTime = new Date().getTime();
        const currentStack = getKeyIdStack();
        const pageNameReInit = currentStack.length > 0 ? currentStack[currentStack.length - 1] : 'UNKNOWN_PAGE_FROM_STACK_INIT';

        if(Platform.OS == 'android') {
          NativeModules.RNHPModule.prodLogger(`Page Initialized : ${pageNameReInit} : ${new Date(initTime).toLocaleTimeString()}`);
        }
        NNTrackingDataHandler.setData("INIT_PAGE_TIME", initTime);
      }
    }
  }, [isLoaded]);
};
