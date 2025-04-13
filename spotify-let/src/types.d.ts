// Spotify API Type Definitions

// Common Types
interface ExternalUrls {
    spotify: string;
}

interface Image {
    url: string;
    height: number | null;
    width: number | null;
}

interface Followers {
    href: string | null;
    total: number;
}

// User Profile Types
interface UserProfile {
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
interface PlaybackState {
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

interface Device {
    id: string | null;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
    supports_volume: boolean;
}

interface Context {
    external_urls: ExternalUrls;
    href: string;
    type: string;
    uri: string;
}

interface Actions {
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
interface Track {
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

interface Album {
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

interface Artist {
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
interface Playlist {
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

interface PlaylistTracks {
    href: string;
    total: number;
    items: PlaylistTrack[];
}

interface PlaylistTrack {
    added_at: string;
    added_by: UserProfile;
    is_local: boolean;
    track: Track;
}

// Search Types
interface SearchResults {
    tracks: {
        href: string;
        items: Track[];
        limit: number;
        next: string | null;
    };
}

// Recently Played Types
interface RecentlyPlayed {
    items: PlayHistory[];
    next: string | null;
    cursors: {
        after: string;
        before: string;
    };
    limit: number;
    href: string;
}

interface PlayHistory {
    track: Track;
    played_at: string;
    context: Context | null;
}

// API Response Types
interface ApiError {
    error: {
        status: number;
        message: string;
    };
}

// API Request Types
interface PlayTrackParams {
    accessToken: string;
    trackUri: string;
}

interface SetVolumeParams {
    accessToken: string;
    volumePercent: number;
}

interface SearchTracksParams {
    accessToken: string;
    query: string;
}

interface GetPlaylistsParams {
    accessToken: string;
}

interface GetRecentlyPlayedParams {
    accessToken: string;
}

interface GetCurrentPlaybackStateParams {
    accessToken: string;
}

interface PausePlaybackParams {
    accessToken: string;
}

interface ResumePlaybackParams {
    accessToken: string;
}

interface SkipToNextParams {
    accessToken: string;
}

interface SkipToPreviousParams {
    accessToken: string;
}