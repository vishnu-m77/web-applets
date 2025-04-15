import React, { useState, useEffect } from 'react';
import './ContentTabs.css';

function ContentTabs({ token, onTrackSelect }) {
    const [activeTab, setActiveTab] = useState('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ tracks: [], albums: [] });
    const [playlists, setPlaylists] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activeTab === 'playlists') {
            fetchPlaylists();
        } else if (activeTab === 'recently-played') {
            fetchRecentlyPlayed();
        }
    }, [activeTab]);

    const fetchPlaylists = async () => {
        setIsLoading(true);
        setError(null);
        
        if (!token) {
            setError('No access token available');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
                setError(`Rate limited. Retrying in ${waitTime/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return fetchPlaylists(); // Retry the request
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch playlists: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            setPlaylists(data.items);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching playlists:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecentlyPlayed = async () => {
        setIsLoading(true);
        setError(null);
        
        if (!token) {
            setError('No access token available');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
                setError(`Rate limited. Retrying in ${waitTime/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return fetchRecentlyPlayed(); // Retry the request
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch recently played: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            setRecentlyPlayed(data.items);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching recently played:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const [tracksResponse, albumsResponse] = await Promise.all([
                fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=10`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!tracksResponse.ok || !albumsResponse.ok) {
                throw new Error('Failed to search Spotify');
            }

            const [tracksData, albumsData] = await Promise.all([
                tracksResponse.json(),
                albumsResponse.json()
            ]);

            setSearchResults({
                tracks: tracksData.tracks.items,
                albums: albumsData.albums.items
            });
        } catch (error) {
            setError(error.message);
            console.error('Error searching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="loading">Loading...</div>;
        }

        if (error) {
            return <div className="error">{error}</div>;
        }

        switch (activeTab) {
            case 'search':
                return (
                    <div className="search-content">
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for tracks or albums..."
                                className="search-input"
                            />
                            <button type="submit" className="search-button" disabled={isLoading}>
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </form>

                        <div className="search-results">
                            <div className="search-section">
                                <h3>Tracks</h3>
                                <div className="tracks-list">
                                    {searchResults.tracks.map((track) => (
                                        <div 
                                            key={track.id} 
                                            className="content-card track-item"
                                            onClick={() => onTrackSelect(track.uri, 'track')}
                                        >
                                            <img 
                                                src={track.album?.images?.[0]?.url || 'https://via.placeholder.com/150?text=No+Image'} 
                                                alt={track.name}
                                                className="item-image"
                                            />
                                            <div className="item-info">
                                                <h4>{track.name}</h4>
                                                <p>{track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="search-section">
                                <h3>Albums</h3>
                                <div className="albums-list">
                                    {searchResults.albums.map((album) => (
                                        <div 
                                            key={album.id} 
                                            className="content-card album-item"
                                            onClick={() => onTrackSelect(album.uri, 'album')}
                                        >
                                            <img 
                                                src={album.images?.[0]?.url || 'https://via.placeholder.com/150?text=No+Image'} 
                                                alt={album.name}
                                                className="item-image"
                                            />
                                            <div className="item-info">
                                                <h4>{album.name}</h4>
                                                <p>{album.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'playlists':
                return (
                    <div className="playlists-content">
                        {playlists.map((playlist) => (
                            <div 
                                key={playlist.id} 
                                className="content-card playlist-item"
                                onClick={() => onTrackSelect(playlist.uri, 'playlist')}
                            >
                                <img 
                                    src={playlist.images?.[0]?.url || 'https://via.placeholder.com/150?text=No+Image'} 
                                    alt={playlist.name}
                                    className="item-image"
                                />
                                <div className="item-info">
                                    <h4>{playlist.name}</h4>
                                    <p>{playlist.tracks?.total || 0} tracks</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'recently-played':
                return (
                    <div className="recently-played-content">
                        {recentlyPlayed.map((item) => (
                            <div 
                                key={item.played_at} 
                                className="content-card track-item"
                                onClick={() => onTrackSelect(item.track.uri, 'track')}
                            >
                                <img 
                                    src={item.track?.album?.images?.[0]?.url || 'https://via.placeholder.com/150?text=No+Image'} 
                                    alt={item.track?.name}
                                    className="item-image"
                                />
                                <div className="item-info">
                                    <h4>{item.track?.name || 'Unknown Track'}</h4>
                                    <p>{item.track?.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="content-tabs-container">
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    Search
                </button>
                <button 
                    className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
                    onClick={() => setActiveTab('playlists')}
                >
                    Playlists
                </button>
                <button 
                    className={`tab ${activeTab === 'recently-played' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recently-played')}
                >
                    Recently Played
                </button>
            </div>

            <div className="content-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default ContentTabs; 