// Because this is a literal single page application
// we detect a callback from Spotify by checking for the hash fragment
import { redirectToAuthCodeFlow, getAccessToken } from "./authCodeWithPkce";

interface UserProfile {
    display_name: string;
    email: string;
    id: string;
    uri: string;
    external_urls: {
        spotify: string;
    };
    href: string;
    images: Array<{
        url: string;
    }>;
}

interface SearchResults {
    tracks: {
        items: Track[];
    };
    albums: {
        items: Album[];
    };
}

interface PlaybackState {
    is_playing: boolean;
    device: {
        name: string;
        volume_percent: number;
        supports_volume: boolean;
    } | null;
    progress_ms: number;
    item: {
        name: string;
        duration_ms: number;
        artists: Array<{ name: string }>;
        album: {
            name: string;
            images: Array<{ url: string }>;
        };
    } | null;
    context: {
        type: string;
        href: string;
        uri: string;
        external_urls: {
            spotify: string;
        };
    } | null;
    shuffle_state: boolean;
    repeat_state: 'off' | 'track' | 'context';
}

interface PlaylistItem {
    id: string;
    name: string;
    description: string;
    images: Array<{ url: string }>;
    tracks: {
        total: number;
        items: Array<{
            track: Track;
        }>;
    };
    owner: {
        display_name: string;
    };
}

interface PlaylistResponse {
    items: PlaylistItem[];
}

interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
    duration_ms: number;
    uri: string;
}

interface Album {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
    uri: string;
}

interface RecentlyPlayedItem {
    track: Track;
    played_at: string;
    context: {
        type: string;
        uri: string;
    } | null;
}

interface RecentlyPlayedResponse {
    items: RecentlyPlayedItem[];
}

const clientId = "4e9b9eeca37441839b3305512f084064";

// Store access token globally
let globalAccessToken: string | null = null;

// Get DOM elements
const authPage = document.getElementById('authPage');
const appContent = document.getElementById('appContent');
const authButton = document.getElementById('authButton');

// Initialize the app
async function initializeApp() {
    // Check if we have a code in the URL (callback from Spotify)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
        // We're in the callback phase, handle authentication
        try {
            console.log('Code found, getting access token...');
            const accessToken = await getAccessToken(clientId, code);
            
            if (!accessToken) {
                throw new Error('Failed to get access token');
            }
            
            // Store the access token globally
            globalAccessToken = accessToken;
            
            // Show the main app content
            if (authPage) authPage.style.display = 'none';
            if (appContent) appContent.style.display = 'block';
            
            console.log('Access token received, fetching profile...');
            const profile = await fetchProfile(accessToken);
            console.log('Profile fetched successfully:', profile);
            populateUI(profile);
            
            // Initialize event listeners after successful authentication
            initializeEventListeners();
        } catch (error) {
            console.error('Error during authentication:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
                console.error('Stack trace:', error.stack);
                
                // Check if the error is due to an expired authorization code
                if (error.message.includes('invalid_grant') || error.message.includes('Authorization code expired')) {
                    console.log('Authorization code expired, redirecting to auth flow...');
                    redirectToAuthCodeFlow(clientId);
                    return;
                }
            }
            const displayName = document.getElementById("displayName");
            if (displayName) {
                displayName.innerText = "Error loading profile. Please check console for details.";
            }
        }
    } else {
        // We're on the initial page, show the auth button
        if (authButton) {
            authButton.addEventListener('click', () => {
                redirectToAuthCodeFlow(clientId);
            });
        }
    }
}

// Start the app
initializeApp();

async function fetchProfile(token: string): Promise<UserProfile> {
    console.log('Fetching profile with token:', token.substring(0, 10) + '...');
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", 
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!result.ok) {
        const errorText = await result.text();
        console.error('Profile fetch failed:', {
            status: result.status,
            statusText: result.statusText,
            response: errorText
        });
        throw new Error(`Failed to fetch profile: ${result.status} ${result.statusText}\n${errorText}`);
    }

    const profile = await result.json();
    console.log('Profile data received:', profile);
    return profile;
}

