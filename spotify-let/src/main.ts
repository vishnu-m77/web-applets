import { applets } from '@web-applets/sdk';
import {
    getCurrentPlaybackState,
    playTrack,
    pausePlayback,
    resumePlayback,
    skipToNext,
    skipToPrevious,
    getPlaylists,
    searchTracks,
    searchAlbums,
    getRecentlyPlayed,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    getQueue
} from './api';
import { handleAuthentication, getStoredAccessToken } from './auth';
import { PlaybackState } from './types';

// Register the applet
const self = applets.register();

// Set up action handlers
self.setActionHandler('getCurrentPlaybackState', async (_params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await getCurrentPlaybackState({ accessToken });
});

self.setActionHandler('playTrack', async (params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await playTrack({ accessToken, trackUri: params.trackUri });
});

self.setActionHandler('pausePlayback', async (_params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await pausePlayback({ accessToken });
});

self.setActionHandler('resumePlayback', async (_params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await resumePlayback({ accessToken });
});

self.setActionHandler('skipToNext', async (_params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await skipToNext({ accessToken });
});

self.setActionHandler('skipToPrevious', async (_params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await skipToPrevious({ accessToken });
});

self.setActionHandler('getPlaylists', async (_params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await getPlaylists({ accessToken });
});

self.setActionHandler('searchTracks', async (params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await searchTracks({ accessToken, query: params.query });
});

self.setActionHandler('searchAlbums', async (params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await searchAlbums({ accessToken, query: params.query });
});

self.setActionHandler('getRecentlyPlayed', async (_params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await getRecentlyPlayed({ accessToken });
});

self.setActionHandler('setVolume', async (params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await setVolume({ accessToken, volumePercent: params.volumePercent });
});

self.setActionHandler('toggleShuffle', async (params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await toggleShuffle({ accessToken, state: params.state });
});

self.setActionHandler('toggleRepeat', async (params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await toggleRepeat({ accessToken, state: params.state });
});

self.setActionHandler('getQueue', async (_params: any) => {
    const accessToken = getStoredAccessToken();
    if (!accessToken) {
        throw new Error('No access token available');
    }
    return await getQueue({ accessToken });
});

// Initialize the application
async function initializeApp() {
    try {
        const accessToken = await handleAuthentication();
        if (!accessToken) {
            console.error('Failed to get access token');
            return;
        }

        // Start updating playback state
        startPlaybackUpdates(accessToken);
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Start authentication and initialize the app
initializeApp();

// UI Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    // Playback Controls
    const playPauseBtn = document.getElementById('playPauseBtn');
    const previousBtn = document.getElementById('previousBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
    const volumeBtn = document.getElementById('volumeBtn');
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const searchTab = document.getElementById('searchTab');
    const playlistTab = document.getElementById('playlistTab');
    const recentlyPlayedTab = document.getElementById('recentlyPlayedTab');

    // Create a closure for updatePlaybackState that captures the current access token
    const createUpdatePlaybackState = () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return null;
        }

        return async () => {
            try {
                const state = await getCurrentPlaybackState({ accessToken });
                if (state) {
                    updateNowPlayingUI(state);
                }
            } catch (error) {
                console.error('Error updating playback state:', error);
            }
        };
    };

    // Play/Pause button
    playPauseBtn?.addEventListener('click', async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        try {
            const state = await getCurrentPlaybackState({ accessToken });
            if (!state) {
                console.log('No active playback state');
                return;
            }
            
            if (state.is_playing) {
                await pausePlayback({ accessToken });
            } else {
                await resumePlayback({ accessToken });
            }
            const updateFn = createUpdatePlaybackState();
            if (updateFn) updateFn();
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    });

    // Previous button
    previousBtn?.addEventListener('click', async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        try {
            await skipToPrevious({ accessToken });
            const updateFn = createUpdatePlaybackState();
            if (updateFn) updateFn();
        } catch (error) {
            console.error('Error skipping to previous track:', error);
        }
    });

    // Next button
    nextBtn?.addEventListener('click', async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        try {
            await skipToNext({ accessToken });
            const updateFn = createUpdatePlaybackState();
            if (updateFn) updateFn();
        } catch (error) {
            console.error('Error skipping to next track:', error);
        }
    });

    // Volume control
    volumeBtn?.addEventListener('click', async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        try {
            const volume = parseInt(volumeInput.value);
            await setVolume({ accessToken, volumePercent: volume });
        } catch (error) {
            console.error('Error setting volume:', error);
        }
    });

    // Search functionality
    searchInput?.addEventListener('input', async (e) => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        const query = (e.target as HTMLInputElement).value;
        if (query.length > 2) {
            try {
                const [tracks, albums] = await Promise.all([
                    searchTracks({ accessToken, query }),
                    searchAlbums({ accessToken, query })
                ]);
                displaySearchResults({ tracks, albums });
            } catch (error) {
                console.error('Error searching:', error);
                console.error('Error searching tracks:', error);
            }
        }
    });

    // Tab switching
    searchTab?.addEventListener('click', () => {
        searchTab.classList.add('active');
        playlistTab?.classList.remove('active');
        recentlyPlayedTab?.classList.remove('active');
        // Show search results
    });

    playlistTab?.addEventListener('click', async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        playlistTab.classList.add('active');
        searchTab?.classList.remove('active');
        recentlyPlayedTab?.classList.remove('active');
        try {
            const playlists = await getPlaylists({ accessToken });
            displayPlaylists(playlists);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    });

    recentlyPlayedTab?.addEventListener('click', async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        recentlyPlayedTab.classList.add('active');
        searchTab?.classList.remove('active');
        playlistTab?.classList.remove('active');
        try {
            const recentlyPlayed = await getRecentlyPlayed({ accessToken });
            displayRecentlyPlayed(recentlyPlayed);
        } catch (error) {
            console.error('Error fetching recently played:', error);
        }
    });

    // Shuffle button
    shuffleBtn?.addEventListener('click', async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        try {
            const state = await getCurrentPlaybackState({ accessToken });
            if (!state) {
                console.log('No active playback state');
                return;
            }
            
            await toggleShuffle({ accessToken, state: !state.shuffle_state });
            const updateFn = createUpdatePlaybackState();
            if (updateFn) updateFn();
        } catch (error) {
            console.error('Error toggling shuffle:', error);
        }
    });

    // Repeat button
    repeatBtn?.addEventListener('click', async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        try {
            const state = await getCurrentPlaybackState({ accessToken });
            if (!state) {
                console.log('No active playback state');
                return;
            }
            
            let nextState: 'off' | 'track' | 'context';
            
            switch (state.repeat_state) {
                case 'off':
                    nextState = 'context';
                    break;
                case 'context':
                    nextState = 'track';
                    break;
                case 'track':
                    nextState = 'off';
                    break;
                default:
                    nextState = 'off';
            }

            await toggleRepeat({ accessToken, state: nextState });
            const updateFn = createUpdatePlaybackState();
            if (updateFn) updateFn();
        } catch (error) {
            console.error('Error toggling repeat:', error);
        }
    });
});

