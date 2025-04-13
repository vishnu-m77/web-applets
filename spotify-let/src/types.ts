// Spotify API Type Definitions

// Common Types
export interface ExternalUrls {
    spotify: string;
}

export interface Image {
    url: string;
    height: number | null;
    width: number | null;
}

export interface Followers {
    href: string | null;
    total: number;
}

// User Profile Types
export interface UserProfile {
    display_name: string;
    email: string;
    external_urls: ExternalUrls;
    followers: Followers;
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}

// Playback Types
export interface PlaybackState {
    device: Device;
    repeat_state: 'off' | 'track' | 'context';
    shuffle_state: boolean;
    context: Context | null;
    timestamp: number;
    progress_ms: number;
    is_playing: boolean;
    item: Track | null;
    currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
    actions: Actions;
}

export interface Device {
    id: string | null;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
    supports_volume: boolean;
}

export interface Context {
    external_urls: ExternalUrls;
    href: string;
    type: string;
    uri: string;
}

export interface Actions {
    interrupting_playback: boolean;
    pausing: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
    toggling_repeat_context: boolean;
    toggling_shuffle: boolean;
    toggling_repeat_track: boolean;
    transferring_playback: boolean;
}

// Track Types
export interface Track {
    album: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: {
        isrc: string;
    };
    external_urls: ExternalUrls;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: string | null;
    track_number: number;
    type: string;
    uri: string;
}

export interface Album {
    album_type: string;
    artists: Artist[];
    available_markets: string[];
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
}

export interface Artist {
    external_urls: ExternalUrls;
    followers: Followers;
    genres: string[];
    href: string;
    id: string;
    images: Image[];
    name: string;
    popularity: number;
    type: string;
    uri: string;
}

// Playlist Types
export interface Playlist {
    collaborative: boolean;
    description: string | null;
    external_urls: ExternalUrls;
    followers: Followers;
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: UserProfile;
    public: boolean;
    snapshot_id: string;
    tracks: PlaylistTracks;
    type: string;
    uri: string;
}

export interface PlaylistTracks {
    href: string;
    total: number;
    items: PlaylistTrack[];
}

export interface PlaylistTrack {
    added_at: string;
    added_by: UserProfile;
    is_local: boolean;
    track: Track;
}

// Search Types
export interface SearchResults {
    tracks: {
        items: Array<{
            uri: string;
            name: string;
            artists: Array<{
                name: string;
            }>;
            album: {
                images: Array<{
                    url: string;
                }>;
            };
        }>;
    };
    albums: {
        items: Array<{
            uri: string;
            name: string;
            artists: Array<{
                name: string;
            }>;
            images: Array<{
                url: string;
            }>;
        }>;
    };
}

// Recently Played Types
export interface RecentlyPlayed {
    items: PlayHistory[];
    next: string | null;
    cursors: {
        after: string;
        before: string;
    };
    limit: number;
    href: string;
}

export interface PlayHistory {
    track: Track;
    played_at: string;
    context: Context | null;
}

// API Response Types
export interface ApiError {
    error: {
        status: number;
        message: string;
    };
}

// API Request Types
export interface SearchParams {
    accessToken: string;
    query: string;
}

export interface PlayTrackParams {
    accessToken: string;
    trackUri: string;
    contextUri?: string;
}

export interface SetVolumeParams {
    accessToken: string;
    volumePercent: number;
}

export interface GetPlaylistsParams {
    accessToken: string;
}

export interface GetRecentlyPlayedParams {
    accessToken: string;
}

export interface GetCurrentPlaybackStateParams {
    accessToken: string;
}

export interface PausePlaybackParams {
    accessToken: string;
}

export interface ResumePlaybackParams {
    accessToken: string;
}

export interface SkipToNextParams {
    accessToken: string;
}

export interface SkipToPreviousParams {
    accessToken: string;
}

export interface ToggleShuffleParams {
    accessToken: string;
    state: boolean;
}

export interface ToggleRepeatParams {
    accessToken: string;
    state: 'off' | 'track' | 'context';
}

export interface ExternalIds {
    isrc: string;
}

export interface Disallows {
    resuming: boolean;
} 