function populateUI(profile: UserProfile) {
    const displayName = document.getElementById("displayName");
    const avatar = document.getElementById("avatar");
    const email = document.getElementById("email");
    const uri = document.getElementById("uri");
    const url = document.getElementById("url");
    const imgUrl = document.getElementById("imgUrl");

    if (displayName) displayName.innerText = profile.display_name || "Unknown User";
    if (avatar && profile.images?.[0]?.url) avatar.setAttribute("src", profile.images[0].url);
    if (email) email.innerText = profile.email || "No email available";
    if (uri) {
        uri.innerText = profile.uri || "No URI available";
        if (profile.external_urls?.spotify) {
            uri.setAttribute("href", profile.external_urls.spotify);
        }
    }
    if (url) {
        url.innerText = profile.href || "No URL available";
        if (profile.href) {
            url.setAttribute("href", profile.href);
        }
    }
    if (imgUrl && profile.images?.[0]?.url) imgUrl.innerText = profile.images[0].url;
}

function initializeEventListeners() {
    if (!globalAccessToken) {
        console.error('No access token available');
        return;
    }

    // Set initial volume
    const setInitialVolume = async () => {
        try {
            const state = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
            if (state.device) {
                const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
                if (volumeInput) {
                    volumeInput.value = state.device.volume_percent.toString();
                    console.log('Initial volume set to:', state.device.volume_percent);
                }
            }
        } catch (error) {
            console.error('Error setting initial volume:', error);
        }
    };

    // Call it immediately and also after a short delay to ensure we get the state
    setInitialVolume();
    setTimeout(setInitialVolume, 2000);

    // Playback Controls
    document.getElementById('playPauseBtn')?.addEventListener('click', async () => {
        try {
            const state = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
            if (state.is_playing) {
                await pausePlayback({ accessToken: globalAccessToken! });
            } else {
                await resumePlayback({ accessToken: globalAccessToken! });
            }
            // Update UI after a short delay to allow the state to change
            setTimeout(async () => {
                const newState = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
                updateNowPlayingUI(newState);
            }, 500);
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', async () => {
        await skipToNext({ accessToken: globalAccessToken! });
        updateNowPlayingUI(await getCurrentPlaybackState({ accessToken: globalAccessToken! }));
    });

    document.getElementById('previousBtn')?.addEventListener('click', async () => {
        await skipToPrevious({ accessToken: globalAccessToken! });
        updateNowPlayingUI(await getCurrentPlaybackState({ accessToken: globalAccessToken! }));
    });

    // Volume Control
    const volumeInput = document.getElementById('volumeInput') as HTMLInputElement;
    let volumeTimeout: NodeJS.Timeout;

    const updateVolume = async () => {
        try {
            const volumePercent = parseInt(volumeInput.value);
            if (isNaN(volumePercent)) {
                console.error('Invalid volume value');
                return;
            }

            // Get current device state
            const state = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
            if (!state.device) {
                console.error('No active device found');
                return;
            }

            if (!state.device.supports_volume) {
                console.log('Device does not support volume control');
                return;
            }

            await setVolume({ accessToken: globalAccessToken!, volumePercent });
            console.log('Volume set to:', volumePercent);
        } catch (error) {
            console.error('Error setting volume:', error);
        }
    };

    volumeInput.addEventListener('input', () => {
        clearTimeout(volumeTimeout);
        volumeTimeout = setTimeout(updateVolume, 300);
    });

    volumeInput.addEventListener('change', updateVolume);

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchTab = document.getElementById('searchTab');

    if (searchInput && searchTab) {
        let searchTimeout: NodeJS.Timeout;

        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = (searchInput as HTMLInputElement).value.trim();
                if (query.length < 2) return;

                try {
                    showLoading(true);
                    const results = await searchTracks({ accessToken: globalAccessToken!, query });
                    displaySearchResults(results);
                    searchTab.classList.add('active');
                    document.getElementById('playlistTab')?.classList.remove('active');
                    document.getElementById('recentlyPlayedTab')?.classList.remove('active');
                } catch (error) {
                    console.error('Error searching:', error);
                    const container = document.getElementById('contentContainer');
                    if (container) {
                        showEmptyState(container, 'Failed to load search results');
                    }
                } finally {
                    showLoading(false);
                }
            }, 500);
        });
    }

    // Auto-update now playing
    setInterval(async () => {
        if (globalAccessToken) {
            const state = await getCurrentPlaybackState({ accessToken: globalAccessToken });
            updateNowPlayingUI(state);
        }
    }, 1000);

    // Shuffle Control
    document.getElementById('shuffleBtn')?.addEventListener('click', async () => {
        try {
            const state = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
            await toggleShuffle({ 
                accessToken: globalAccessToken!, 
                state: !state.shuffle_state 
            });
            // Update UI after a short delay
            setTimeout(async () => {
                const newState = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
                updateNowPlayingUI(newState);
            }, 500);
        } catch (error) {
            console.error('Error toggling shuffle:', error);
        }
    });

    // Repeat Control
    document.getElementById('repeatBtn')?.addEventListener('click', async () => {
        try {
            const state = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
            let newRepeatState: 'off' | 'track' | 'context';
            
            // Cycle through repeat states: off -> context -> track -> off
            switch (state.repeat_state) {
                case 'off':
                    newRepeatState = 'context';
                    break;
                case 'context':
                    newRepeatState = 'track';
                    break;
                case 'track':
                    newRepeatState = 'off';
                    break;
                default:
                    newRepeatState = 'off';
            }
            
            await setRepeat({ 
                accessToken: globalAccessToken!, 
                state: newRepeatState 
            });
            
            // Update UI after a short delay
            setTimeout(async () => {
                const newState = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
                updateNowPlayingUI(newState);
            }, 500);
        } catch (error) {
            console.error('Error setting repeat:', error);
        }
    });

    // Playlist and Recently Played Tabs
    const playlistTab = document.getElementById('playlistTab');
    const recentlyPlayedTab = document.getElementById('recentlyPlayedTab');
    const contentContainer = document.getElementById('contentContainer');

    if (playlistTab && recentlyPlayedTab && contentContainer) {
        playlistTab.addEventListener('click', async () => {
            try {
                showLoading(true);
                const playlists = await getPlaylists({ accessToken: globalAccessToken! });
                displayPlaylists(playlists);
                playlistTab.classList.add('active');
                recentlyPlayedTab.classList.remove('active');
            } catch (error) {
                console.error('Error fetching playlists:', error);
                showEmptyState(contentContainer, 'Failed to load playlists');
            } finally {
                showLoading(false);
            }
        });

        recentlyPlayedTab.addEventListener('click', async () => {
            try {
                showLoading(true);
                const recentlyPlayed = await getRecentlyPlayed({ accessToken: globalAccessToken! });
                displayRecentlyPlayed(recentlyPlayed);
                recentlyPlayedTab.classList.add('active');
                playlistTab.classList.remove('active');
            } catch (error) {
                console.error('Error fetching recently played:', error);
                showEmptyState(contentContainer, 'Failed to load recently played tracks');
            } finally {
                showLoading(false);
            }
        });
    }
}

