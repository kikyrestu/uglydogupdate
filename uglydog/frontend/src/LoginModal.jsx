import React, { useState } from 'react';
import api from './api';

export default function LoginModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/login', { email, password });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login gagal');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regEmail || !regPassword || !regPassword2) {
      setRegError('Semua field wajib diisi');
      return;
    }
    if (regPassword !== regPassword2) {
      setRegError('Password tidak sama');
      return;
    }
    setRegLoading(true);
    try {
      await api.post('/auth/register', {
        name: regName,
        email: regEmail,
        password: regPassword,
        password_confirmation: regPassword2
      });
      // Auto login setelah register
      await api.post('/auth/login', { email: regEmail, password: regPassword });
      setRegLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setRegLoading(false);
      setRegError(err.response?.data?.message || 'Register gagal');
    }
  };

  return (
    <div style={{ position: 'fixed', zIndex: 9999, left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={showRegister ? handleRegister : handleLogin} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        <h2 style={{ marginBottom: 16 }}>{showRegister ? 'Register' : 'Login'}</h2>
        {showRegister ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nama</label>
              <input type="text" placeholder="Nama" value={regName} onChange={e => setRegName(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', color: '#222' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Email</label>
              <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', color: '#222' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Password</label>
              <input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', color: '#222' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Konfirmasi Password</label>
              <input type="password" placeholder="Konfirmasi Password" value={regPassword2} onChange={e => setRegPassword2(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', color: '#222' }} />
            </div>
            {regError && <div style={{ color: 'red', marginBottom: 8 }}>{regError}</div>}
            <button type="submit" disabled={regLoading} style={{ width: '100%', padding: 10, background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
              {regLoading ? 'Loading...' : 'Register'}
            </button>
            <button type="button" onClick={() => setShowRegister(false)} style={{ marginTop: 10, width: '100%', padding: 8, background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Kembali ke Login
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Email</label>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', color: '#222' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Password</label>
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', color: '#222' }} />
            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Loading...' : 'Login'}
            </button>
            <button type="button" onClick={() => setShowRegister(true)} style={{ marginTop: 10, width: '100%', padding: 8, background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
              Register
            </button>
            <button type="button" onClick={onClose} style={{ marginTop: 10, width: '100%', padding: 8, background: '#eee', color: '#222', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Batal
            </button>
          </>
        )}
      </form>
    </div>
  );
}
