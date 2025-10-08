'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const res = await api.get('/auth/users')
      if (res.data.data) {
        setUser(res.data.data)
      }
    } catch (error) {
      // User is not authenticated, this is normal behavior
      console.log('User not authenticated or network unavailable')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password
      })
      
      if (res.data.success) {
        setUser(res.data.user)
        return { success: true }
      }
      
      return { success: false, error: 'Login failed' }
    } catch (err) {
      console.error('Login error:', err)
      return { 
        success: false, 
        error: err.response?.data?.error || 'Login failed. Please try again.' 
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
      setUser(null)
      localStorage.removeItem('auth_token')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  }

  const value: AuthContextType = {
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