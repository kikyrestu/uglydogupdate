import React, { useState, useEffect } from 'react';
import api from '../api';

const GameProfile = () => {
  const [profile, setProfile] = useState({
    total_score: 0,
    best_session: 0,
    total_sessions: 0,
    current_savepoint: 0,
    last_play_date: '',
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [achievementInput, setAchievementInput] = useState('');

  useEffect(() => {
    const fetchGameProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/game');
        const data = response.data.data;

        setProfile({
          ...data,
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
        });

        setError(null);
      } catch (err) {
        setError('Gagal memuat profil game: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchGameProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: ['current_savepoint', 'total_score', 'best_session', 'total_sessions'].includes(name)
        ? parseInt(value, 10)
        : value
    }));
  };

  const handleAchievementAdd = () => {
    if (achievementInput.trim()) {
      const newAchievements = [...profile.achievements, achievementInput.trim()];
      setProfile(prev => ({
        ...prev,
        achievements: newAchievements
      }));
      setAchievementInput('');
    }
  };

  const handleAchievementRemove = (index) => {
    const newAchievements = [...profile.achievements];
    newAchievements.splice(index, 1);
    setProfile(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/game/profile', profile);
      setEditMode(false);
      setError(null);

      const response = await api.get('/auth/game');
      const data = response.data.data;

      setProfile({
        ...data,
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
      });
    } catch (err) {
      setError('Gagal memperbarui profil: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profil Game</h2>
        {!editMode && (
          <button 
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Edit Profil
          </button>
        )}
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['total_score', 'best_session', 'total_sessions', 'current_savepoint'].map(field => (
              <div key={field}>
                <label className="block text-gray-700 mb-2">{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input
                  type="number"
                  name={field}
                  value={profile[field]}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Terakhir Bermain</label>
              <input
                type="date"
                name="last_play_date"
                value={profile.last_play_date || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Achievements</label>
            <div className="flex mb-2">
              <input
                type="text"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                placeholder="Tambah achievement baru"
                className="flex-grow px-4 py-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAchievementAdd())}
              />
              <button
                type="button"
                onClick={handleAchievementAdd}
                className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
              >
                Tambah
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded">
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
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Simpan Perubahan
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Total Skor', value: profile.total_score, color: 'blue' },
              { label: 'Sesi Terbaik', value: profile.best_session, color: 'green' },
              { label: 'Total Sesi', value: profile.total_sessions, color: 'purple' },
              { label: 'Savepoint Saat Ini', value: profile.current_savepoint, color: 'yellow' }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{item.label}</h3>
                <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Terakhir Bermain</h3>
            <p className="text-xl">
              {profile.last_play_date 
                ? new Date(profile.last_play_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Belum pernah bermain'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Achievements</h3>
            {profile.achievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <span className="font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4">Belum ada achievements</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameProfile;
