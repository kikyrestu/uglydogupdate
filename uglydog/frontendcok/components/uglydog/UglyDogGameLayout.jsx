'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './UglyDogGameLayout.module.css';
import api from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import NativeUglyDogGame from './NativeUglyDogGame';

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
  const [showMissAlert, setShowMissAlert] = useState(false);

  // Auth context
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();

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
    if (gameState.score > 0 && isAuthenticated) {
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
  }, [clearAllTimers, isAuthenticated, gameState.score]);

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
    if (!isAuthenticated) {
      router.push('/login');
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

  // --- Render ---
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;
  }

  return (
    <div className={styles['uglydog-layout-root']}>
      {/* Header */}
      <header className={styles['header']}>
        <h1>UglyDog Clicker</h1>
        <span className={styles['tagline']}>
          Fast. Fun. Competitive. Can you beat the leaderboard?
        </span>
      </header>
      <main className={styles['main-grid']}>
        <NativeUglyDogGame />
      </main>
    </div>
  );
}
