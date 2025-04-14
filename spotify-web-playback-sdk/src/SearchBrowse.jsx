import React, { useState } from 'react';
import './SearchBrowse.css';

function SearchBrowse({ token, onTrackSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ tracks: [], albums: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('tracks');

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

    const renderResults = () => {
        if (isLoading) {
            return <div className="loading">Searching...</div>;
        }

        if (error) {
            return <div className="error">{error}</div>;
        }

        const items = activeTab === 'tracks' ? searchResults.tracks : searchResults.albums;
        
        if (items.length === 0) {
            return <div className="no-results">No results found</div>;
        }

        return items.map((item) => (
            <div 
                key={item.id} 
                className="item"
                onClick={() => onTrackSelect(activeTab === 'tracks' ? item.uri : item.uri)}
            >
                <img 
                    src={item.album?.images[0]?.url || item.images[0]?.url} 
                    alt={item.name} 
                    className="item-image"
                />
                <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>
                        {activeTab === 'tracks' 
                            ? item.artists.map(artist => artist.name).join(', ')
                            : item.artists.map(artist => artist.name).join(', ')}
                    </p>
                </div>
            </div>
        ));
    };

    return (
        <div className="search-browse-container">
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

            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'tracks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tracks')}
                >
                    Tracks
                </button>
                <button 
                    className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
                    onClick={() => setActiveTab('albums')}
                >
                    Albums
                </button>
            </div>
            
            <div className="results-container">
                {renderResults()}
            </div>
        </div>
    );
}

export default SearchBrowse; 