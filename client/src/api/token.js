let accessToken = null;

export const setToken = (token) => {
  accessToken = token;
};

export const getToken = () => {
  return accessToken;
};

export const clearToken = () => {
  accessToken = null;
};