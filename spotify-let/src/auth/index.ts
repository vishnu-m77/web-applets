import { redirectToAuthCodeFlow, getAccessToken as getAuthCodeAccessToken } from "../authCodeWithPkce";
import { UserProfile } from "../types";
import { populateUI } from "../ui";

const clientId = "4e9b9eeca37441839b3305512f084064";
const TOKEN_KEY = 'spotify_access_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';

export const getStoredAccessToken = (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) {
        return null;
    }
    
    // Check if token is expired
    if (Date.now() > parseInt(expiry)) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        return null;
    }
    
    return token;
};

export const storeAccessToken = (token: string, expiresIn: number) => {
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

export const handleAuthentication = async (): Promise<string | null> => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        console.log('No code found in URL, redirecting to auth flow...');
        redirectToAuthCodeFlow(clientId);
        return null;
    }

    try {
        console.log('Code found, getting access token...');
        const result = await getAuthCodeAccessToken(clientId, code);
        
        if (!result.access_token) {
            throw new Error('Failed to get access token');
        }
        
        // Store the access token and its expiry
        storeAccessToken(result.access_token, result.expires_in);
        
        console.log('Access token received, fetching profile...');
        const profile = await fetchProfile(result.access_token);
        console.log('Profile fetched successfully:', profile);
        populateUI(profile);
        
        return result.access_token;
    } catch (error) {
        console.error('Error during authentication:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
            
            // Check if the error is due to an expired authorization code
            if (error.message.includes('invalid_grant') || error.message.includes('Authorization code expired')) {
                console.log('Authorization code expired, redirecting to auth flow...');
                redirectToAuthCodeFlow(clientId);
                return null;
            }
        }
        const displayName = document.getElementById("displayName");
        if (displayName) {
            displayName.innerText = "Error loading profile. Please check console for details.";
        }
        return null;
    }
};

const fetchProfile = async (token: string): Promise<UserProfile> => {
    console.log('Fetching profile with token:', token.substring(0, 10) + '...');
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", 
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!result.ok) {
        const errorText = await result.text();
        console.error('Profile fetch failed:', {
            status: result.status,
            statusText: result.statusText,
            response: errorText
        });
        throw new Error(`Failed to fetch profile: ${result.status} ${result.statusText}\n${errorText}`);
    }

    const profile = await result.json();
    console.log('Profile data received:', profile);
    return profile;
};