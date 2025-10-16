import { useState } from "react"
import api from '@/api' // pastikan path ini sesuai (misalnya /src/api/index.js)
import Link from "next/link"

export default function PopupBid({ isConnect, handleConnect }) {
    const [tab, setTab] = useState('login')
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [wallet, setWallet] = useState('')
    const [error, setError] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            await api.get('/sanctum/csrf-cookie')
    
            const res = await api.post('/auth/login', {
                email: loginEmail,
                password: loginPassword
            })
    
            // Simpan token atau tanda login
            localStorage.setItem('token', 'true') // atau res.data.token kalau pakai bearer
    
            // Tutup popup
            handleConnect()
    
            // Refresh halaman agar header ter-update
            window.location.reload()
            
        } catch (err) {
            setError('Login gagal. Cek email/password atau backend.')
        }
    }    

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(null)
        try {
            await api.get('/sanctum/csrf-cookie')
            await api.post('/auth/register', {
                name: regName,
                email: regEmail,
                password: regPassword,
                // wallet: wallet, // jika backend menerima field wallet
            })
            handleConnect()
        } catch (err) {
            setError('Registrasi gagal')
        }
    }

    return (
        <>
            <div className={`modal fade popup ${isConnect ? "d-block show" : ""}`} id="popup_bid" tabIndex={-1} role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="close icon" onClick={handleConnect} aria-label="Close">
                            <img src="/assets/images/backgroup/bg_close.png" alt="Close" />
                        </div>

                        <div className="header-popup text-center">
                            <div className="tab-header">
                                <button
                                    className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
                                    onClick={() => setTab('login')}
                                >Login</button>
                                <button
                                    className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
                                    onClick={() => setTab('register')}
                                >Register</button>
                            </div>
                        </div>

                        <div className="modal-body center">
                            {error && <div className="text-red-500 mb-2">{error}</div>}
                            {tab === 'login' ? (
                                <form className="form-auth" onSubmit={handleLogin}>
                                    <div className="form-group">
                                        <label htmlFor="loginEmail">Email</label>
                                        <input type="email" className="form-control" id="loginEmail" placeholder="Enter email"
                                            value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="loginPassword">Password</label>
                                        <input type="password" className="form-control" id="loginPassword" placeholder="Enter password"
                                            value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                                    </div>
                                    <button type="submit" className="tf-button style2 w-full mt-3">Login</button>
                                </form>
                            ) : (
                                <form className="form-auth" onSubmit={handleRegister}>
                                    <div className="form-group">
                                        <label htmlFor="regName">Full Name</label>
                                        <input type="text" className="form-control" id="regName" placeholder="Enter name"
                                            value={regName} onChange={e => setRegName(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="regEmail">Email</label>
                                        <input type="email" className="form-control" id="regEmail" placeholder="Enter email"
                                            value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="regPassword">Password</label>
                                        <input type="password" className="form-control" id="regPassword" placeholder="Enter password"
                                            value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                                    </div>
                                    <button type="submit" className="tf-button style2 w-full mt-3">Register</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isConnect &&
                <div className="modal-backdrop fade show" onClick={handleConnect} />
            }
        </>
    )
}