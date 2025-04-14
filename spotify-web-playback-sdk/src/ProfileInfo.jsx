import React, { useState, useEffect } from 'react';

function ProfileInfo({ token }) {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch profile: ${response.status}`);
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching profile:', err);
            }
        };

        fetchProfile();
    }, [token]);

    if (error) {
        return <div className="profile-error">Error loading profile: {error}</div>;
    }

    if (!profile) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                {profile.images?.[0]?.url && (
                    <img 
                        src={profile.images[0].url} 
                        alt={profile.display_name} 
                        className="profile-avatar"
                    />
                )}
                <div className="profile-info">
                    <h2 className="profile-name">{profile.display_name}</h2>
                    <p className="profile-email">{profile.email}</p>
                    <p className="profile-followers">{profile.followers?.total} followers</p>
                </div>
            </div>
        </div>
    );
}

export default ProfileInfo; 