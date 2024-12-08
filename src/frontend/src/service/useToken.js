import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    const userToken = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    
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