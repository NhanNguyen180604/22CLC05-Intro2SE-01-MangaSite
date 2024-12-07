import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    const timestampString = localStorage.getItem('tokenTimestamp');
    const userToken = JSON.parse(tokenString);
    const tokenTimestamp = JSON.parse(timestampString);
    
    const expirationTime = 60 * 60 * 1000;
    const currentTime = new Date().getTime();

    if (currentTime - tokenTimestamp > expirationTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenTimestamp');
      return null;
    }

    return userToken?.token;
  };

  const [token, setToken] = useState(getToken());

  const saveToken = userToken => {
    const currentTime = new Date().getTime();
    localStorage.setItem('token', userToken.token);
    localStorage.setItem('tokenTimestamp', JSON.stringify(currentTime));  // Save timestamp
    setToken(userToken.token);
  };

  return {
    setToken: saveToken,
    token
  }
}