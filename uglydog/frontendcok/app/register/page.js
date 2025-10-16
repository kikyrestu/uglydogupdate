
'use client'
// Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from "next/link"
import Layout from "@/components/layout/Layout"
import api from '@/api'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validasi
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak sama')
      return
    }

    if (!formData.agreeTerms) {
      toast.error('Anda harus menyetujui syarat dan ketentuan')
      return
    }

    setIsLoading(true)

    try {
      // CSRF untuk Sanctum (sudah ditangani oleh interceptor axios)
      await api.get('/sanctum/csrf-cookie');

      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword // backend laravel memerlukan ini
      })

      // const data = await response.json()
      const data = response.data

      if (!response.status === 200) {
        throw new Error(data.message || 'Registrasi gagal')
      }

      toast.success('Registrasi berhasil! Silakan login')
      router.push('/login')
    } catch (error) {
      toast.error(error.message || 'Terjadi kesalahan. Silakan coba lagi.')
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
                        <Link href="#" className="tf-button active">Register</Link>
                        <Link href="/login" className="tf-button">Login</Link>
                    </div>
                    <div className="form-inner">
                      <fieldset>
                        <label>Name *</label>
                        <input 
                          type="text" 
                          name="name"
                          placeholder="Your full name" 
                          value={formData.name}
                          onChange={handleChange}
                          required 
                        />
                      </fieldset>
                      <fieldset>
                        <label>Email address *</label>
                        <input 
                          type="email" 
                          name="email"
                          placeholder="Your email" 
                          value={formData.email}
                          onChange={handleChange}
                          required 
                        />
                      </fieldset>
                      <fieldset>
                        <label>Password *</label>
                        <input 
                          type="password" 
                          name="password"
                          placeholder="Your password" 
                          value={formData.password}
                          onChange={handleChange}
                          required 
                        />
                      </fieldset>
                      <fieldset className="mb19">
                        <label>Confirm password *</label>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          placeholder="Confirm password" 
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required 
                        />
                      </fieldset>
                      <fieldset className="checkbox">
                        <input 
                          type="checkbox" 
                          id="agreeTerms" 
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleChange}
                        />
                        <label htmlFor="agreeTerms" className="icon" />
                        <label htmlFor="agreeTerms">
                          I accept the Term of Conditions and Privacy Policy
                        </label>  
                      </fieldset>
                    </div>
                    <div className="wrap-btn">
                      <button 
                        type="submit" 
                        className="tf-button style2"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Registering...' : 'Register'}
                      </button>
                    </div>
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