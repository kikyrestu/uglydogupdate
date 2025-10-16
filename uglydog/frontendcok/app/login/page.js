'use client'
// Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import Link from "next/link"
import Layout from "@/components/layout/Layout"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Email dan password harus diisi')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await login(email, password) // Gunakan context login
      
      if (result.success) {
        toast.success('Login berhasil!')
        router.push('/') // Mengarahkan ke halaman dashboard setelah login
        router.refresh() // Refresh halaman agar context dan komponen sinkron
      } else {
        toast.error(result.error || 'Login gagal. Silakan coba lagi.')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout headerStyle={1} footerStyle={1}>
      <section className="page-title">
        <div className="overlay" />
      </section>

      <div>
        <section className="tf-section project-info">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <form onSubmit={handleSubmit}>
                  <div className="project-info-form form-login style2">
                    <div className="group-btn mb-4">
                        <Link href="/register" className="tf-button">Register</Link>
                        <Link href="#" className="tf-button active">Login</Link>
                    </div>
                    <div className="form-inner">
                      <fieldset>
                        <label>
                          Email address *
                        </label>
                        <input 
                          type="email" 
                          placeholder="Your email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required 
                        />
                      </fieldset>
                      <fieldset>
                        <label>
                          Password *
                        </label>
                        <input 
                          type="password" 
                          placeholder="Your password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required 
                        />
                      </fieldset>
                    </div>
                  </div>
                  <div className="wrap-btn">
                    <button 
                      type="submit" 
                      className="tf-button style2"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}