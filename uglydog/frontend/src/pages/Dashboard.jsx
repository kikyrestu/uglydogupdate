import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [phantomAddress, setPhantomAddress] = useState('')
  const [metamaskAddress, setMetamaskAddress] = useState('')

  const [editingWalletId, setEditingWalletId] = useState(null)
  const [editingWalletAddress, setEditingWalletAddress] = useState('')
  const [editingWalletProvider, setEditingWalletProvider] = useState('')

  const [updatedName, setUpdatedName] = useState('')
  const [updatedEmail, setUpdatedEmail] = useState('')
  const [updatedPassword, setUpdatedPassword] = useState('')
  const [updatedPasswordConfirm, setUpdatedPasswordConfirm] = useState('')

  const [showEditProfile, setShowEditProfile] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/users')
      .then(res => {
        setUser(res.data.data)
        setUpdatedName(res.data.data.name)
        setUpdatedEmail(res.data.data.email)
      })
      .catch(() => {
        setUser(null)
        navigate('/login')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = () => {
    api.post('/auth/logout')
      .then(() => navigate('/login'))
      .catch(err => {
        // Silently handle logout error
      })
  }

  const handleAddWallet = (e, provider) => {
    e.preventDefault()
    const address = provider === 'phantom' ? phantomAddress : metamaskAddress

    api.post('/auth/wallets', { provider, address })
      .then(() => {
        alert(`Wallet ${provider} berhasil ditambahkan`)
        window.location.reload()
      })
      .catch(err => {
        // Silently handle wallet addition error
      })
  }

  const handleEditWallet = (walletId) => {
    const wallet = user.wallets.find(w => w.id === walletId)
    if (wallet) {
      setEditingWalletId(wallet.id)
      setEditingWalletAddress(wallet.address)
      setEditingWalletProvider(wallet.provider)
    }
  }

  const handleSaveEditedWallet = (e) => {
    e.preventDefault()
    api.put('/auth/wallets', {
      wallet_id: editingWalletId,
      provider: editingWalletProvider,
      address: editingWalletAddress,
    }).then(() => {
      alert('Wallet berhasil diubah')
      window.location.reload()
    }).catch(err => {
      // Silently handle wallet update error
    })
  }
  const handleDeleteWallet = (walletId) => {
  if (!window.confirm('Yakin ingin menghapus wallet ini?')) return;

  api.delete(`/auth/wallets/${walletId}`)
    .then(() => {
      alert('Wallet berhasil dihapus')
      window.location.reload()
    })
    .catch(err => {
      alert('Gagal menghapus wallet')
    })
}


  const handleUpdateProfile = (e) => {
    e.preventDefault()
    api.put('/auth/update', {
      name: updatedName,
      email: updatedEmail,
      password: updatedPassword || undefined,
      password_confirmation: updatedPasswordConfirm || undefined,
    }).then(() => {
      alert('Profil berhasil diperbarui')
      window.location.reload()
    }).catch(err => {
      alert(err.response?.data?.message || 'Terjadi kesalahan')
    })
  }

  const hasPhantomWallet = user?.wallets?.some(w => w.provider === 'phantom')
  const hasMetamaskWallet = user?.wallets?.some(w => w.provider === 'metamask')

  if (loading) return <p className="text-gray-500">Loading...</p>
  if (!user) return <p className="text-red-500">Tidak ada data pengguna.</p>

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Logout
        </button>
      </div>

      {/* Profile Display */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold">Profile</h2>
        <p className="text-gray-600">ID: {user.id}</p>
        <p className="text-gray-600">Nama: {user.name}</p>
        <p className="text-gray-600">Email: {user.email}</p>
        <button
          onClick={() => setShowEditProfile(!showEditProfile)}
          className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-4 rounded"
        >
          {showEditProfile ? 'Tutup Form' : 'Ubah Profil'}
        </button>
      </div>

      {/* Edit Profile */}
      {showEditProfile && (
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold">Edit Profil</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-2">
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              placeholder="Nama baru"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              value={updatedEmail}
              onChange={(e) => setUpdatedEmail(e.target.value)}
              placeholder="Email baru"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              value={updatedPassword}
              onChange={(e) => setUpdatedPassword(e.target.value)}
              placeholder="Password baru (opsional)"
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              value={updatedPasswordConfirm}
              onChange={(e) => setUpdatedPasswordConfirm(e.target.value)}
              placeholder="Konfirmasi password"
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Simpan Profil
            </button>
          </form>
        </div>
      )}

      {/* Wallet List */}
      <div className="bg-white p-4 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold">Wallets</h2>
        {user.wallets?.length > 0 ? (
          <ul className="list-disc pl-4 space-y-2">
            {user.wallets.map((wallet) => (
  <li key={wallet.id} className="text-gray-600">
    <div className="flex items-center justify-between">
      <span>
        Wallet ID: {wallet.id} | {wallet.provider} | {wallet.address}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => handleEditWallet(wallet.id)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
        >
          Ubah
        </button>
        <button
          onClick={() => handleDeleteWallet(wallet.id)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
        >
          Hapus
        </button>
      </div>
    </div>
  </li>
))}

          </ul>
        ) : <p className="text-gray-500">Tidak ada wallet</p>}
      </div>

      {/* Edit Wallet */}
      {editingWalletId && (
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold">Edit Wallet</h2>
          <form onSubmit={handleSaveEditedWallet} className="space-y-2">
            <p className="text-gray-600">Provider: {editingWalletProvider}</p>
            <input
              type="text"
              value={editingWalletAddress}
              onChange={(e) => setEditingWalletAddress(e.target.value)}
              placeholder="Alamat Wallet Baru"
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Simpan Wallet
            </button>
          </form>
        </div>
      )}

      {/* Tambah Phantom */}
      {!hasPhantomWallet && (
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold">Tambah Wallet Phantom</h2>
          <form onSubmit={(e) => handleAddWallet(e, 'phantom')} className="space-y-2">
            <input
              type="text"
              value={phantomAddress}
              onChange={(e) => setPhantomAddress(e.target.value)}
              placeholder="Alamat Phantom Wallet"
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Tambah Wallet
            </button>
          </form>
        </div>
      )}

      {/* Tambah Metamask */}
      {!hasMetamaskWallet && (
        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold">Tambah Wallet Metamask</h2>
          <form onSubmit={(e) => handleAddWallet(e, 'metamask')} className="space-y-2">
            <input
              type="text"
              value={metamaskAddress}
              onChange={(e) => setMetamaskAddress(e.target.value)}
              placeholder="Alamat Metamask Wallet"
              className="w-full p-2 border rounded"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Tambah Wallet
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
