// src/pages/Login.jsx
import { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      // Ambil CSRF token dulu
      await api.get('/sanctum/csrf-cookie')

      // Kirim login
      await api.post('/auth/login', { email, password })

      // Redirect ke dashboard
      navigate('/dashboard')
    } catch (err) {
      setError('Login gagal. Cek email/password atau backend.')
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/google/redirect'
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow space-y-4">
      <h2 className="text-xl font-bold text-center">Login</h2>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Login
        </button>
      </form>

      <div className="text-center text-gray-500">atau</div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center gap-2"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Login dengan Google
      </button>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  )
}
