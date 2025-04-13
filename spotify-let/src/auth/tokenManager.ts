import { getStoredAccessToken as getLocalStorageToken, storeAccessToken as storeLocalStorageToken } from './index';

let currentAccessToken: string | null = null;

export const getAccessToken = (): string | null => {
    if (!currentAccessToken) {
        currentAccessToken = getLocalStorageToken();
    }
    return currentAccessToken;
};

export const setAccessToken = (token: string, expiresIn: number): void => {
    currentAccessToken = token;
    storeLocalStorageToken(token, expiresIn);
};

export const clearAccessToken = (): void => {
    currentAccessToken = null;
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
}; 