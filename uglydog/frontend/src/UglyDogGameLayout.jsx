import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './UglyDogGameLayout.module.css';
import api from './api'; // Import dari folder, otomatis resolve ke index.js
import LoginModal from './LoginModal';

// Level system based on score - SIMPLE & COMPETITIVE!
const GAME_LEVELS = [
  { level: 1, name: 'Easy', minScore: 0, maxScore: 49, color: '#86FF00', difficulty: 'Beginner' },
  { level: 2, name: 'Easy', minScore: 50, maxScore: 99, color: '#86FF00', difficulty: 'Easy' },
  { level: 3, name: 'Easy+', minScore: 100, maxScore: 149, color: '#86FF00', difficulty: 'Easy Plus' },
  { level: 4, name: 'Medium', minScore: 150, maxScore: 199, color: '#fbbf24', difficulty: 'Medium' },
  { level: 5, name: 'Medium', minScore: 200, maxScore: 299, color: '#fbbf24', difficulty: 'Medium+' },
  { level: 6, name: 'Medium+', minScore: 300, maxScore: 399, color: '#fbbf24', difficulty: 'Challenging' },
  { level: 7, name: 'Hard', minScore: 400, maxScore: 599, color: '#ef4444', difficulty: 'Hard' },
  { level: 8, name: 'Hard+', minScore: 600, maxScore: 799, color: '#ef4444', difficulty: 'Very Hard' },
  { level: 9, name: 'Expert', minScore: 800, maxScore: 999, color: '#ef4444', difficulty: 'Expert' },
  { level: 10, name: 'Ultimate', minScore: 1000, maxScore: Infinity, color: '#8b5cf6', difficulty: 'Ultimate' }
];

// Ganti endpoint leaderboard di sini (dev/prod)
const LEADERBOARD_ENDPOINT = '/api/leaderboard/dev-daily'; // ganti ke '/api/leaderboard/daily' untuk production

