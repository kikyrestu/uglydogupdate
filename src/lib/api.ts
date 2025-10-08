import axios from 'axios'

// API Configuration for Next.js backend
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_API_URL || 'https://your-domain.com') 
    : 'http://localhost:3000', // Next.js development server
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  // Add any auth token if needed
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 401 errors as they're expected for unauthenticated users
    if (error.response?.status !== 401) {
      // Handle network errors separately
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('Network error - API might be unavailable')
      } else {
        console.error('API Error:', error.response?.data || error.message)
      }
    }
    return Promise.reject(error)
  }
)

export default api