function updateNowPlayingUI(state: PlaybackState) {
    const nowPlayingTitle = document.getElementById("nowPlayingTitle");
    const nowPlayingArtist = document.getElementById("nowPlayingArtist");
    const nowPlayingArt = document.getElementById("nowPlayingArt") as HTMLImageElement;
    const progressBar = document.getElementById("progressBar");
    const currentTime = document.getElementById("currentTime");
    const totalTime = document.getElementById("totalTime");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const playlistName = document.getElementById("playlistName");
    const nextTrack = document.getElementById("nextTrack");

    if (state.item) {
        if (nowPlayingTitle) nowPlayingTitle.innerText = state.item.name;
        if (nowPlayingArtist) nowPlayingArtist.innerText = state.item.artists.map(artist => artist.name).join(", ");
        if (nowPlayingArt && state.item.album.images[0]) nowPlayingArt.src = state.item.album.images[0].url;
        if (progressBar) progressBar.style.width = `${(state.progress_ms / state.item.duration_ms) * 100}%`;
        if (currentTime) currentTime.innerText = formatTime(state.progress_ms);
        if (totalTime) totalTime.innerText = formatTime(state.item.duration_ms);
        if (playPauseBtn) playPauseBtn.innerText = state.is_playing ? "⏸️" : "▶️";

        // Update playlist and queue info
        if (state.context) {
            if (state.context.type === 'playlist') {
                // Extract playlist name from URI
                const playlistId = state.context.uri.split(':').pop();
                if (playlistId) {
                    fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                        headers: {
                            Authorization: `Bearer ${globalAccessToken}`,
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(playlist => {
                        if (playlistName) playlistName.innerText = playlist.name;
                    })
                    .catch(error => console.error('Error fetching playlist:', error));
                }
            } else {
                if (playlistName) playlistName.innerText = state.context.type;
            }
        } else {
            if (playlistName) playlistName.innerText = "Not playing from playlist";
        }

        // Get next track in queue
        if (globalAccessToken) {
            getQueueInfo(globalAccessToken)
                .then(queue => {
                    if (queue && queue.queue && queue.queue.length > 0) {
                        const nextTrackInfo = queue.queue[0];
                        if (nextTrack) {
                            nextTrack.innerText = `${nextTrackInfo.name} - ${nextTrackInfo.artists.map((artist: { name: string }) => artist.name).join(", ")}`;
                        }
                    } else {
                        if (nextTrack) nextTrack.innerText = "No upcoming tracks";
                    }
                })
                .catch(error => console.error('Error getting queue:', error));
        }
    } else {
        if (nowPlayingTitle) nowPlayingTitle.innerText = "No track playing";
        if (nowPlayingArtist) nowPlayingArtist.innerText = "";
        if (nowPlayingArt) nowPlayingArt.src = "#";
        if (progressBar) progressBar.style.width = "0%";
        if (currentTime) currentTime.innerText = "0:00";
        if (totalTime) totalTime.innerText = "0:00";
        if (playPauseBtn) playPauseBtn.innerText = "▶️";
        if (playlistName) playlistName.innerText = "-";
        if (nextTrack) nextTrack.innerText = "-";
    }

    // Update shuffle and repeat buttons
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');

    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', state.shuffle_state);
        shuffleBtn.setAttribute('data-state', state.shuffle_state ? 'on' : 'off');
    }

    if (repeatBtn) {
        repeatBtn.setAttribute('data-state', state.repeat_state);
    }
}

