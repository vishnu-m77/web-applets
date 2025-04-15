# Spotify-let

A web-based Spotify controller applet that allows you to control your Spotify playback, browse playlists, and search for tracks and albums.

## Features

- Control playback (play, pause, skip, volume)
- Toggle shuffle and repeat modes
- Browse and play from your playlists
- View recently played tracks
- Search for tracks and albums

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Spotify Premium account
- Spotify Developer credentials (Client ID and Client Secret)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/` - Source code
  - `api/` - Spotify API integration
  - `auth/` - Authentication handling
  - `ui/` - User interface components
  - `main.ts` - Main application logic
  - `actions.ts` - Action handlers
  - `types.ts` - TypeScript type definitions
  - `style.css` - Styling

## Authentication

The app uses Spotify's OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication. When you first launch the app, you'll be prompted to log in to your Spotify account and grant the necessary permissions.

## Available Actions

- `getCurrentPlaybackState` - Get current playback information
- `playTrack` - Play a specific track
- `pausePlayback` - Pause current playback
- `resumePlayback` - Resume paused playback
- `skipToNext` - Skip to next track
- `skipToPrevious` - Skip to previous track
- `getPlaylists` - Fetch user's playlists
- `searchTracks` - Search for tracks
- `searchAlbums` - Search for albums
- `getRecentlyPlayed` - Get recently played tracks
- `setVolume` - Set playback volume
- `toggleShuffle` - Toggle shuffle mode
- `toggleRepeat` - Toggle repeat mode
- `getQueue` - Get current playback queue

## Resources

- Follow [@SpotifyPlatform](https://twitter.com/SpotifyPlatform) on Twitter for Spotify for Developers updates.
- Join the [Spotify for Developers Community Forum](https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer).

## Code of Conduct

This project adheres to the [Open Source Code of
Conduct](https://github.com/spotify/code-of-conduct/blob/master/code-of-conduct.md).
By participating, you are expected to honor this code.

## License

Copyright 2021 Spotify AB.

Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0