import { UserProfile } from "../types";

export const populateUI = (profile: UserProfile): void => {
    const displayName = document.getElementById("displayName");
    const avatar = document.getElementById("avatar");
    const email = document.getElementById("email");
    const uri = document.getElementById("uri");
    const url = document.getElementById("url");
    const imgUrl = document.getElementById("imgUrl");

    if (displayName) displayName.innerText = profile.display_name || "Unknown User";
    if (avatar && profile.images?.[0]?.url) avatar.setAttribute("src", profile.images[0].url);
    if (email) email.innerText = profile.email || "No email available";
    if (uri) {
        uri.innerText = profile.uri || "No URI available";
        if (profile.external_urls?.spotify) {
            uri.setAttribute("href", profile.external_urls.spotify);
        }
    }
    if (url) {
        url.innerText = profile.href || "No URL available";
        if (profile.href) {
            url.setAttribute("href", profile.href);
        }
    }
    if (imgUrl && profile.images?.[0]?.url) imgUrl.innerText = profile.images[0].url;
}; 