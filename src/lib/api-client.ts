import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to log outgoing requests
apiClient.interceptors.request.use((config) => {
  console.log(`[Mock API Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor to log incoming responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[Mock API Response] ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("[Mock API Error]:", error);
    return Promise.reject(error);
  }
);
