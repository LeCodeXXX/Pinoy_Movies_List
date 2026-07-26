const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

//Custome fetch function to make API calls
const api = (endpoint: string, method: string = "GET", options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, {  method, ...options});
};

export default api;