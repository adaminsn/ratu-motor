import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Tambahkan timeout agar tidak hanging
  timeout: 30000,
})

// ===== REQUEST INTERCEPTOR =====
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token')
    
    console.log('🔑 Token from localStorage:', token ? 'Ada ✅' : 'Tidak ada ❌')
    console.log('📡 Request URL:', config.url)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token attached to request:', config.url)
    } else {
      console.log('❌ No token for request:', config.url)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ===== RESPONSE INTERCEPTOR =====
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.config.url, 'Status:', response.status)
    return response
  },
  (error) => {
    // Handle network error
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('🔴 Network Error - Server tidak merespon')
      // Jangan redirect, biarkan user tahu ada masalah
      return Promise.reject(error)
    }
    
    console.log('❌ Response error:', error.response?.status, error.response?.data)
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔴 401 Unauthorized - Logging out')
      
      // Hapus token dari localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('auth-storage')
      
      // Reset auth store
      const { logout } = useAuthStore.getState()
      if (logout) logout()
      
      // Redirect ke login
      window.location.href = '/login'
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.log('🔴 403 Forbidden - Tidak punya akses')
      // Tampilkan toast atau alert
    }
    
    return Promise.reject(error)
  }
)

export default api