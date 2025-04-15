import React, { useState, useEffect } from 'react';
import SearchBrowse from './SearchBrowse';
import ContentTabs from './ContentTabs';

const defaultTrack = {
    name: "No track playing",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "Unknown artist" }
    ]
};

function WebPlayback(props) {
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(defaultTrack);
    const [next_track, setNextTrack] = useState(defaultTrack);
    const [shuffle_state, setShuffle] = useState(false);
    const [repeat_state, setRepeat] = useState('off');
    const [playlist_info, setPlaylistInfo] = useState(null);
    const [is_player_ready, setPlayerReady] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            if (!props.token) {
                console.error('No token available for Spotify Web Playback SDK');
                return;
            }

            // Validate token before creating player
            fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${props.token}`
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Invalid token');
                }
                return response.json();
            }).then(() => {
                const player = new window.Spotify.Player({
                    name: 'Web Playback SDK',
                    getOAuthToken: cb => { 
                        if (props.token) {
                            cb(props.token);
                        } else {
                            console.error('Token not available for playback');
                        }
                    },
                    volume: 0.5
                });

                setPlayer(player);

                player.addListener('ready', ({ device_id }) => {
                    console.log('Ready with Device ID', device_id);
                    setPlayerReady(true);
                    
                    // Transfer playback to this device
                    fetch('https://api.spotify.com/v1/me/player', {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${props.token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            device_ids: [device_id],
                            play: true
                        })
                    }).catch(error => {
                        console.error('Error transferring playback:', error);
                    });
                });

                player.addListener('not_ready', ({ device_id }) => {
                    console.log('Device ID has gone offline', device_id);
                    setPlayerReady(false);
                });

                player.addListener('initialization_error', ({ message }) => {
                    console.error('Failed to initialize:', message);
                    setPlayerReady(false);
                });

                player.addListener('authentication_error', ({ message }) => {
                    console.error('Failed to authenticate:', message);
                    setPlayerReady(false);
                });

                player.addListener('account_error', ({ message }) => {
                    console.error('Failed to validate Spotify account:', message);
                    setPlayerReady(false);
                });

                player.addListener('playback_error', ({ message }) => {
                    console.error('Playback error:', message);
                    if (message.includes('401') || message.includes('403')) {
                        console.error('Token may be expired. Please refresh the page to get a new token.');
                        setPlayerReady(false);
                    }
                });

                player.addListener('player_state_changed', (state => {
                    if (!state) {
                        console.log('No state available - player might be disconnected');
                        setActive(false);
                        return;
                    }

                    setTrack(state.track_window.current_track);
                    setNextTrack(state.track_window.next_tracks[0] || defaultTrack);
                    setPaused(state.paused);
                    setShuffle(state.shuffle);
                    setRepeat(state.repeat_mode);

                    // Only fetch playlist info if we have a valid context and the player is ready
                    if (state.context && state.context.uri && is_player_ready) {
                        const contextUri = state.context.uri;
                        if (contextUri.startsWith('spotify:playlist:')) {
                            // Extract playlist ID from URI
                            const playlistId = contextUri.split(':')[2];
                            if (playlistId) {
                                fetchPlaylistInfo(playlistId);
                            }
                        } else {
                            setPlaylistInfo(null);
                        }
                    } else {
                        setPlaylistInfo(null);
                    }

                    player.getCurrentState().then(state => {
                        (!state) ? setActive(false) : setActive(true);
                    });
                }));

                player.connect();
            }).catch(error => {
                console.error('Token validation failed:', error);
                setPlayerReady(false);
            });

            // Cleanup function
            return () => {
                if (player) {
                    player.disconnect();
                }
                document.body.removeChild(script);
            };
        };

        // Cleanup function for the outer effect
        return () => {
            if (window.onSpotifyWebPlaybackSDKReady) {
                window.onSpotifyWebPlaybackSDKReady = null;
            }
        };
    }, [props.token]); // Only depend on token changes

    const fetchPlaylistInfo = async (playlistId) => {
        if (!props.token || !is_player_ready) {
            console.log('Player not ready or no token, skipping playlist fetch');
            return;
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${props.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed - token may be expired');
                } else if (response.status === 404) {
                    throw new Error('Playlist not found');
                } else {
                    throw new Error(`Failed to fetch playlist info: ${response.status}`);
                }
            }

            const data = await response.json();
            setPlaylistInfo({
                name: data.name,
                owner: data.owner.display_name,
                total_tracks: data.tracks.total
            });
        } catch (error) {
            console.error('Error fetching playlist info:', error);
            setPlaylistInfo(null);
        }
    };

    const toggleShuffle = async () => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${!shuffle_state}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${props.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to toggle shuffle');
            }

            setShuffle(!shuffle_state);
        } catch (error) {
            console.error('Error toggling shuffle:', error);
        }
    };

    const toggleRepeat = async () => {
        let nextState;
        switch (repeat_state) {
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

        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${nextState}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${props.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to toggle repeat');
            }

            setRepeat(nextState);
        } catch (error) {
            console.error('Error toggling repeat:', error);
        }
    };

    const handleItemSelect = async (uri, type) => {
        if (!player) return;
        
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${props.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    type === 'playlist' || type === 'album'
                        ? { context_uri: uri }
                        : { uris: [uri] }
                )
            });
            
            if (!response.ok) {
                throw new Error(`Failed to play ${type}`);
            }
        } catch (error) {
            console.error(`Error playing ${type}:`, error);
        }
    };

    if (!is_active) {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>
        );
    } else {
        const track = current_track || defaultTrack;
        const nextTrack = next_track || defaultTrack;

        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <img 
                            src={track.album.images[0]?.url || ""} 
                            className="now-playing__cover" 
                            alt={track.name} 
                        />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{track.name}</div>
                            <div className="now-playing__artist">
                                {track.artists.map(artist => artist.name).join(', ')}
                            </div>

                            <div className="player-controls">
                                <button className="btn-spotify" onClick={() => { player?.previousTrack() }}>
                                    &lt;&lt;
                                </button>

                                <button className="btn-spotify" onClick={() => { player?.togglePlay() }}>
                                    {is_paused ? "PLAY" : "PAUSE"}
                                </button>

                                <button className="btn-spotify" onClick={() => { player?.nextTrack() }}>
                                    &gt;&gt;
                                </button>

                                <button 
                                    className={`btn-spotify ${shuffle_state ? 'active' : ''}`} 
                                    onClick={toggleShuffle}
                                    title="Toggle shuffle"
                                >
                                    🔀
                                </button>

                                <button 
                                    className={`btn-spotify ${repeat_state !== 'off' ? 'active' : ''}`} 
                                    onClick={toggleRepeat}
                                    title={`Repeat: ${repeat_state}`}
                                >
                                    {repeat_state === 'track' ? '🔂' : '🔁'}
                                </button>
                            </div>

                            {playlist_info && (
                                <div className="playlist-info">
                                    <div className="playlist-name">From: {playlist_info.name}</div>
                                    <div className="playlist-details">
                                        <span>by {playlist_info.owner}</span>
                                        <span>•</span>
                                        <span>{playlist_info.total_tracks} tracks</span>
                                    </div>
                                </div>
                            )}

                            <div className="next-track-info">
                                <div className="next-track-label">Next:</div>
                                <div className="next-track-name">{nextTrack.name}</div>
                                <div className="next-track-artist">
                                    {nextTrack.artists.map(artist => artist.name).join(', ')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ContentTabs 
                    token={props.token}
                    onTrackSelect={handleItemSelect}
                />
            </>
        );
    }
}

export default WebPlayback;
