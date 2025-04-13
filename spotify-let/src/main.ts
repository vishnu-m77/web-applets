import { applets } from '@web-applets/sdk';
import {
    getCurrentPlaybackState,
    playTrack,
    pausePlayback,
    resumePlayback,
    skipToNext,
    skipToPrevious,
    getPlaylists,
    searchTracks,
    getRecentlyPlayed,
    setVolume
} from './script';

// Register the applet
const self = applets.register();

// Set up action handlers
self.setActionHandler('getCurrentPlaybackState', getCurrentPlaybackState);
self.setActionHandler('playTrack', playTrack);
self.setActionHandler('pausePlayback', pausePlayback);
self.setActionHandler('resumePlayback', resumePlayback);
self.setActionHandler('skipToNext', skipToNext);
self.setActionHandler('skipToPrevious', skipToPrevious);
self.setActionHandler('getPlaylists', getPlaylists);
self.setActionHandler('searchTracks', searchTracks);
self.setActionHandler('getRecentlyPlayed', getRecentlyPlayed);
self.setActionHandler('setVolume', setVolume);

// UI Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output') as HTMLPreElement;

    // Playback Actions
    document.getElementById('playTrackBtn')?.addEventListener('click', () => {
        const trackUri = (document.getElementById('trackUri') as HTMLInputElement).value;
        output.textContent = `Action: Play Track\nTrack URI: ${trackUri}`;
    });

    document.getElementById('pauseBtn')?.addEventListener('click', () => {
        output.textContent = 'Action: Pause Playback';
    });

    document.getElementById('resumeBtn')?.addEventListener('click', () => {
        output.textContent = 'Action: Resume Playback';
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        output.textContent = 'Action: Skip to Next Track';
    });

    document.getElementById('previousBtn')?.addEventListener('click', () => {
        output.textContent = 'Action: Skip to Previous Track';
    });

    document.getElementById('volumeBtn')?.addEventListener('click', () => {
        const volume = (document.getElementById('volumeInput') as HTMLInputElement).value;
        output.textContent = `Action: Set Volume\nVolume: ${volume}%`;
    });

    // Search Actions
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        const query = (document.getElementById('searchQuery') as HTMLInputElement).value;
        output.textContent = `Action: Search Tracks\nQuery: ${query}`;
    });

    document.getElementById('getPlaylistsBtn')?.addEventListener('click', () => {
        output.textContent = 'Action: Get Playlists';
    });

    document.getElementById('getRecentBtn')?.addEventListener('click', () => {
        output.textContent = 'Action: Get Recently Played Tracks';
    });
});