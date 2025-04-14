import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback'
import Login from './Login'
import ProfileInfo from './ProfileInfo'
import './App.css';

function App() {

  const [token, setToken] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();

  }, []);

  return (
    <>
      {token === '' ? (
        <Login />
      ) : (
        <div className="app-container">
          <ProfileInfo token={token} />
          <WebPlayback token={token} />
        </div>
      )}
    </>
  );
}


export default App;