function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function createTrackCard(track: Track): HTMLElement {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.innerHTML = `
        <img src="${track.album.images[0]?.url || '#'}" alt="${track.name}" />
        <h3>${track.name}</h3>
        <p>${track.artists.map(a => a.name).join(', ')}</p>
        <p>${track.album.name}</p>
    `;
    card.addEventListener('click', () => playTrack({ accessToken: globalAccessToken!, trackUri: track.uri }));
    return card;
}

function createPlaylistCard(playlist: PlaylistItem): HTMLElement {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    // Use the first image if available, otherwise use a default image
    const imageUrl = playlist.images?.[0]?.url || 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${playlist.name}" />
        <h3>${playlist.name}</h3>
        <p>${playlist.tracks.total} tracks</p>
        <p>By ${playlist.owner.display_name}</p>
    `;
    return card;
}

function showLoading(show: boolean) {
    const spinner = document.querySelector('.loading-spinner') as HTMLElement;
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showEmptyState(container: HTMLElement, message: string) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function displaySearchResults(results: SearchResults) {
    const container = document.getElementById('contentContainer');
    if (!container) return;

    container.innerHTML = '';
    container.style.maxHeight = '500px';
    container.style.overflowY = 'auto';

    if (!results.tracks.items.length && !results.albums.items.length) {
        showEmptyState(container, 'No results found');
        return;
    }

    // Display tracks
    if (results.tracks.items.length > 0) {
        const tracksHeader = document.createElement('h2');
        tracksHeader.style.margin = '20px 0 10px 0';
        tracksHeader.textContent = 'Tracks';
        container.appendChild(tracksHeader);

        results.tracks.items.forEach(track => {
            const card = createTrackCard(track);
            card.addEventListener('click', async () => {
                try {
                    await playTrack({ accessToken: globalAccessToken!, trackUri: track.uri });
                    const state = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
                    updateNowPlayingUI(state);
                } catch (error) {
                    console.error('Error playing track:', error);
                }
            });
            container.appendChild(card);
        });
    }

    // Display albums
    if (results.albums.items.length > 0) {
        const albumsHeader = document.createElement('h2');
        albumsHeader.style.margin = '20px 0 10px 0';
        albumsHeader.textContent = 'Albums';
        container.appendChild(albumsHeader);

        results.albums.items.forEach(album => {
            const card = createAlbumCard(album);
            container.appendChild(card);
        });
    }
}

function createAlbumCard(album: Album): HTMLElement {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    const imageUrl = album.images[0]?.url || 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${album.name}" />
        <h3>${album.name}</h3>
        <p>${album.artists.map(artist => artist.name).join(', ')}</p>
    `;
    return card;
}

