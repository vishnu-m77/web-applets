import { getAccessToken } from './authCodeWithPkce';

// Types
export interface SpotifyAction {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
  parameters: Record<string, {
    type: string;
    description: string;
    required: boolean;
  }>;
}

// Authentication Actions
export const authenticate: SpotifyAction = {
  name: 'authenticate',
  description: 'Authenticate with Spotify using PKCE flow',
  execute: async () => {
    const clientId = "4e9b9eeca37441839b3305512f084064";
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    
    if (!code) {
      throw new Error('No authorization code found');
    }
    
    return await getAccessToken(clientId, code);
  },
  parameters: {}
};

// Playback Control Actions
export const playTrack: SpotifyAction = {
  name: 'playTrack',
  description: 'Play a specific track',
  execute: async ({ trackUri, contextUri, accessToken }) => {
    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [trackUri],
        context_uri: contextUri
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to play track: ${response.statusText}`);
    }
  },
  parameters: {
    trackUri: {
      type: 'string',
      description: 'Spotify URI of the track to play',
      required: true
    },
    contextUri: {
      type: 'string',
      description: 'Optional context URI (e.g., playlist)',
      required: false
    },
    accessToken: {
      type: 'string',
      description: 'Spotify access token',
      required: true
    }
  }
};

export const pausePlayback: SpotifyAction = {
  name: 'pausePlayback',
  description: 'Pause the current playback',
  execute: async ({ accessToken }) => {
    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to pause playback: ${response.statusText}`);
    }
  },
  parameters: {
    accessToken: {
      type: 'string',
      description: 'Spotify access token',
      required: true
    }
  }
};

// Playback State Actions
export const getPlaybackState: SpotifyAction = {
  name: 'getPlaybackState',
  description: 'Get the current playback state',
  execute: async ({ accessToken }) => {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get playback state: ${response.statusText}`);
    }
    
    return await response.json();
  },
  parameters: {
    accessToken: {
      type: 'string',
      description: 'Spotify access token',
      required: true
    }
  }
};

// Volume Control Actions
export const setVolume: SpotifyAction = {
  name: 'setVolume',
  description: 'Set the playback volume',
  execute: async ({ accessToken, volumePercent }) => {
    const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to set volume: ${response.statusText}`);
    }
  },
  parameters: {
    accessToken: {
      type: 'string',
      description: 'Spotify access token',
      required: true
    },
    volumePercent: {
      type: 'number',
      description: 'Volume percentage (0-100)',
      required: true
    }
  }
};

// Playlist Actions
export const getPlaylists: SpotifyAction = {
  name: 'getPlaylists',
  description: 'Get user playlists',
  execute: async ({ accessToken }) => {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get playlists: ${response.statusText}`);
    }
    
    return await response.json();
  },
  parameters: {
    accessToken: {
      type: 'string',
      description: 'Spotify access token',
      required: true
    }
  }
};

// Search Actions
export const searchTracks: SpotifyAction = {
  name: 'searchTracks',
  description: 'Search for tracks',
  execute: async ({ accessToken, query }) => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search tracks: ${response.statusText}`);
    }
    
    return await response.json();
  },
  parameters: {
    accessToken: {
      type: 'string',
      description: 'Spotify access token',
      required: true
    },
    query: {
      type: 'string',
      description: 'Search query',
      required: true
    }
  }
};

// Device Actions
export const getDevices: SpotifyAction = {
  name: 'getDevices',
  description: 'Get available playback devices',
  execute: async ({ accessToken }) => {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get devices: ${response.statusText}`);
    }
    
    return await response.json();
  },
  parameters: {
    accessToken: {
      type: 'string',
      description: 'Spotify access token',
      required: true
    }
  }
};

// Queue Actions
export const getQueue: SpotifyAction = {
  name: 'getQueue',
  description: 'Get the current playback queue',
  execute: async ({ accessToken }) => {
    const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get queue: ${response.statusText}`);
    }
    
    return await response.json();
  },
  parameters: {
    accessToken: {
      type: 'string',
      description: 'Spotify access token',
      required: true
    }
  }
};

// Export all actions
export const spotifyActions: Record<string, SpotifyAction> = {
  authenticate,
  playTrack,
  pausePlayback,
  getPlaybackState,
  setVolume,
  getPlaylists,
  searchTracks,
  getDevices,
  getQueue
}; 