'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/api' // pastikan path ini sesuai (misalnya /src/api/index.js)

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const res = await api.get('/auth/users')
      setUser(res.data.data) // Perbaikan: ambil user dari res.data.data
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/auth/login', {
        email,
        password
      })
      await checkUser() // Update user state after successful login
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Login gagal. Cek email/password atau backend.' }
    }
  }


  const logout = async () => {
    try {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/auth/logout')
      setUser(null)
      router.push('/login')
    } catch (error) {
      // Silently handle logout error
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!(user && user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