function displayPlaylists(playlists: PlaylistResponse) {
    const container = document.getElementById('contentContainer');
    if (!container) return;

    container.innerHTML = '';
    container.style.maxHeight = '500px';
    container.style.overflowY = 'auto';

    const playlistItems = playlists.items || [];
    
    if (playlistItems.length === 0) {
        showEmptyState(container, 'No playlists found');
        return;
    }

    playlistItems.forEach(playlist => {
        const card = createPlaylistCard(playlist);
        card.addEventListener('click', async () => {
            try {
                showLoading(true);
                const playlistDetails = await getPlaylistDetails(playlist.id);
                displayPlaylistSongs(playlistDetails);
            } catch (error) {
                console.error('Error fetching playlist details:', error);
                showEmptyState(container, 'Failed to load playlist songs');
            } finally {
                showLoading(false);
            }
        });
        container.appendChild(card);
    });
}

function displayPlaylistSongs(playlist: PlaylistItem) {
    const container = document.getElementById('contentContainer');
    if (!container) return;

    container.innerHTML = '';
    container.style.maxHeight = '500px';
    container.style.overflowY = 'auto';

    // Add back button
    const backButton = document.createElement('button');
    backButton.textContent = '← Back to Playlists';
    backButton.style.marginBottom = '20px';
    backButton.style.padding = '8px 16px';
    backButton.style.borderRadius = '20px';
    backButton.style.backgroundColor = 'var(--tertiary-color)';
    backButton.style.color = 'var(--text-color)';
    backButton.style.border = 'none';
    backButton.style.cursor = 'pointer';
    backButton.addEventListener('click', async () => {
        try {
            showLoading(true);
            const playlists = await getPlaylists({ accessToken: globalAccessToken! });
            displayPlaylists(playlists);
        } catch (error) {
            console.error('Error going back to playlists:', error);
        } finally {
            showLoading(false);
        }
    });
    container.appendChild(backButton);

    // Add playlist header
    const header = document.createElement('div');
    header.style.marginBottom = '20px';
    header.innerHTML = `
        <h2 style="margin: 0 0 10px 0;">${playlist.name}</h2>
        <p style="color: #b3b3b3; margin: 0;">${playlist.description || 'No description'}</p>
    `;
    container.appendChild(header);

    // Display songs
    if (!playlist.tracks.items || playlist.tracks.items.length === 0) {
        showEmptyState(container, 'No songs in this playlist');
        return;
    }

    playlist.tracks.items.forEach(item => {
        if (!item.track) return;
        
        const songCard = createTrackCard(item.track);
        songCard.addEventListener('click', async () => {
            try {
                await playTrack({ 
                    accessToken: globalAccessToken!, 
                    trackUri: item.track.uri,
                    contextUri: `spotify:playlist:${playlist.id}`
                });
                const state = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
                updateNowPlayingUI(state);
            } catch (error) {
                console.error('Error playing track:', error);
            }
        });
        container.appendChild(songCard);
    });
}

async function getPlaylistDetails(playlistId: string): Promise<PlaylistItem> {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
            Authorization: `Bearer ${globalAccessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch playlist details: ${response.status}`);
    }

    return await response.json();
}

