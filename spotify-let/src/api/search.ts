import { SearchParams } from '../types';

export const searchTracks = async ({ accessToken, query }: SearchParams): Promise<any> => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to search tracks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks;
};

export const searchAlbums = async ({ accessToken, query }: SearchParams): Promise<any> => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to search albums: ${response.statusText}`);
    }

    const data = await response.json();
    return data.albums;
}; 