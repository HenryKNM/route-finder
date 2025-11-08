import axios from 'axios'

// Axios instance for API calls to the backend (/api base).
// Interceptors can add auth tokens when backend auth is implemented.

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  // Attach JWT bearer token for protected endpoints
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rf_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Centralize error handling/logging if needed
    return Promise.reject(error)
  }
)

export default api