function displayRecentlyPlayed(tracks: RecentlyPlayedResponse) {
    const container = document.getElementById('contentContainer');
    if (!container) return;

    container.innerHTML = '';
    container.style.maxHeight = '500px';
    container.style.overflowY = 'auto';

    if (!tracks.items || tracks.items.length === 0) {
        showEmptyState(container, 'No recently played tracks');
        return;
    }

    // Add header
    const header = document.createElement('h2');
    header.style.margin = '0 0 20px 0';
    header.textContent = 'Recently Played';
    container.appendChild(header);

    tracks.items.forEach(item => {
        const card = createTrackCard(item.track);
        card.addEventListener('click', async () => {
            try {
                // If the track was played from a playlist, use that context
                const contextUri = item.context?.type === 'playlist' ? item.context.uri : undefined;
                await playTrack({ 
                    accessToken: globalAccessToken!, 
                    trackUri: item.track.uri,
                    contextUri
                });
                const state = await getCurrentPlaybackState({ accessToken: globalAccessToken! });
                updateNowPlayingUI(state);
            } catch (error) {
                console.error('Error playing track:', error);
            }
        });
        container.appendChild(card);
    });
}

// Export the action handlers
export const getCurrentPlaybackState = async ({ accessToken }: GetCurrentPlaybackStateParams) => {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 204) {
            return { is_playing: false, device: null };
        }

        if (!response.ok) {
            throw new Error(`Failed to get playback state: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting playback state:', error);
        throw error;
    }
};

export const playTrack = async ({ accessToken, trackUri, contextUri }: { accessToken: string; trackUri: string; contextUri?: string }) => {
    const body: any = {};

    if (contextUri) {
        // When playing from a playlist context, we need to:
        // 1. Set the context_uri to the playlist
        // 2. Set the offset to the track's position
        body.context_uri = contextUri;
        const playlistId = contextUri.split(':').pop();
        if (playlistId) {
            const playlist = await getPlaylistDetails(playlistId);
            const trackIndex = playlist.tracks.items.findIndex(item => item.track.uri === trackUri);
            if (trackIndex !== -1) {
                body.offset = { position: trackIndex };
            }
        }
    } else {
        // When playing a single track without context
        body.uris = [trackUri];
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
        const errorText = await response.text();
        console.error('Error playing track:', errorText);
        throw new Error(`Failed to play track: ${response.status} - ${errorText}`);
    }
};

export const pausePlayback = async ({ accessToken }: { accessToken: string }) => {
    await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
};

export const resumePlayback = async ({ accessToken }: { accessToken: string }) => {
    await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
};

export const skipToNext = async ({ accessToken }: { accessToken: string }) => {
    await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
};

export const skipToPrevious = async ({ accessToken }: { accessToken: string }) => {
    await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
};

export const getPlaylists = async ({ accessToken }: { accessToken: string }) => {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return await response.json();
};

export const searchTracks = async ({ accessToken, query }: { accessToken: string; query: string }) => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album&limit=10`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to search: ${response.status}`);
    }

    return await response.json();
};

export const getRecentlyPlayed = async ({ accessToken }: { accessToken: string }): Promise<RecentlyPlayedResponse> => {
    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get recently played: ${response.status}`);
    }

    return await response.json();
};

export const setVolume = async ({ accessToken, volumePercent }: SetVolumeParams) => {
    try {
        // Ensure volume is within valid range
        const validVolume = Math.max(0, Math.min(100, volumePercent));
        
        // First get the current device state
        const state = await getCurrentPlaybackState({ accessToken });
        if (!state.device) {
            throw new Error('No active device found');
        }

        if (!state.device.supports_volume) {
            throw new Error('Device does not support volume control');
        }

        const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${validVolume}&device_id=${state.device.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Volume error response:', errorText);
            throw new Error(`Failed to set volume: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('Error setting volume:', error);
        throw error;
    }
};

async function getQueueInfo(accessToken: string) {
    try {
        const response = await fetch("https://api.spotify.com/v1/me/player/queue", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get queue: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting queue:', error);
        return null;
    }
}

export const toggleShuffle = async ({ accessToken, state }: { accessToken: string; state: boolean }) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${state}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to toggle shuffle: ${response.status}`);
        }
    } catch (error) {
        console.error('Error toggling shuffle:', error);
        throw error;
    }
};

export const setRepeat = async ({ accessToken, state }: { accessToken: string; state: 'off' | 'track' | 'context' }) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${state}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to set repeat: ${response.status}`);
        }
    } catch (error) {
        console.error('Error setting repeat:', error);
        throw error;
    }
};