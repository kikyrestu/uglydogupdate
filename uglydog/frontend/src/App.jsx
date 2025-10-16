import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Login from './pages/Login';
import GameProfile from './pages/GameProfile';
import GameSession from './pages/GameSession';
import UglyDogGameLayout from './UglyDogGameLayout';

function App() {
  useEffect(() => {
    const isTracked = localStorage.getItem('visitorTracked');

    if (!isTracked) {
      fetch('http://localhost:8000/api/visitor/track', {
        method: 'POST',
      })
        .then(() => {
          localStorage.setItem('visitorTracked', 'yes');
        })
        .catch(err => {
          // Silently handle tracking errors
        });
    }

    fetch('http://localhost:8000/api/visitor/total')
      .then(res => res.json())
      .then(data => {
        // Silently handle visitor count
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/game/profile" element={<GameProfile />} />
        <Route path="/game" element={<GameSession />} />
        <Route path="/ugly-dog-game" element={<UglyDogGameLayout />} />
        <Route path="/uglydog" element={<UglyDogGameLayout />} />
        {/* Tambah route lain di sini */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