// Start updating playback state
function startPlaybackUpdates(accessToken: string) {
    const updatePlaybackState = async () => {
        try {
            const currentToken = getStoredAccessToken();
            if (!currentToken) {
                console.log('Access token expired or not available, re-authenticating...');
                const newToken = await handleAuthentication();
                if (!newToken) {
                    console.error('Failed to re-authenticate');
                    updateNowPlayingUI(null);
                    return;
                }
            }

            const state = await getCurrentPlaybackState({ accessToken: currentToken || accessToken });
            updateNowPlayingUI(state ?? null);
        } catch (error) {
            console.error('Error updating playback state:', error);
            if (error instanceof Error && error.message.includes('401')) {
                // Token expired, try to re-authenticate
                console.log('Token expired, re-authenticating...');
                const newToken = await handleAuthentication();
                if (newToken) {
                    // Retry the update with the new token
                    const state = await getCurrentPlaybackState({ accessToken: newToken });
                    updateNowPlayingUI(state ?? null);
                } else {
                    updateNowPlayingUI(null);
                }
            } else {
                updateNowPlayingUI(null);
            }
        }
    };

    // Initial update
    updatePlaybackState();
    // Update every second
    setInterval(updatePlaybackState, 1000);
}

// UI Update Functions
function updateNowPlayingUI(state: PlaybackState | null) {
    const nowPlayingArt = document.getElementById('nowPlayingArt');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nowPlayingArtist = document.getElementById('nowPlayingArtist');
    const progressBar = document.getElementById('progressBar');
    const currentTime = document.getElementById('currentTime');
    const totalTime = document.getElementById('totalTime');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const playlistName = document.getElementById('playlistName');
    const nextTrack = document.getElementById('nextTrack');

    // Clear UI when no state is available
    if (!state || !state.item) {
        if (nowPlayingArt) nowPlayingArt.setAttribute('src', '');
        if (nowPlayingTitle) nowPlayingTitle.textContent = 'No track playing';
        if (nowPlayingArtist) nowPlayingArtist.textContent = '';
        if (progressBar) progressBar.style.width = '0%';
        if (currentTime) currentTime.textContent = '0:00';
        if (totalTime) totalTime.textContent = '0:00';
        if (playPauseBtn) playPauseBtn.textContent = '▶️';
        if (shuffleBtn) shuffleBtn.classList.remove('active');
        if (repeatBtn) repeatBtn.setAttribute('data-state', 'off');
        if (playlistName) playlistName.textContent = '';
        if (nextTrack) nextTrack.textContent = '-';
        return;
    }

    // At this point, we know state and state.item are not null
    const { item, progress_ms, is_playing, shuffle_state, repeat_state, context } = state;

    if (nowPlayingArt) nowPlayingArt.setAttribute('src', item.album.images[0].url);
    if (nowPlayingTitle) nowPlayingTitle.textContent = item.name;
    if (nowPlayingArtist) nowPlayingArtist.textContent = item.artists.map((a: any) => a.name).join(', ');
    if (progressBar) progressBar.style.width = `${(progress_ms / item.duration_ms) * 100}%`;
    if (currentTime) currentTime.textContent = formatTime(progress_ms);
    if (totalTime) totalTime.textContent = formatTime(item.duration_ms);
    if (playPauseBtn) playPauseBtn.textContent = is_playing ? '⏸️' : '▶️';
    if (shuffleBtn) shuffleBtn.classList.toggle('active', shuffle_state);
    if (repeatBtn) repeatBtn.setAttribute('data-state', repeat_state);

    // Update context information
    if (context && playlistName) {
        const contextType = context.type;
        if (contextType === 'playlist') {
            // Fetch playlist details to get the name
            const fetchPlaylistName = async () => {
                const accessToken = getStoredAccessToken();
                if (!accessToken) return;

                try {
                    const playlistId = context.uri.split(':').pop();
                    if (!playlistId) return;
                    
                    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    
                    if (response.ok) {
                        const playlistData = await response.json();
                        playlistName.textContent = playlistData.name;
                    } else {
                        playlistName.textContent = 'Playlist';
                    }
                } catch (error) {
                    console.error('Error fetching playlist name:', error);
                    playlistName.textContent = 'Playlist';
                }
            };

            fetchPlaylistName();
        } else {
            playlistName.textContent = contextType;
        }
    }

    // Update next track information
    const updateQueueInfo = async () => {
        const accessToken = getStoredAccessToken();
        if (!accessToken) return;

        try {
            const queue = await getQueue({ accessToken });
            if (queue.queue && queue.queue.length > 0 && nextTrack) {
                const nextTrackInfo = queue.queue[0];
                nextTrack.textContent = `${nextTrackInfo.name} - ${nextTrackInfo.artists.map((a: any) => a.name).join(', ')}`;
            } else if (nextTrack) {
                nextTrack.textContent = '-';
            }
        } catch (error) {
            console.error('Error getting queue:', error);
            if (nextTrack) nextTrack.textContent = '-';
        }
    };

    updateQueueInfo();
}

