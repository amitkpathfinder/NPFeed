package com.myapp;

import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

public class MyExoPlayerManager extends SimpleViewManager<MyExoPlayerView> {

    public static final String REACT_CLASS = "MyExoPlayer";

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected MyExoPlayerView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new MyExoPlayerView(reactContext);
    }

    @ReactProp(name = "videoUrl")
    public void setVideoUrl(MyExoPlayerView view, String url) {
        view.setVideoUrl(url);
    }
}

