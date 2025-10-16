import axios from 'axios'
// ini kapan jadi .ts?
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, 
  xsrfCookieName: 'XSRF-TOKEN', 
  xsrfHeaderName: 'X-XSRF-TOKEN', 
  headers: {
    'Accept': 'application/json' 
  }
})

// 👇 Tambahkan Interceptor CSRF
api.interceptors.request.use((config) => {
  const matches = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'))
  if (matches) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(matches[2])
  }
  return config
})

export default api
