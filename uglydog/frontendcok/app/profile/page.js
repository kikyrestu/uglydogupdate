'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import { useAuth } from '@/contexts/AuthContext'
import api from '@/api'
import Layout from '@/components/layout/Layout'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [name, setName] = useState('')
  const [wallet, setWallet] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setWallet(user.wallet || '')
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/update-profile', { name, wallet })
      toast.success('Profil berhasil diperbarui!')
      router.refresh?.()
      setTimeout(() => router.push('/'), 1000)
    } catch (err) {
      toast.error('Gagal memperbarui profil!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center mt-5">Loading...</div>
  if (!user) return <div className="text-center mt-5">Anda belum login.</div>

  return (
    <Layout headerStyle={1} footerStyle={1}>
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #09121D 0%, #1a202c 100%)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <section
          className="tf-section project-info"
          style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 120,
          }}
        >
          <div
            className="container d-flex flex-column align-items-center justify-content-center"
            style={{ maxWidth: 480, margin: '40px auto' }}
          >
            <h3
              className="mb-3 text-center"
              style={{
                color: '#fff',
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              Edit Profil
            </h3>

            {/* Informasi Data Saat Ini - Elegan */}
            <div
              className="mb-4 p-4 shadow w-100 backdrop-blur"
              style={{
                background: 'rgba(35, 43, 57, 0.6)',
                borderRadius: '16px',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minWidth: 320,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 0',
                }}
              >
                <span style={{ color: '#bbb', fontWeight: 500, fontSize: 14 }}>
                  👤 Nama
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#ffffff',
                    textAlign: 'right',
                    maxWidth: 200,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {user.name || '-'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0 0',
                }}
              >
                <span style={{ color: '#bbb', fontWeight: 500, fontSize: 14 }}>
                  💳 Wallet
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#00ffcc',
                    textAlign: 'right',
                    maxWidth: 200,
                    fontFamily: 'monospace',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {user.wallet || '-'}
                </span>
              </div>
            </div>

            {/* Form Edit */}
            <form
              className="project-info-form w-100"
              onSubmit={handleSubmit}
              style={{ minWidth: 320 }}
            >
              <div className="form-inner">
                <fieldset className="mb-3">
                  <label htmlFor="name">Nama</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-control"
                    style={{
                      background: '#171F29',
                      color: '#fff',
                      border: '1px solid #2c3647',
                      borderRadius: 8,
                    }}
                    placeholder="Masukkan nama baru"
                  />
                </fieldset>

                <fieldset className="mb-4">
                  <label htmlFor="wallet">Alamat Wallet</label>
                  <input
                    id="wallet"
                    type="text"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    required
                    className="form-control"
                    style={{
                      background: '#171F29',
                      color: '#fff',
                      border: '1px solid #2c3647',
                      borderRadius: 8,
                    }}
                    placeholder="Masukkan alamat wallet baru"
                  />
                </fieldset>

                <button
                  type="submit"
                  className="tf-button style2 w-100"
                  disabled={saving}
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 18,
                  }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </Layout>
  )
}