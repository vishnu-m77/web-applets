import { Playlist, GetPlaylistsParams } from '../types';

export const getPlaylists = async ({ accessToken }: GetPlaylistsParams): Promise<{ items: Playlist[] }> => {
    // First get all playlists
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get playlists: ${response.statusText}`);
    }

    const playlists = await response.json();

    // Get recently played tracks
    const recentlyPlayedResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!recentlyPlayedResponse.ok) {
        throw new Error(`Failed to get recently played tracks: ${recentlyPlayedResponse.statusText}`);
    }

    const recentlyPlayed = await recentlyPlayedResponse.json();

    // Create a map of playlist IDs to their last played timestamp
    const playlistLastPlayedMap = new Map<string, number>();
    
    recentlyPlayed.items.forEach((item: any) => {
        if (item.context && item.context.type === 'playlist') {
            const playlistId = item.context.uri.split(':')[2];
            const playedAt = new Date(item.played_at).getTime();
            
            // Only update if this is a more recent play
            if (!playlistLastPlayedMap.has(playlistId) || playlistLastPlayedMap.get(playlistId)! < playedAt) {
                playlistLastPlayedMap.set(playlistId, playedAt);
            }
        }
    });

    // Add last played timestamps to playlists
    playlists.items = playlists.items.map((playlist: any) => ({
        ...playlist,
        tracks: {
            ...playlist.tracks,
            last_played: playlistLastPlayedMap.get(playlist.id)
        }
    }));

    return playlists;
};

export const getPlaylistTracks = async (accessToken: string, playlistId: string): Promise<Playlist> => {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get playlist tracks: ${response.statusText}`);
    }

    return await response.json();
}; 