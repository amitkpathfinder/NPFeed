package com.myapp;

import android.content.Context;
import android.net.Uri;
import android.view.View;

import com.google.android.exoplayer2.ExoPlayer;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.ui.PlayerView;

public class MyExoPlayerView extends PlayerView {

    private final ExoPlayer player;

    public MyExoPlayerView(Context context) {
        super(context);
        player = new ExoPlayer.Builder(context).build();
        setPlayer(player);
    }

    public void setVideoUrl(String url) {
        MediaItem mediaItem = MediaItem.fromUri(Uri.parse(url));
        player.setMediaItem(mediaItem);
        player.prepare();
        player.play();
    }

    public void releasePlayer() {
        player.release();
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        releasePlayer();
    }
}

