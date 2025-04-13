import { RecentlyPlayed, GetRecentlyPlayedParams } from '../types';

export const getRecentlyPlayed = async ({ accessToken }: GetRecentlyPlayedParams): Promise<RecentlyPlayed> => {
    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get recently played tracks: ${response.statusText}`);
    }

    return await response.json();
}; 