export default function UglyDogGameLayout() {
  // --- Game State ---
  const [gameState, setGameState] = useState({
    score: 0,
    misses: 0,
    health: 3,
    gameActive: false,
    highestScore: 0,
    level: 1
  });
  const [dogPosition, setDogPosition] = useState({ x: 50, y: 50 });
  const [dogClickable, setDogClickable] = useState(true);
  const [dogTimeoutState, setDogTimeoutState] = useState(false);
  const [levelUpBreak, setLevelUpBreak] = useState(false);
  const [breakCountdown, setBreakCountdown] = useState(0);
  const [previousLevel, setPreviousLevel] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showMissAlert, setShowMissAlert] = useState(false); // State untuk alert miss
  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- Timer Refs ---
  const autoMissTimerRef = useRef(null);
  const levelUpBreakTimerRef = useRef(null);
  const spawnUglyDogRef = useRef(() => {});

  // --- Level & Difficulty ---
  const getCurrentLevel = useCallback(() => {
    for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
      if (gameState.score >= GAME_LEVELS[i].minScore) {
        return GAME_LEVELS[i];
      }
    }
    return GAME_LEVELS[0];
  }, [gameState.score]);
  const currentLevel = getCurrentLevel();

  const getDifficultySettings = useCallback(() => {
    const level = currentLevel.level;
    if (level <= 4) {
      return { spawnDelay: 2000, autoMissTimer: 2000 };
    } else if (level === 5) {
      return { spawnDelay: 1500, autoMissTimer: 1500 };
    } else if (level >= 6 && level <= 8) {
      return { spawnDelay: 1000, autoMissTimer: 1000 };
    } else if (level === 9) {
      return { spawnDelay: 900, autoMissTimer: 900 };
    } else {
      return { spawnDelay: 850, autoMissTimer: 850 };
    }
  }, [currentLevel.level]);

  // --- Game Logic ---
  const clearAllTimers = useCallback(() => {
    if (autoMissTimerRef.current) {
      clearTimeout(autoMissTimerRef.current);
      autoMissTimerRef.current = null;
    }
    if (levelUpBreakTimerRef.current) {
      clearInterval(levelUpBreakTimerRef.current);
      levelUpBreakTimerRef.current = null;
    }
  }, []);

  // --- Leaderboard dari Backend ---
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.get(LEADERBOARD_ENDPOINT);
      setLeaderboard(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setLeaderboard([]);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // --- Kirim skor ke backend saat game over ---
  const saveScoreToBackend = async (score) => {
    try {
      await api.post('/auth/game/saved', { session_score: score });
      fetchLeaderboard(); // Refresh leaderboard setelah submit skor
    } catch (err) {
      }
  };

  const stopGame = useCallback(() => {
    // Kirim skor ke backend jika game over dan user login
    if (gameState.score > 0 && isLoggedIn) {
      saveScoreToBackend(gameState.score);
    }
    clearAllTimers();
    setGameState(prev => ({
      ...prev,
      gameActive: false,
      score: 0,
      misses: 0,
      health: 3,
      level: 1,
      highestScore: Math.max(prev.score, prev.highestScore)
    }));
    setDogClickable(false);
    setDogTimeoutState(false);
    setLevelUpBreak(false);
    setBreakCountdown(0);
  }, [clearAllTimers, isLoggedIn, gameState.score]);

  // --- Dog Spawn ---
  const handleAutoMiss = useCallback(() => {
    // Tambahan: Cek apakah dog sudah diklik
    if (!gameState.gameActive || levelUpBreak || !dogActiveRef.current) return;
    clearAllTimers();
    setDogClickable(false);
    setDogTimeoutState(true);
    setShowMissAlert(true); // Tampilkan alert miss
    setTimeout(() => setShowMissAlert(false), 600); // Hilangkan alert setelah 600ms
    setGameState(prev => {
      const newMisses = prev.misses + 1;
      let newHealth = prev.health;
      let newScore = prev.score;
      if (newMisses >= 3) {
        newHealth = prev.health - 1;
        newScore = Math.max(0, prev.score - 10);
        if (newHealth <= 0) {
          stopGame();
          return { ...prev, misses: 0, health: 0, score: newScore };
        }
        return { ...prev, misses: 0, health: newHealth, score: newScore };
      } else {
        return { ...prev, misses: newMisses };
      }
    });
    setTimeout(() => {
      if (gameState.gameActive && !levelUpBreak) {
        spawnUglyDogRef.current();
      }
    }, getDifficultySettings().spawnDelay);
  }, [gameState.gameActive, levelUpBreak, clearAllTimers, stopGame, getDifficultySettings]);

  const dogActiveRef = useRef(false); // Tambahan: ref status dog aktif

  const spawnUglyDog = useCallback(() => {
    if (!gameState.gameActive || levelUpBreak) return;
    // Random position
    const level = currentLevel.level;
    let xRange, yRange, xOffset, yOffset;
    if (level <= 2) {
      xRange = 40; yRange = 40; xOffset = 30; yOffset = 30;
    } else if (level <= 5) {
      xRange = 50; yRange = 50; xOffset = 25; yOffset = 25;
    } else {
      xRange = 60; yRange = 60; xOffset = 20; yOffset = 20;
    }
    const newX = Math.max(10, Math.min(90, Math.random() * xRange + xOffset));
    const newY = Math.max(10, Math.min(90, Math.random() * yRange + yOffset));
    setDogPosition({ x: newX, y: newY });
    setDogClickable(true);
    setDogTimeoutState(false);
    dogActiveRef.current = true; // Set dog aktif saat muncul
    // Set auto-miss timer
    if (autoMissTimerRef.current) clearTimeout(autoMissTimerRef.current);
    autoMissTimerRef.current = setTimeout(() => {
      handleAutoMiss();
    }, getDifficultySettings().autoMissTimer);
  }, [gameState.gameActive, currentLevel.level, levelUpBreak, getDifficultySettings, handleAutoMiss]);

  useEffect(() => {
    spawnUglyDogRef.current = spawnUglyDog;
  }, [spawnUglyDog]);

  // --- Level Up Break ---
  const startLevelUpBreak = useCallback((newLevel) => {
    clearAllTimers();
    setLevelUpBreak(true);
    setBreakCountdown(5);
    setDogClickable(false);
    let countdownRemaining = 5;
    levelUpBreakTimerRef.current = setInterval(() => {
      countdownRemaining--;
      setBreakCountdown(countdownRemaining);
      if (countdownRemaining <= 0) {
        clearInterval(levelUpBreakTimerRef.current);
        setLevelUpBreak(false);
        setBreakCountdown(0);
        if (gameState.gameActive) {
          spawnUglyDog();
        }
      }
    }, 1000);
  }, [clearAllTimers, spawnUglyDog, gameState.gameActive]);

  // --- Click Handler ---
  const handleUglyDogClick = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation(); // Cegah bubbling ke parent (miss)
    if (!gameState.gameActive || !dogClickable || levelUpBreak) return;
    clearAllTimers();
    setDogClickable(false);
    setDogTimeoutState(true);
    dogActiveRef.current = false; // Set dog sudah diklik, auto-miss tidak boleh jalan
    const newScore = gameState.score + 1;
    setGameState(prev => ({ ...prev, score: newScore }));
    // Level up check
    const newLevelForScore = GAME_LEVELS.find(level => newScore >= level.minScore && newScore <= level.maxScore) || GAME_LEVELS[GAME_LEVELS.length - 1];
    if (newLevelForScore.level > previousLevel) {
      setPreviousLevel(newLevelForScore.level);
      startLevelUpBreak(newLevelForScore.level);
      return;
    }
    setTimeout(() => {
      if (gameState.gameActive && !levelUpBreak) {
        spawnUglyDog();
      }
    }, 200);
  }, [gameState, dogClickable, levelUpBreak, previousLevel, startLevelUpBreak, spawnUglyDog, clearAllTimers]);

  // --- Miss Click Handler ---
  const handleMissClick = useCallback(() => {
    if (!gameState.gameActive || levelUpBreak) return;
    setShowMissAlert(true); // Tampilkan alert miss
    setTimeout(() => setShowMissAlert(false), 600); // Hilangkan alert setelah 600ms
    const newMisses = gameState.misses + 1;
    let newHealth = gameState.health;
    let newScore = gameState.score;
    if (newMisses >= 3) {
      newHealth = gameState.health - 1;
      newScore = Math.max(0, gameState.score - 10);
      if (newHealth <= 0) {
        stopGame();
        return;
      }
      setGameState(prev => ({ ...prev, misses: 0, health: newHealth, score: newScore }));
    } else {
      setGameState(prev => ({ ...prev, misses: newMisses }));
    }
  }, [gameState, stopGame, levelUpBreak]);

  // --- Start Game ---
  const startGame = () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    clearAllTimers();
    setGameState(prev => ({
      ...prev,
      gameActive: true,
      score: 0,
      misses: 0,
      health: 3,
      level: 1
    }));
    setPreviousLevel(1);
    setDogClickable(true);
    setDogTimeoutState(false);
    setLevelUpBreak(false);
    setBreakCountdown(0);
    setTimeout(() => {
      spawnUglyDog();
    }, 1000);
  };

  // --- Login persistence via backend ---
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await api.get('/auth/me');
        setIsLoggedIn(true);
      } catch (err) {
          setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  // Handler untuk login modal sukses
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Tidak perlu localStorage
  };    

  // Handler logout
  const handleLogout = async () => {
    setIsLoggedIn(false);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Silently handle logout error
    }
    setGameState(prev => ({ ...prev, gameActive: false, score: 0, misses: 0, health: 3, level: 1 }));
    setPreviousLevel(1);
    setDogClickable(false);
    setDogTimeoutState(false);
    setLevelUpBreak(false);
    setBreakCountdown(0);
  };

  // --- Render ---
  return (
    <div className={styles['uglydog-layout-root']}>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} />
      {/* Header */}
      <header className={styles['header']}>
        <h1>UglyDog Clicker</h1>
        <span className={styles['tagline']}>
          Fast. Fun. Competitive. Can you beat the leaderboard?
        </span>
        {isLoggedIn && (
          <button onClick={handleLogout} style={{ marginLeft: 24, padding: '6px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', float: 'right' }}>
            Logout
          </button>
        )}
      </header>
      <main className={styles['main-grid']}>
        {/* Game Area */}
        <section className={styles['game-area']}>
          <div className={styles['game-canvas']} onClick={handleMissClick}>
            {showMissAlert && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '30%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,0,0,0.85)',
                color: '#fff',
                borderRadius: 12,
                padding: '16px 32px',
                fontSize: 28,
                fontWeight: 'bold',
                zIndex: 100
              }}>
                MISS!
              </div>
            )}
            {gameState.gameActive ? (
              <>
                {/* Health Hearts */}
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 4 }}>
                  {[1, 2, 3].map((h) => (
                    <span key={h} style={{ color: h <= gameState.health ? '#ef4444' : '#444', fontSize: 22 }}>♥</span>
                  ))}
                </div>
                {/* Score & Level */}
                <div style={{ position: 'absolute', top: 10, right: 10, color: currentLevel.color, fontWeight: 'bold' }}>
                  Score: {gameState.score} | Level: {currentLevel.level} ({currentLevel.difficulty})
                </div>
                {/* Miss Counter */}
                <div style={{ position: 'absolute', bottom: 10, left: 10, color: '#fbbf24', fontWeight: 'bold' }}>
                  Miss: {gameState.misses}/3
                </div>
                {/* UglyDog */}
                {!levelUpBreak && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${dogPosition.x}%`,
                      top: `${dogPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: dogClickable ? 'pointer' : 'not-allowed',
                      opacity: dogTimeoutState ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                      zIndex: 10
                    }}
                    onClick={dogClickable ? handleUglyDogClick : undefined}
                  >
                    <img src="/src/assets/uglydog-original.png" alt="UglyDog" style={{ width: 60, height: 60, userSelect: 'none', pointerEvents: 'none' }} />
                  </div>
                )}
                {/* Level Up Break Popup */}
                {levelUpBreak && (
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.85)',
                    color: '#fff',
                    borderRadius: 16,
                    padding: 32,
                    zIndex: 99,
                    textAlign: 'center',
                    minWidth: 200
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎉 LEVEL UP!</div>
                    <div style={{ fontSize: 18, color: currentLevel.color, marginBottom: 8 }}>Level {currentLevel.level}</div>
                    <div style={{ fontSize: 14, marginBottom: 8 }}>Break time: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{breakCountdown}</span></div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                  {gameState.health <= 0 ? 'Game Over!' : 'UglyDog Clicker'}
                </div>
                <div style={{ fontSize: 16, marginBottom: 15 }}>
                  {gameState.health <= 0 ? `Final Score: ${gameState.score}` : 'Ready to start?'}
                </div>
                <button onClick={startGame} className={styles['start-button']} style={{ fontSize: 16, padding: '10px 24px', background: '#86FF00', color: '#222', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                  Start Game
                </button>
              </div>
            )}
          </div>
        </section>
        {/* Sidebar */}
        <aside className={styles['sidebar']}>
          <div className={styles['leaderboard']} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 20, marginBottom: 24 }}>
            <h3 className={styles['leaderboard-title']} style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6', marginBottom: 12, letterSpacing: 1 }}>Leaderboard</h3>
            <div style={{ minHeight: 180 }}>
              {leaderboard.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 14 }}>Belum ada data leaderboard</div>
              ) : (
                leaderboard.map((player, idx) => {
                  const isTop3 = idx < 3;
                  const isCurrentUser = player.user_id === (window?.UGLYDOG_USER_ID || null);
                  let trophy = null;
                  if (idx === 0) trophy = (
                    <svg className={`${styles['trophy-icon']} ${styles['trophy-gold']}`} viewBox="0 0 24 24"><path d="M12 2c-1.1 0-2 .9-2 2v2H7c-.6 0-1 .4-1 1v2c0 3.3 2.7 6 6 6s6-2.7 6-6V7c0-.6-.4-1-1-1h-3V4c0-1.1-.9-2-2-2zm0 2h2v2h-4V4h2zm-5 3h2v2c0 2.2 1.8 4 4 4s4-1.8 4-4V7h2v2c0 3.3-2.7 6-6 6s-6-2.7-6-6V7zm5 13c-2.2 0-4-1.8-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.2-1.8 4-4 4z"/></svg>
                  );
                  else if (idx === 1) trophy = (
                    <svg className={`${styles['trophy-icon']} ${styles['trophy-silver']}`} viewBox="0 0 24 24"><path d="M12 2c-1.1 0-2 .9-2 2v2H7c-.6 0-1 .4-1 1v2c0 3.3 2.7 6 6 6s6-2.7 6-6V7c0-.6-.4-1-1-1h-3V4c0-1.1-.9-2-2-2zm0 2h2v2h-4V4h2zm-5 3h2v2c0 2.2 1.8 4 4 4s4-1.8 4-4V7h2v2c0 3.3-2.7 6-6 6s-6-2.7-6-6V7zm5 13c-2.2 0-4-1.8-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.2-1.8 4-4 4z"/></svg>
                  );
                  else if (idx === 2) trophy = (
                    <svg className={`${styles['trophy-icon']} ${styles['trophy-bronze']}`} viewBox="0 0 24 24"><path d="M12 2c-1.1 0-2 .9-2 2v2H7c-.6 0-1 .4-1 1v2c0 3.3 2.7 6 6 6s6-2.7 6-6V7c0-.6-.4-1-1-1h-3V4c0-1.1-.9-2-2-2zm0 2h2v2h-4V4h2zm-5 3h2v2c0 2.2 1.8 4 4 4s4-1.8 4-4V7h2v2c0 3.3-2.7 6-6 6s-6-2.7-6-6V7zm5 13c-2.2 0-4-1.8-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.2-1.8 4-4 4z"/></svg>
                  );
                  return (
                    <div
                      key={player.user_id || idx}
                      className={[
                        styles['leaderboard-row'],
                        isTop3 ? styles['leaderboard-row--top'] : '',
                        isCurrentUser ? styles['leaderboard-row--me'] : ''
                      ].filter(Boolean).join(' ')}
                    >
                      <span>
                        {trophy} #{player.rank || idx + 1} <span style={{ fontWeight: 700 }}>{player.name || '-'}</span>
                      </span>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{player.best_session}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className={styles['player-stats']} style={{ background: '#f9fafb', borderRadius: 12, padding: 16, marginTop: 16, textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 18 }}>
              High Score: {gameState.highestScore}
            </div>
          </div>
        </aside>
      </main>
      {/* Footer */}
      <footer className={styles['footer']}>
        <span>© {new Date().getFullYear()} UglyDog Game. All rights reserved.</span>
      </footer>
    </div>
  );
}
