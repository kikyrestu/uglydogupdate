import React, { useState, useEffect } from 'react';
import api from '../api';

const GameSession = () => {
  const [gameData, setGameData] = useState({
    // Data untuk game log
    session_score: 0,
    savepoint_score: 0,
    misses: 0,
    play_duration: 0,
    bonus_collected: [],
    signature: '',
    
    // Data untuk game profile
    total_score: 0,
    best_session: 0,
    total_sessions: 0,
    current_savepoint: 0,
    achievements: []
  });
  
  const [profile, setProfile] = useState(null);
  const [bonusInput, setBonusInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load profile data saat komponen dimuat
  useEffect(() => {
    const fetchGameProfile = async () => {
      try {
        const response = await api.get('/auth/game');
        setProfile(response.data);
        
        // Set nilai awal dari profile
        setGameData(prev => ({
          ...prev,
          total_score: response.data.total_score,
          best_session: response.data.best_session,
          total_sessions: response.data.total_sessions,
          current_savepoint: response.data.current_savepoint,
          achievements: response.data.achievements || []
        }));
      } catch (err) {
        setError('Gagal memuat profil game: ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    };

    fetchGameProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGameData(prev => ({
      ...prev,
      [name]: name.endsWith('_score') || 
              name === 'misses' || 
              name === 'play_duration' ||
              name === 'total_score' ||
              name === 'best_session' ||
              name === 'total_sessions' ||
              name === 'current_savepoint'
              ? parseInt(value, 10) || 0
              : value
    }));
  };

  const handleBonusAdd = () => {
    if (bonusInput.trim()) {
      setGameData(prev => ({
        ...prev,
        bonus_collected: [...prev.bonus_collected, bonusInput.trim()]
      }));
      setBonusInput('');
    }
  };

  const handleAchievementAdd = () => {
    if (achievementInput.trim()) {
      setGameData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()]
      }));
      setAchievementInput('');
    }
  };

  const handleBonusRemove = (index) => {
    const newBonuses = [...gameData.bonus_collected];
    newBonuses.splice(index, 1);
    setGameData(prev => ({
      ...prev,
      bonus_collected: newBonuses
    }));
  };

  const handleAchievementRemove = (index) => {
    const newAchievements = [...gameData.achievements];
    newAchievements.splice(index, 1);
    setGameData(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/game/saved', gameData);
      setSuccess(true);
      setProfile(response.data.profile);
      
      // Reset hanya data sesi, pertahankan data profil
      setGameData(prev => ({
        ...prev,
        session_score: 0,
        savepoint_score: 0,
        misses: 0,
        play_duration: 0,
        bonus_collected: [],
        signature: ''
      }));
    } catch (err) {
      setError('Gagal mencatat sesi permainan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
        <p>Profil game tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sesi Permainan & Profil</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">
          Sesi permainan berhasil dicatat dan profil diperbarui!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bagian Sesi Permainan */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Data Sesi Permainan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Skor Sesi *</label>
              <input
                type="number"
                name="session_score"
                value={gameData.session_score}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Skor Savepoint</label>
              <input
                type="number"
                name="savepoint_score"
                value={gameData.savepoint_score}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Jumlah Miss</label>
              <input
                type="number"
                name="misses"
                value={gameData.misses}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Durasi Bermain (detik)</label>
              <input
                type="number"
                name="play_duration"
                value={gameData.play_duration}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Bonus yang Dikumpulkan</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={bonusInput}
                  onChange={(e) => setBonusInput(e.target.value)}
                  placeholder="Tambah bonus baru"
                  className="flex-grow px-4 py-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleBonusAdd()}
                />
                <button
                  type="button"
                  onClick={handleBonusAdd}
                  className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
                >
                  Tambah
                </button>
              </div>
              
              {gameData.bonus_collected.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded">
                  {gameData.bonus_collected.map((bonus, index) => (
                    <div key={index} className="flex items-center bg-white border border-gray-200 px-3 py-1 rounded shadow-sm">
                      <span>{bonus}</span>
                      <button
                        type="button"
                        onClick={() => handleBonusRemove(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Signature (Opsional)</label>
              <textarea
                name="signature"
                value={gameData.signature}
                onChange={handleInputChange}
                rows="3"
                placeholder="Tanda tangan digital untuk validasi"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Bagian Profil Game */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Profil Game</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Total Skor</label>
              <input
                type="number"
                name="total_score"
                value={gameData.total_score}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Sesi Terbaik</label>
              <input
                type="number"
                name="best_session"
                value={gameData.best_session}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Total Sesi</label>
              <input
                type="number"
                name="total_sessions"
                value={gameData.total_sessions}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Savepoint Saat Ini</label>
              <input
                type="number"
                name="current_savepoint"
                value={gameData.current_savepoint}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Achievements</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={achievementInput}
                  onChange={(e) => setAchievementInput(e.target.value)}
                  placeholder="Tambah achievement baru"
                  className="flex-grow px-4 py-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAchievementAdd()}
                />
                <button
                  type="button"
                  onClick={handleAchievementAdd}
                  className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
                >
                  Tambah
                </button>
              </div>
              
              {gameData.achievements.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded">
                  {gameData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center bg-white border border-gray-200 px-3 py-1 rounded shadow-sm">
                      <span>{achievement}</span>
                      <button
                        type="button"
                        onClick={() => handleAchievementRemove(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </div>
          ) : (
            'Simpan Sesi & Perbarui Profil'
          )}
        </button>
      </form>
      
      {/* Tampilkan Profil Terkini */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Profil Terkini</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Total Skor</p>
            <p className="text-2xl font-bold">{profile.total_score}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Sesi Terbaik</p>
            <p className="text-2xl font-bold">{profile.best_session}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Total Sesi</p>
            <p className="text-2xl font-bold">{profile.total_sessions}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Savepoint</p>
            <p className="text-2xl font-bold">{profile.current_savepoint}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession;