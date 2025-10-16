import { useState } from 'react';
import api from '../api/index';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      // CSRF untuk Sanctum
      await api.get('/sanctum/csrf-cookie');

      const res = await api.post('/auth/register', form);
      setMessage('Registrasi berhasil!');
    } catch (err) {
      setMessage('Registrasi gagal. Coba lagi.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      {message && <p className="mb-2 text-sm">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Nama"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
          Daftar
        </button>
      </form>
    </div>
  );
}

export default Register;
