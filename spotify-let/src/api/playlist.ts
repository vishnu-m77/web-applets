import { Playlist, GetPlaylistsParams } from '../types';

export const getPlaylists = async ({ accessToken }: GetPlaylistsParams): Promise<{ items: Playlist[] }> => {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get playlists: ${response.statusText}`);
    }

    return await response.json();
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