function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function displaySearchResults(results: { tracks: any, albums: any }) {
    const container = document.getElementById('contentContainer');
    if (!container) return;

    const getImageUrl = (item: any) => {
        if (item.images && item.images.length > 0) {
            return item.images[0].url;
        }
        if (item.album && item.album.images && item.album.images.length > 0) {
            return item.album.images[0].url;
        }
        return 'https://via.placeholder.com/50'; // Fallback image
    };

    container.innerHTML = `
        <div class="search-section">
            <h3>Tracks</h3>
            <div class="tracks-list">
                ${results.tracks?.items?.map((track: any) => `
                    <div class="content-card track-item" data-uri="${track.uri}">
                        <img src="${getImageUrl(track)}" alt="${track.name}">
                        <div class="track-info">
                            <h4>${track.name}</h4>
                            <p>${track.artists.map((a: any) => a.name).join(', ')}</p>
                        </div>
                    </div>
                `).join('') || '<p>No tracks found</p>'}
            </div>
        </div>
        <div class="search-section">
            <h3>Albums</h3>
            <div class="albums-list">
                ${results.albums?.items?.map((album: any) => `
                    <div class="content-card album-item" data-uri="${album.uri}">
                        <img src="${getImageUrl(album)}" alt="${album.name}">
                        <div class="album-info">
                            <h4>${album.name}</h4>
                            <p>${album.artists.map((a: any) => a.name).join(', ')}</p>
                        </div>
                    </div>
                `).join('') || '<p>No albums found</p>'}
            </div>
        </div>
    `;

    // Add click handlers to tracks
    const trackItems = container.querySelectorAll('.track-item');
    trackItems.forEach(track => {
        track.addEventListener('click', async () => {
            const uri = track.getAttribute('data-uri');
            if (uri) {
                try {
                    const accessToken = getStoredAccessToken();
                    if (accessToken) {
                        await playTrack({ accessToken, trackUri: uri });
                        // Update the UI to show the currently playing track
                        trackItems.forEach(t => t.classList.remove('playing'));
                        track.classList.add('playing');
                    }
                } catch (error) {
                    console.error('Error playing track:', error);
                }
            }
        });
    });

    // Add click handlers to albums
    const albumItems = container.querySelectorAll('.album-item');
    albumItems.forEach(album => {
        album.addEventListener('click', async () => {
            const uri = album.getAttribute('data-uri');
            if (uri) {
                try {
                    const accessToken = getStoredAccessToken();
                    if (accessToken) {
                        await playTrack({ 
                            accessToken, 
                            trackUri: uri,
                            contextUri: uri // Play the album as context
                        });
                    }
                } catch (error) {
                    console.error('Error playing album:', error);
                }
            }
        });
    });
}

