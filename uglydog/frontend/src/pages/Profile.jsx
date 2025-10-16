import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [data, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/users')
      .then(res => setUser(res.data))
      .catch(() => {
        setUser(null)
        navigate('/login') // redirect ke login jika tidak login
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = () => {
    api.post('/auth/logout')
      .then(() => {
        navigate('/login')
      })
      .catch(err => {
        // Silently handle logout error
      })
  }

  if (data) {
    return (
      <div>
      <h1>Profile</h1>
      <p>Nama: {data.user.name}</p>
      <p>Email: {data.user.email}</p>
      <h2>Wallets</h2>
      {data.user.wallets && data.user.wallets.length > 0 ? (
        <ul>
        {data.user.wallets.map((wallet, idx) => (
          <li key={idx}>{JSON.stringify(wallet)}</li>
        ))}
        </ul>
      ) : (
        <p>Tidak ada wallet</p>
      )}
      <h2>Score Users</h2>
      {data.user.score_users && data.user.score_users.length > 0 ? (
        <ul>
        {data.user.score_users.map((score, idx) => (
          <li key={score.id}>
          Season: {score.season?.nama || '-'}, Total Score: {score.total_score}
          </li>
        ))}
        </ul>
      ) : (
        <p>Tidak ada score</p>
      )}
      <h2>Tasks</h2>
      {data.user.tasks && data.user.tasks.length > 0 ? (
        <ul>
        {data.user.tasks.map((task) => (
          <li key={task.id}>
          <strong>{task.judul}</strong> - {task.deskripsi} <br />
          Tipe: {task.tipe}, Score: {task.score}, Status: {task.pivot?.status}
          </li>
        ))}
        </ul>
      ) : (
        <p>Tidak ada task</p>
      )}
      <button onClick={handleLogout}>Logout</button>
      </div>
    )
  }

  if (loading) return <p>Loading...</p>
  if (!data) return null

  return (
    <div>
      <p>Nama: </p>
      <h1>Dashboard</h1>
      {/* <p>Data users: {JSON.stringify(user)}</p> */}
      <p>Profile</p>
      
    </div>
  )
}

