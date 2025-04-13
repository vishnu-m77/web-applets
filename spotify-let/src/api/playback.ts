import { PlaybackState, GetCurrentPlaybackStateParams, PausePlaybackParams, ResumePlaybackParams, SkipToNextParams, SkipToPreviousParams, PlayTrackParams, SetVolumeParams, ToggleShuffleParams, ToggleRepeatParams } from '../types';

export const getCurrentPlaybackState = async ({ accessToken }: GetCurrentPlaybackStateParams): Promise<PlaybackState | null> => {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 204) {
            // No active device, but we can still get the current playback state
            const currentlyPlayingResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (currentlyPlayingResponse.status === 204) {
                return null; // No track is currently playing
            }

            if (!currentlyPlayingResponse.ok) {
                throw new Error(`Failed to get currently playing track: ${currentlyPlayingResponse.statusText}`);
            }

            const data = await currentlyPlayingResponse.json();
            return {
                device: {
                    id: null,
                    is_active: false,
                    is_private_session: false,
                    is_restricted: false,
                    name: 'No active device',
                    type: 'unknown',
                    volume_percent: 0,
                    supports_volume: false
                },
                repeat_state: 'off',
                shuffle_state: false,
                context: null,
                timestamp: Date.now(),
                progress_ms: data.progress_ms || 0,
                is_playing: data.is_playing || false,
                item: data.item || null,
                currently_playing_type: data.currently_playing_type || 'unknown',
                actions: {
                    interrupting_playback: false,
                    pausing: false,
                    resuming: false,
                    seeking: false,
                    skipping_next: false,
                    skipping_prev: false,
                    toggling_repeat_context: false,
                    toggling_shuffle: false,
                    toggling_repeat_track: false,
                    transferring_playback: false
                }
            };
        }

        if (!response.ok) {
            throw new Error(`Failed to get playback state: ${response.statusText}`);
        }

        const data = await response.json();
        return data as PlaybackState;
    } catch (error) {
        console.error('Error getting playback state:', error);
        return null;
    }
};

export const playTrack = async ({ accessToken, trackUri, contextUri }: PlayTrackParams): Promise<void> => {
    let body: any = {};
    
    if (contextUri) {
        // If we have a context URI (playlist), we need to find the track's position in the playlist
        const playlistId = contextUri.split(':')[2];
        const trackId = trackUri.split(':')[2];
        
        // First, get the playlist tracks to find the track's position
        const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!playlistResponse.ok) {
            throw new Error(`Failed to get playlist tracks: ${playlistResponse.statusText}`);
        }
        
        const playlistData = await playlistResponse.json();
        const trackIndex = playlistData.items.findIndex((item: any) => item.track.id === trackId);
        
        if (trackIndex === -1) {
            throw new Error('Track not found in playlist');
        }
        
        body = {
            context_uri: contextUri,
            offset: {
                position: trackIndex
            }
        };
    } else {
        // If no context URI, just play the track directly
        body = {
            uris: [trackUri]
        };
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Failed to play track: ${response.statusText}`);
    }
};

export const pausePlayback = async ({ accessToken }: PausePlaybackParams): Promise<void> => {
    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to pause playback: ${response.statusText}`);
    }
};

export const resumePlayback = async ({ accessToken }: ResumePlaybackParams): Promise<void> => {
    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to resume playback: ${response.statusText}`);
    }
};

export const skipToNext = async ({ accessToken }: SkipToNextParams): Promise<void> => {
    const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to skip to next track: ${response.statusText}`);
    }
};

export const skipToPrevious = async ({ accessToken }: SkipToPreviousParams): Promise<void> => {
    const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to skip to previous track: ${response.statusText}`);
    }
};

export const setVolume = async ({ accessToken, volumePercent }: SetVolumeParams): Promise<void> => {
    const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to set volume: ${response.statusText}`);
    }
};

export const toggleShuffle = async ({ accessToken, state }: ToggleShuffleParams): Promise<void> => {
    const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${state}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to toggle shuffle: ${response.statusText}`);
    }
};

export const toggleRepeat = async ({ accessToken, state }: ToggleRepeatParams): Promise<void> => {
    const response = await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${state}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to toggle repeat: ${response.statusText}`);
    }
};

export const getQueue = async ({ accessToken }: { accessToken: string }): Promise<any> => {
    const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get queue: ${response.statusText}`);
    }

    return await response.json();
}; 