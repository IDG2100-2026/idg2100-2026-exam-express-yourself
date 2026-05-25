let accessToken = null; // im memory storage for access token. starts as null since no one is logged in yet

export const getAccessToken = () => accessToken; // returns the current access token. Will be called on requests

export const setAccessToken = (token) => {
  // stores a new access token. Called on login or when the token refreshes
  accessToken = token;
};

export const clearAccessToken = () => {
  // removes the access token. Called on logout or when a session is expired
  accessToken = null;
};