function displayPlaylists(playlists: any) {
    const container = document.getElementById('contentContainer');
    if (!container) return;

    container.innerHTML = '';
    playlists.items.forEach((playlist: any) => {
        const card = document.createElement('div');
        card.className = 'content-card';
        
        // Add fallback for playlists without images
        const imageUrl = playlist.images && playlist.images.length > 0 
            ? playlist.images[0].url 
            : 'https://via.placeholder.com/150?text=No+Image';
            
        card.innerHTML = `
            <img src="${imageUrl}" alt="${playlist.name}">
            <h3>${playlist.name}</h3>
            <p>${playlist.tracks.total} tracks</p>
        `;
        card.addEventListener('click', async () => {
            try {
                const accessToken = getStoredAccessToken();
                if (!accessToken) return;

                // Show loading state
                container.innerHTML = '<div class="loading">Loading tracks...</div>';

                // Fetch playlist tracks
                const tracks = await getPlaylistTracks({ 
                    accessToken, 
                    playlistId: playlist.id 
                });

                // Display tracks in the same scrollable container
                container.innerHTML = `
                    <div class="content-card playlist-header">
                        <img src="${imageUrl}" alt="${playlist.name}">
                        <h3>${playlist.name}</h3>
                        <p>${playlist.tracks.total} tracks</p>
                    </div>
                    <div class="content-card back-button" id="backToPlaylists">
                        <span>← Back to Playlists</span>
                    </div>
                    ${tracks.items.map((item: any, _index: number) => {
                        // Add fallback for tracks without album images
                        const trackImageUrl = item.track.album.images && item.track.album.images.length > 0
                            ? item.track.album.images[0].url
                            : 'https://via.placeholder.com/50?text=No+Image';
                            
                        return `
                            <div class="content-card track-item" data-uri="${item.track.uri}">
                                <img src="${trackImageUrl}" alt="${item.track.name}">
                                <div class="track-info">
                                    <h4>${item.track.name}</h4>
                                    <p>${item.track.artists.map((a: any) => a.name).join(', ')}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                `;

                // Add back button handler
                const backButton = document.getElementById('backToPlaylists');
                if (backButton) {
                    backButton.addEventListener('click', async () => {
                        try {
                            const playlists = await getPlaylists({ accessToken });
                            displayPlaylists(playlists);
                        } catch (error) {
                            console.error('Error fetching playlists:', error);
                        }
                    });
                }

                // Add click handlers to tracks
                const trackItems = container.querySelectorAll('.track-item');
                trackItems.forEach(track => {
                    track.addEventListener('click', async () => {
                        const uri = track.getAttribute('data-uri');
                        if (uri) {
                            try {
                                await playTrack({ 
                                    accessToken, 
                                    trackUri: uri,
                                    contextUri: `spotify:playlist:${playlist.id}`
                                });
                                // Update the UI to show the currently playing track
                                trackItems.forEach(t => t.classList.remove('playing'));
                                track.classList.add('playing');
                            } catch (error) {
                                console.error('Error playing track:', error);
                            }
                        }
                    });
                });
            } catch (error) {
                console.error('Error loading playlist tracks:', error);
                container.innerHTML = '<div class="error">Failed to load tracks</div>';
            }
        });
        container.appendChild(card);
    });
}

function displayRecentlyPlayed(recentlyPlayed: any) {
    const container = document.getElementById('contentContainer');
    if (!container) return;

    container.innerHTML = '';
    recentlyPlayed.items.forEach((item: any) => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.innerHTML = `
            <img src="${item.track.album.images[0].url}" alt="${item.track.name}">
            <h3>${item.track.name}</h3>
            <p>${item.track.artists.map((a: any) => a.name).join(', ')}</p>
        `;
        card.addEventListener('click', () => {
            const accessToken = getStoredAccessToken();
            if (accessToken) {
                playTrack({ accessToken, trackUri: item.track.uri });
            }
        });
        container.appendChild(card);
    });
}

// Add this function after the getPlaylists function
async function getPlaylistTracks({ accessToken, playlistId }: { accessToken: string, playlistId: string }) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch playlist tracks');
    }
    return response.json();
}