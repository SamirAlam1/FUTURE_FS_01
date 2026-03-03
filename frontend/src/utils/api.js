// ================================
// Axios Global API Configuration
// ================================

import axios from "axios";

/*
  IMPORTANT:

  VITE_API_URL (Vercel env variable) should be:
  https://my-portfolio-2-qgfg.onrender.com

  ❌ DO NOT add /api in environment variable
  ✅ We are adding /api here in baseURL
*/

// const API = axios.create({
//   // Backend base URL + /api prefix (since backend routes are defined as /api/*)
//   baseURL: `${import.meta.env.VITE_API_URL}/api`,

//   // Request timeout (10 seconds)
//   timeout: 10000,

//   // Optional: if you ever use cookies
//   withCredentials: true,
// });
const API = axios.create({
  baseURL: "https://my-portfolio-samir.onrender.com/api",
  timeout: 10000,
  withCredentials: true,
});

// ================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token
// ================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    // If token exists, attach Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ================================
// RESPONSE INTERCEPTOR
// Handle 401 (Unauthorized) globally
// ================================

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      // Redirect to admin login
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  }
);

// Export API instance
export default API;
