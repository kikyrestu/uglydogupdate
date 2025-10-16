"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api'

// Level system based on score - SIMPLE & COMPETITIVE! 
// Progression: +50 (level 1-4), +100 (level 5-7), +200 (level 8-9), unlimited (level 10+)
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
]

// SIMPLIFIED: No more trap system - pure UglyDog clicking game!
// Removed all trap-related constants for cleaner gameplay

export default function NativeUglyDogGame() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  // --- Miss Alert State ---
  const [showMissAlert, setShowMissAlert] = useState(false)
  const [gameState, setGameState] = useState({
    score: 0,
    misses: 0,
    health: 3,
    gameActive: false,
    highestScore: 0,
    level: 1
  })
  const [dogPosition, setDogPosition] = useState({ x: 50, y: 50 })
  const traps = []
  const [leaderboard, setLeaderboard] = useState([])
  const [gameStats, setGameStats] = useState({
    totalClicks: 0,
    accuracy: 100,
    gameTime: 0
  })
  const [currentDogId, setCurrentDogId] = useState(0)
  const [previousLevel, setPreviousLevel] = useState(1)
  const [dogClickable, setDogClickable] = useState(true)
  const [countdown, setCountdown] = useState(0)
  const [dogTimeoutState, setDogTimeoutState] = useState(false)
  const [levelUpBreak, setLevelUpBreak] = useState(false)
  const [breakCountdown, setBreakCountdown] = useState(0)
  
  // NEW: Mobile dropdown states
  const [showLeaderboardDropdown, setShowLeaderboardDropdown] = useState(false)
  const [showHowToPlayDropdown, setShowHowToPlayDropdown] = useState(false)
  
  // NEW: Game-only rotation state
  const [showGameRotationPrompt, setShowGameRotationPrompt] = useState(false)
  
  // NEW: Mini Interactive Preview state
  const [miniGameState, setMiniGameState] = useState({
    score: 0,
    dogPosition: { x: 50, y: 50 },
    showMiniGame: false
  })

  // --- Timer/interval refs for bulletproof cleanup ---
  const autoMissTimerRef = React.useRef(null)
  const countdownIntervalRef = React.useRef(null)
  const levelUpBreakTimerRef = React.useRef(null)
  const gameTimerRef = React.useRef(null)
  const currentDogIdRef = React.useRef(0)
  // --- NEW: Refs for state to avoid closure bugs in timeout ---
  const gameActiveRef = React.useRef(gameState.gameActive)
  const dogClickableRef = React.useRef(dogClickable)
  const levelUpBreakRef = React.useRef(levelUpBreak)

  // Keep refs in sync with state
  useEffect(() => { gameActiveRef.current = gameState.gameActive }, [gameState.gameActive])
  useEffect(() => { dogClickableRef.current = dogClickable }, [dogClickable])
  useEffect(() => { levelUpBreakRef.current = levelUpBreak }, [levelUpBreak])
  useEffect(() => { currentDogIdRef.current = currentDogId }, [currentDogId])

  // Get current level based on score
  const getCurrentLevel = useCallback(() => {
    for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
      if (gameState.score >= GAME_LEVELS[i].minScore) {
        return GAME_LEVELS[i]
      }
    }
    return GAME_LEVELS[0]
  }, [gameState.score])

  const currentLevel = getCurrentLevel()

  // NEW: Mini Interactive Preview Functions
  const spawnMiniDog = useCallback(() => {
    const x = Math.random() * 60 + 20 // 20-80% range
    const y = Math.random() * 40 + 30 // 30-70% range
    setMiniGameState(prev => ({
      ...prev,
      dogPosition: { x, y }
    }))
  }, [])

  const handleMiniDogClick = useCallback(() => {
    setMiniGameState(prev => ({
      ...prev,
      score: prev.score + 10
    }))
    spawnMiniDog()
  }, [spawnMiniDog])

  const startMiniGame = useCallback(() => {
    setMiniGameState(prev => ({
      ...prev,
      showMiniGame: true,
      score: 0
    }))
    spawnMiniDog()
  }, [spawnMiniDog])

  // Auto-spawn mini dog every 2 seconds
  useEffect(() => {
    if (miniGameState.showMiniGame) {
      const miniInterval = setInterval(spawnMiniDog, 2000)
      return () => clearInterval(miniInterval)
    }
  }, [miniGameState.showMiniGame, spawnMiniDog])

  // Block UI with loading state (auth not ready)
  if (loading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:24,color:'#86FF00',background:'#18181b'}}>Loading...</div>
    )
  }

  // 🚨 ULTRA-ISOLATED Break Popup Manager - IMMUNE FROM REACT LIFECYCLE!
  const showBreakPopup = useCallback((level, countdown) => {
    const timestamp = new Date().toISOString()
    const timeStart = Date.now()
    
    // 🖥️ TERMINAL DEBUG: Log popup creation to Next.js terminal
    // DEBUG LOGS REMOVED
    
    // 🔒 GLOBAL FLAG: Mark popup as protected from React cleanup
    window.UGLYDOG_BREAK_ACTIVE = true
    window.UGLYDOG_BREAK_START_TIME = timeStart
    
    // Remove any existing popup first - check both canvas and body
    const existingPopup = document.getElementById('level-up-break-portal')
    if (existingPopup) {
      if (existingPopup.parentNode) {
        existingPopup.parentNode.removeChild(existingPopup)
      }
      // DEBUG LOG REMOVED
    }

    // Create popup element directly in DOM - SECTION OVERLAY MODE!
    const popupContainer = document.createElement('div')
    popupContainer.id = 'level-up-break-portal'
    popupContainer.setAttribute('data-start-time', timeStart.toString())
    popupContainer.setAttribute('data-protected', 'true') // Mark as protected
    
    // Find the game canvas to position popup relative to it
    const gameCanvas = document.querySelector('.game-canvas')
    const gameContainer = document.querySelector('.native-uglydog-game')
    
    if (gameCanvas && gameContainer) {
      // Position popup INSIDE the game canvas section only
      const canvasRect = gameCanvas.getBoundingClientRect()
      const containerRect = gameContainer.getBoundingClientRect()
      
      popupContainer.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 50;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        animation: section-popup-in 0.3s ease-out;
        min-width: 200px;
        max-width: 220px;
        padding: 0;
      `
      
      // Insert popup directly into game canvas (not body!)
      gameCanvas.style.position = 'relative' // Ensure relative positioning
      gameCanvas.appendChild(popupContainer)
      
      // DEBUG LOG REMOVED
    } else {
      // Fallback to body if canvas not found - CLEAN BLUR VERSION
      popupContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        animation: section-popup-in 0.3s ease-out;
        min-width: 200px;
        max-width: 220px;
        padding: 0;
      `
      document.body.appendChild(popupContainer)
      // DEBUG LOG REMOVED
    }

    const popupContent = document.createElement('div')
    popupContent.style.cssText = `
      text-align: center;
      color: #ffffff;
      padding: 18px 16px;
      width: 100%;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    `

    popupContent.innerHTML = `
      <div style="font-size: 1.8rem; margin-bottom: 8px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🎉</div>
      <div style="font-size: 1rem; font-weight: bold; margin-bottom: 6px; color: #86FF00; text-shadow: 0 0 16px rgba(134, 255, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.7);">LEVEL UP!</div>
      <div style="font-size: 0.8rem; margin-bottom: 10px; opacity: 0.95; color: #ffffff; font-weight: 500;">Level ${level}</div>
      <div style="font-size: 0.7rem; margin-bottom: 8px; color: #fbbf24; opacity: 0.9; font-weight: 500;">Break time:</div>
      <div id="countdown-display" style="font-size: 1.8rem; font-weight: bold; color: #ef4444; text-shadow: 0 0 20px rgba(239, 68, 68, 0.9), 0 2px 8px rgba(0, 0, 0, 0.7);">${countdown}</div>
    `

    popupContainer.appendChild(popupContent)
    
    // Insert into canvas or body based on earlier logic
    if (gameCanvas) {
      // Already handled above
    } else {
      document.body.appendChild(popupContainer)
    }
    
    // DEBUG LOGS REMOVED
    
    return popupContainer
  }, [])

  // STANDALONE Break Popup Updater
  const updateBreakCountdown = useCallback((countdown) => {
    const countdownElement = document.getElementById('countdown-display')
    const popupElement = document.getElementById('level-up-break-portal')
    
    if (countdownElement && popupElement) {
      countdownElement.textContent = countdown
      
      // Get start time and calculate how long popup has been visible
      const startTime = parseInt(popupElement.getAttribute('data-start-time') || '0')
      const currentTime = Date.now()
      const elapsedMs = currentTime - startTime
      const elapsedSeconds = (elapsedMs / 1000).toFixed(1)
      
      // DEBUG LOG REMOVED
    } else {
      // DEBUG LOGS REMOVED
    }
  }, [])

  // 🚨 ULTRA-ISOLATED Break Popup Remover - PROTECTED FROM REACT
  const hideBreakPopup = useCallback(() => {
    // 🔒 CHECK GLOBAL PROTECTION FLAG
    const popupElement = document.getElementById('level-up-break-portal');
    if (!popupElement) {
      return;
    }
    // Smooth fade out animation before removal - QUICK AND CLEAN
    popupElement.style.animation = 'section-popup-out 0.2s ease-in forwards';
    setTimeout(() => {
      if (popupElement.parentNode) {
        popupElement.parentNode.removeChild(popupElement);
      }
      // 🔒 CLEAR GLOBAL PROTECTION FLAG
      window.UGLYDOG_BREAK_ACTIVE = false;
      window.UGLYDOG_BREAK_START_TIME = null;
      // ...
      // ...
    }, 200);
  }, [])

  // Clear all timers - ENHANCED UTILITY FUNCTION (MOVED UP TO FIX INITIALIZATION ERROR)
  const clearAllTimers = useCallback(() => {
    // ...
    // Clear auto-miss timer
    if (autoMissTimerRef.current) {
      clearTimeout(autoMissTimerRef.current)
      autoMissTimerRef.current = null
      // ...
    }
    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
      // ...
    }
    setCountdown(0)
    setTimeout(() => {
      // ...
    }, 10)
  }, [])

  // Separate function to clear ONLY break timer without affecting break state - STANDALONE VERSION
  const clearBreakTimer = useCallback(() => {
    // ...
    if (levelUpBreakTimerRef.current) {
      clearInterval(levelUpBreakTimerRef.current)
      levelUpBreakTimerRef.current = null
      // ...
    }
  }, [])

  // Full cleanup function for game stop/restart only - ENHANCED CLEANUP
  const clearAllTimersAndStates = useCallback(() => {
    // ...
    clearAllTimers()
    clearBreakTimer()
    setBreakCountdown(0)
    setLevelUpBreak(false)
    setDogClickable(false)
    setDogTimeoutState(false)
    setCountdown(0)
    hideBreakPopup()
    // ...
  }, [clearAllTimers, clearBreakTimer, hideBreakPopup])

  // Get game difficulty settings for SPAWN-DISAPPEAR MODE - SIMPLIFIED (No traps!)
  const getDifficultySettings = useCallback(() => {
    const level = currentLevel.level
    
    if (level <= 2) {
      return {
        spawnDelay: 2000,      // 2 seconds between spawns (easy)
        autoMissTimer: 5000,   // 5 seconds before disappear (forgiving)
        showCountdown: false   // No pressure countdown for beginners
      }
    } else if (level <= 4) {
      return {
        spawnDelay: 1800,      // 1.8 seconds between spawns
        autoMissTimer: 4000,   // 4 seconds before disappear
        showCountdown: true
      }
    } else if (level === 5) {
      return {
        spawnDelay: 1500,      // 1.5 seconds between spawns
        autoMissTimer: 2500,   // 2.5 seconds before disappear (getting challenging!)
        showCountdown: true
      }
    } else if (level >= 6) {
      return {
        spawnDelay: 800,       // 0.8 second between spawns (LIGHTNING FAST!)
        autoMissTimer: 700,    // 0.7 SECOND before disappear (INSANE REFLEXES REQUIRED!) 🔥💀
        showCountdown: true
      }
    } else {
      return {
        spawnDelay: 800,       // 0.8 second between spawns (ultimate challenge!)
        autoMissTimer: 700,    // 0.7 second before disappear (ULTIMATE SPEED!) ⚡⚡⚡
        showCountdown: true
      }
    }
  }, [currentLevel.level])

  // (HAPUS DEKLARASI DUPLIKAT spawnUglyDog DI SINI)

  // Handle auto-miss when UglyDog disappears - RACE CONDITION PROTECTED
  const handleAutoMiss = useCallback(() => {
    if (!gameActiveRef.current || !dogClickableRef.current || levelUpBreakRef.current) {
      return
    }
    if (!autoMissTimerRef.current) {
      return
    }
    clearAllTimers()
    setDogClickable(false)
    setDogTimeoutState(true)
    createTimeoutEffect(dogPosition.x, dogPosition.y)
    setGameState(prev => {
      const newMisses = prev.misses + 1
      let newHealth = prev.health
      let newScore = prev.score
      if (newMisses >= 3) {
        // ...
        newHealth = prev.health - 1
        newScore = Math.max(0, prev.score - 10)
        if (newHealth <= 0) {
          // ...
          stopGame()
          return { ...prev, misses: 0, health: 0, score: newScore }
        } else {
          // ...
        }
        return { ...prev, misses: 0, health: newHealth, score: newScore }
      } else {
        // ...
        return { ...prev, misses: newMisses }
      }
    })
    setGameStats(prev => ({
      ...prev,
      accuracy: Math.round((prev.totalClicks / (prev.totalClicks + (gameState.misses + 1))) * 100)
    }))
    const difficulty = getDifficultySettings()
    setTimeout(() => {
      if (gameActiveRef.current && !levelUpBreakRef.current) {
        if (typeof spawnUglyDog === 'function') {
          spawnUglyDog()
        }
      }
    }, difficulty.spawnDelay)
  }, [dogPosition, clearAllTimers, getDifficultySettings])

  // SIMPLIFIED: No more trap system - pure UglyDog clicking!

  // SPAWN-DISAPPEAR SYSTEM - UglyDog appears and disappears randomly!
  // Strict parity: spawnUglyDog logic from UglyDogGameLayout.jsx
  const spawnUglyDog = useCallback(() => {
    if (!gameState.gameActive || levelUpBreak) return;
    // IDENTICAL RANDOM LOGIC:
    // let x = Math.random() * 60 + 20; // 20-80%
    // let y = Math.random() * 50 + 25; // 25-75%
    const x = Math.random() * 60 + 20;
    const y = Math.random() * 50 + 25;
    const newDogPosition = { x, y };
    // --- DEBUG LOG: SPAWN UGLYDOG ---
    if (autoMissTimerRef.current) {
      clearTimeout(autoMissTimerRef.current);
      autoMissTimerRef.current = null;
    }
    setDogTimeoutState(false);
    setDogPosition(newDogPosition);
    setDogClickable(true);
    // dogActiveRef.current = true; // DIHAPUS, ga dipake bro
    setCountdown(0);
    const nextDogId = currentDogId + 1;
    setCurrentDogId(nextDogId);
    const difficulty_settings = getDifficultySettings();
    const disappearTime = difficulty_settings.autoMissTimer || 4000;
    const autoMissTimeoutId = setTimeout(() => {
      // Cek dogId snapshot pakai ref
      if (nextDogId !== currentDogIdRef.current) {
        // ...
        return
      }
      if (!gameActiveRef.current) {
        // ...
        return
      }
      if (!dogClickableRef.current) {
        // ...
        return
      }
      if (levelUpBreakRef.current) {
        // ...
        return
      }
      // ...
      handleAutoMiss()
    }, disappearTime)
    autoMissTimerRef.current = autoMissTimeoutId
    
    // ⚡ CLEANUP PROTECTION: Ensure timer cleanup on unmount
    return () => {
      if (autoMissTimeoutId) {
        clearTimeout(autoMissTimeoutId)
        // ...
      }
    }

  }, [gameState.gameActive, dogClickable, getDifficultySettings, currentLevel.level, levelUpBreak, handleAutoMiss])

  // Start level-up break sequence - STANDALONE POPUP VERSION
  const startLevelUpBreak = useCallback((newLevel) => {
    // ...
    // ...
    
    // Clear game timers but NOT break states!
    clearAllTimers()
    
    // Enable break mode IMMEDIATELY
    setLevelUpBreak(true)
    setBreakCountdown(5)
    setDogClickable(false)
    
    // ...
    
    // Show standalone popup immediately
    showBreakPopup(newLevel, 5)
    
    // SIMPLE TIMER: No complex state management, just direct DOM updates
    let countdownRemaining = 5
    let timerActive = true // Prevent external clearing
    const timerStartTime = Date.now()
    
    // ...
    // ...
    
    const countdownTimer = setInterval(() => {
      if (!timerActive) {
        const stopTime = Date.now()
        const elapsedMs = stopTime - timerStartTime
        // ...
        return
      }

      countdownRemaining--
      const currentTime = Date.now()
      const elapsedMs = currentTime - timerStartTime
      const elapsedSeconds = (elapsedMs / 1000).toFixed(1)

      // ...

      // Update countdown in DOM directly (no React state conflicts!)
      updateBreakCountdown(countdownRemaining)

      if (countdownRemaining <= 0) {
        const endTime = Date.now()
        const totalElapsedMs = endTime - timerStartTime
        const totalElapsedSeconds = (totalElapsedMs / 1000).toFixed(1)

        // ...
        // ...

        timerActive = false
        clearInterval(countdownTimer)

        // Hide popup dulu, abis itu baru set state supaya ga race condition
        hideBreakPopup()
        setTimeout(() => {
          setLevelUpBreak(false)
          setBreakCountdown(0)
          // 🚨 FIX: Reset dogClickable to true INSIDE spawnUglyDog, not di sini
          if (gameState.gameActive) {
            spawnUglyDog()
          }
        }, 350) // kasih jeda biar animasi popup ilang dulu
      }
    }, 1000)
    
    // Store break timer in ref for cleanup
    levelUpBreakTimerRef.current = countdownTimer
  }, [clearAllTimers, spawnUglyDog, showBreakPopup, updateBreakCountdown, hideBreakPopup, getDifficultySettings, currentLevel, gameState.gameActive, handleAutoMiss, getCurrentLevel])

  // REMOVED: useEffect level detection to prevent double triggering
  // Level up detection now only happens in handleUglyDogClick for immediate response

  // PURE INSTANT MODE: No auto-miss system - pure clicking speed challenge!
  // Players can take their time, focus is on accuracy and clicking speed

  // Start game - SPAWN-DISAPPEAR MODE
  // Strict parity: Start Game handler with auth redirect
  const startGame = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Clear all timers AND states for fresh start
    clearAllTimersAndStates();
    hideBreakPopup();
    setGameState(prev => ({
      ...prev,
      gameActive: true,
      score: 0,
      misses: 0,
      health: 3,
      level: 1
    }));
    setGameStats({ totalClicks: 0, accuracy: 100, gameTime: 0 });
    setPreviousLevel(1);
    setCurrentDogId(0);
    setDogClickable(true);
    setCountdown(0);
    setDogTimeoutState(false);
    setTimeout(() => {
      spawnUglyDog();
    }, 1000);
  }

  // Stop game - ENHANCED CLEANUP FOR RACE CONDITION PROTECTION
  const stopGame = useCallback(() => {
    // 🔧 GUARD: Prevent multiple calls to stopGame
    if (!gameState.gameActive) {
      // ...
      return
    }
    
    // ...
    
    // ⚡ IMMEDIATE PROTECTION: Set gameActive to false FIRST
    setGameState(prev => {
      const newHighest = Math.max(prev.score, prev.highestScore)
      return {
        ...prev,
        gameActive: false,
        highestScore: newHighest
      }
    })
    
    // Clear all timers AND states when stopping game
    clearAllTimersAndStates()
    
    // REMOVED: No more trap system!
    setDogClickable(false)
    setCountdown(0)
    setDogTimeoutState(false)
    
    // Submit score to backend
    if (gameState.score > 0) {
      submitScore(gameState.score)
    }
  }, [clearAllTimersAndStates, gameState.score, gameState.gameActive])

  // Create click effect - ENHANCED (MOVED UP TO FIX INITIALIZATION)
  const createClickEffect = (x, y) => {
    const effect = document.createElement('div')
    effect.style.position = 'fixed'
    effect.style.left = x + 'px'
    effect.style.top = y + 'px'
    effect.style.color = '#86FF00'
    effect.style.fontSize = '24px'
    effect.style.fontWeight = 'bold'
    effect.style.pointerEvents = 'none'
    effect.style.zIndex = '9999'
    effect.style.animation = 'float-up 1.2s ease-out forwards'
    effect.style.textShadow = '0 0 10px #86FF00'
    effect.textContent = '+1 ✨'
    
    document.body.appendChild(effect)
    setTimeout(() => effect.remove(), 1200)
  }

  // Handle UglyDog click - RACE CONDITION PROTECTED
  const handleUglyDogClick = useCallback((e) => {
    e.stopPropagation()
    // 🔒 ULTRA-STRICT GUARDS: Prevent double execution and race conditions
    if (!gameState.gameActive || !dogClickable || levelUpBreak) {
      return
    }
    // ...
    // ⚡ RACE CONDITION FIX: Immediate timer clearance and state protection
    const currentAutoMissTimer = autoMissTimerRef.current
    clearAllTimers()
    // 🛡️ ADDITIONAL PROTECTION: Force clear specific timer if exists
    if (currentAutoMissTimer) {
      clearTimeout(currentAutoMissTimer)
      // ...
    }
    // Langsung disable klik & animasi fade out
    setDogClickable(false)
    setDogTimeoutState(true)
    // Update score
    const newScore = gameState.score + 1
    setGameState(prev => ({
      ...prev,
      score: newScore
    }))
    // ...
    // Cek level up langsung abis update score
    const newLevelForScore = GAME_LEVELS.find(level => 
      newScore >= level.minScore && newScore <= level.maxScore
    ) || GAME_LEVELS[GAME_LEVELS.length - 1]
    // ...
    // ...
    if (newLevelForScore.level > previousLevel) {
      setPreviousLevel(newLevelForScore.level)
      startLevelUpBreak(newLevelForScore.level)
      return // Jangan respawn langsung, biar break yang handle
    }
    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      accuracy: Math.round(((prev.totalClicks + 1) / (prev.totalClicks + 1 + gameState.misses)) * 100)
    }))
    // Create click effect
    createClickEffect(e.clientX, e.clientY)
    // Respawn dog abis animasi fade out bentar
    setTimeout(() => {
      if (gameState.gameActive && !levelUpBreak) {
        spawnUglyDog()
      }
    }, 200) // Delay dikit biar animasi fade out kelar
  }, [gameState.gameActive, gameState.misses, gameState.score, dogClickable, clearAllTimers, createClickEffect, spawnUglyDog, levelUpBreak, previousLevel, startLevelUpBreak])

  // Handle miss click - ENHANCED LOGGING + Miss Alert
  const handleMissClick = useCallback(() => {
    if (!gameState.gameActive || levelUpBreak) return

    setShowMissAlert(true)
    setTimeout(() => setShowMissAlert(false), 600)
    const newMisses = gameState.misses + 1
    let newHealth = gameState.health
    let newScore = gameState.score

    if (newMisses >= 3) {
      newHealth = gameState.health - 1
      newScore = Math.max(0, gameState.score - 10)
      // 🔧 FIXED: Only game over when health becomes 0 or less  
      if (newHealth <= 0) {
        stopGame()
        return
      }
      
      // Health reduced but not game over
      setGameState(prev => ({
        ...prev,
        misses: 0,        // Reset misses back to 0 for next round
        health: newHealth,
        score: newScore
      }))
    } else {
      // Just increment misses, no health reduction
      setGameState(prev => ({
        ...prev,
        misses: newMisses
      }))
    }
    setGameStats(prev => ({
      ...prev,
      accuracy: Math.round((prev.totalClicks / (prev.totalClicks + newMisses)) * 100)
    }))
  }, [gameState])
  // --- Miss Alert UI ---
  const MissAlert = () => (
    <div
      style={{
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translate(-50%, 0)',
        background: 'rgba(239,68,68,0.95)',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.3rem',
        padding: '16px 32px',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(239,68,68,0.18)',
        zIndex: 99999,
        opacity: 0.98,
        letterSpacing: '0.04em',
        textShadow: '0 2px 8px rgba(0,0,0,0.18)',
        transition: 'opacity 0.2s',
        pointerEvents: 'none',
      }}
    >
      <span role="img" aria-label="Miss">❌</span> Missed!
    </div>
  )

  // STANDARDIZED: Create timeout effect - consistent with other feedback
  const createTimeoutEffect = (xPercent, yPercent) => {
    // Cari posisi dog di layar (pixel) berdasarkan posisi % dan parent .game-canvas
    const gameCanvas = document.querySelector('.game-canvas')
    if (!gameCanvas) return
    const rect = gameCanvas.getBoundingClientRect()
    // Hitung posisi pixel relatif ke game-canvas
    const left = rect.left + (rect.width * (xPercent / 100))
    const top = rect.top + (rect.height * (yPercent / 100))
    const effect = document.createElement('div')
    effect.style.position = 'fixed'
    effect.style.left = `${left}px`
    effect.style.top = `${top}px`
    effect.style.color = '#ef4444'
    effect.style.fontSize = '22px'
    effect.style.fontWeight = 'bold'
    effect.style.pointerEvents = 'none'
    effect.style.zIndex = '9999'
    effect.style.animation = 'float-up 1.2s ease-out forwards'
    effect.style.textShadow = '0 0 12px #ef4444'
    effect.style.transform = 'translate(-50%, -50%)'
    effect.style.border = '2px solid #ef4444'
    effect.style.borderRadius = '8px'
    effect.style.padding = '6px 12px'
    effect.style.background = 'rgba(239, 68, 68, 0.15)'
    effect.style.backdropFilter = 'blur(2px)'
    effect.textContent = '⏰ TIMEOUT!'
    document.body.appendChild(effect)
    setTimeout(() => effect.remove(), 1200)
  }
  // Submit score to backend
  // --- Kirim skor ke backend saat game over (migrated from UglyDogGameLayout.jsx) ---
  // --- Kirim skor ke backend saat game over (mengikuti UglyDogGameLayout.jsx) ---
  const submitScore = async (score) => {
    try {
      await api.post('/auth/game/saved', { session_score: score });
      fetchLeaderboard();
    } catch (error) {
      // Silently handle score submission error
    }
  }

  // Fetch leaderboard
  // --- Leaderboard dari Backend (migrated from UglyDogGameLayout.jsx) ---
  // --- Leaderboard dari Backend (mengikuti UglyDogGameLayout.jsx) ---
  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/leaderboard/dev-daily')
      // Support both array dan {data: array} response
      const leaderboardData = Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
      setLeaderboard(leaderboardData.slice(0, 5))
    } catch (error) {
      setLeaderboard([])
    }
  }

  // Game timer
  useEffect(() => {
    if (gameState.gameActive) {
      const timer = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          gameTime: prev.gameTime + 1
        }))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameState.gameActive])

  // 🚨 REACT-IMMUNE Cleanup - RESPECT BREAK PROTECTION
  useEffect(() => {
    return () => {
      // 🔒 CRITICAL: Check global protection flag before any cleanup!
      if (window.UGLYDOG_BREAK_ACTIVE) {
        // Only clear non-break timers, NEVER touch break popup/timer
        if (autoMissTimerRef.current) {
          clearTimeout(autoMissTimerRef.current)
          autoMissTimerRef.current = null
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }
        return
      }
      // CRITICAL: Only clear timers, NOT popup during break!
      if (levelUpBreak && breakCountdown > 0) {
        // Only clear non-break timers, let break continue
        clearAllTimers()
        return
      }
      // Clear ALL timers and states (this will also hide popup)
      clearAllTimersAndStates()
      // Clean up any remaining visual effects
      const timeoutEffects = document.querySelectorAll('div[style*="timeout-miss-float"]')
      timeoutEffects.forEach(effect => {
        if (effect && effect.parentNode) {
          // Clear any pending cleanup timeouts
          if (effect.cleanupTimeoutId) {
            clearTimeout(effect.cleanupTimeoutId)
          }
          effect.parentNode.removeChild(effect)
        }
      })
      // Remove any remaining timeout shake classes
      const gameContainer = document.querySelector('.native-uglydog-game')
      if (gameContainer) {
        gameContainer.classList.remove('timeout-shake')
      }
      // Remove any remaining miss highlight classes
      const missIndicator = document.querySelector('.miss-indicator')
      if (missIndicator) {
        missIndicator.classList.remove('miss-highlight')
      }
    }
  }, [clearAllTimers, clearAllTimersAndStates, levelUpBreak, breakCountdown])

  // Load leaderboard on mount
  useEffect(() => {
    fetchLeaderboard()
  }, [])

  // 🚨 REACT-IMMUNE Final Cleanup - RESPECT BREAK PROTECTION  
  useEffect(() => {
    return () => {
      // 🔒 CRITICAL: Check global protection flag first!
      if (window.UGLYDOG_BREAK_ACTIVE) {
        return
      }
      
      // ONLY clean up popup if NOT during active break
      if (!levelUpBreak || breakCountdown <= 0) {
        hideBreakPopup()
      }
    }
  }, [hideBreakPopup, levelUpBreak, breakCountdown])

  return (
    <>
      {showMissAlert && <MissAlert />}
      
      <style jsx>{`
        /* SIMPLIFIED: Z-Index Hierarchy Management (No more traps!) */
        /* Layer 1 (z-index: 1-5): Background elements */
        /* Layer 2 (z-index: 10-15): [REMOVED] Game elements (traps) */
        /* Layer 3 (z-index: 20-25): Primary targets (UglyDog) */
        /* Layer 4 (z-index: 30-50): UI overlays (level indicator, instructions) */
        /* Layer 5 (z-index: 9999): Feedback effects (click effects) */
        
        .native-uglydog-game {
          width: 100%;
          background: linear-gradient(135deg, #1A222C 0%, #1E2835 100%);
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.0784313725);
          overflow: hidden;
        }
        
        /* MAIN GRID LAYOUT */
        .game-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          padding: 20px;
          min-height: 500px;
        }
        
        /* GAME AREA (LEFT SIDE) */
        .game-area {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        /* HEXAGONAL GAMING PANEL - FUTURISTIC HUD */
        .gaming-hud {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 14px 35px;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(134, 255, 0, 0.05));
          clip-path: polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%);
          border: none;
          margin-bottom: 12px;
          transition: all 0.4s ease;
          overflow: visible;
        }
        
        .gaming-hud::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, rgba(134, 255, 0, 0.6), rgba(0, 255, 255, 0.3), rgba(134, 255, 0, 0.6));
          clip-path: polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%);
          z-index: -1;
          opacity: 0.8;
          filter: blur(1px);
        }
        
        .gaming-hud::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(134, 255, 0, 0.1), transparent);
          clip-path: polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%);
          animation: hexagon-sweep 3s ease-in-out infinite;
          z-index: 1;
          pointer-events: none;
        }
        
        @keyframes hexagon-sweep {
          0%, 100% { 
            transform: translateX(-100%);
            opacity: 0;
          }
          50% { 
            transform: translateX(100%);
            opacity: 0.6;
          }
        }
        
        .gaming-hud:hover {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(134, 255, 0, 0.08));
          transform: translateY(-2px);
          filter: drop-shadow(0 8px 25px rgba(134, 255, 0, 0.2));
        }
        
        .gaming-hud:hover::before {
          opacity: 1;
          filter: blur(0px);
          background: linear-gradient(135deg, rgba(134, 255, 0, 0.8), rgba(0, 255, 255, 0.5), rgba(134, 255, 0, 0.8));
        }
        
        .gaming-hud:hover::after {
          animation-duration: 1.5s;
        }
        
        .hud-section {
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
          padding: 2px 4px;
          border-radius: 4px;
        }
        
        .hud-section:hover {
          background: rgba(134, 255, 0, 0.1);
          transform: scale(1.05);
          box-shadow: 0 0 8px rgba(134, 255, 0, 0.3);
        }
        
        .hud-separator {
          width: 1px;
          height: 18px;
          background: linear-gradient(to bottom, transparent, rgba(134, 255, 0, 0.5), rgba(0, 255, 255, 0.3), rgba(134, 255, 0, 0.5), transparent);
          margin: 0 8px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }
        
        .hud-separator::before {
          content: '';
          position: absolute;
          top: 0;
          left: -1px;
          width: 3px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(134, 255, 0, 0.2), rgba(0, 255, 255, 0.1), rgba(134, 255, 0, 0.2), transparent);
          filter: blur(2px);
        }
        
        /* HEALTH HEARTS - HEXAGONAL ENHANCED */
        .health-hearts {
          display: flex;
          gap: 5px;
          padding: 2px;
        }
        
        .heart-icon {
          width: 22px;
          height: 22px;
          transition: all 0.4s ease;
          filter: drop-shadow(0 0 4px currentColor);
        }
        
        .heart-icon.filled {
          color: #ff4757;
          filter: drop-shadow(0 0 8px rgba(255, 71, 87, 0.8));
          animation: heartbeat 2s ease-in-out infinite;
        }
        
        .heart-icon.empty {
          color: rgba(255, 255, 255, 0.2);
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1));
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 12px rgba(255, 71, 87, 1)); }
        }
          color: rgba(239, 68, 68, 0.3);
          filter: none;
        }
        
        /* SCORE DISPLAY - HEXAGONAL ENHANCED */
        .score-display {
          font-size: 17px;
          font-weight: bold;
          color: #86FF00;
          text-shadow: 0 0 10px rgba(134, 255, 0, 0.6);
          filter: drop-shadow(0 0 4px rgba(134, 255, 0, 0.4));
          transition: all 0.3s ease;
        }
        
        .hud-section:hover .score-display {
          text-shadow: 0 0 15px rgba(134, 255, 0, 0.9);
          transform: scale(1.05);
        }
        
        /* LEVEL PROGRESS - HEXAGONAL ENHANCED */
        .level-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .level-text {
          font-size: 15px;
          font-weight: bold;
          color: #86FF00;
          min-width: 35px;
          text-shadow: 0 0 8px rgba(134, 255, 0, 0.5);
          transition: all 0.3s ease;
        }
        
        .progress-bar {
          width: 70px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(134, 255, 0, 0.3);
          position: relative;
        }
        
        .progress-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(134, 255, 0, 0.2), transparent);
          animation: progress-shine 2s ease-in-out infinite;
        }
        
        @keyframes progress-shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #86FF00, #00FFFF, #86FF00);
          border-radius: 3px;
          transition: width 0.5s ease;
          box-shadow: 0 0 8px rgba(134, 255, 0, 0.6);
          position: relative;
          overflow: hidden;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: fill-shine 1.5s ease-in-out infinite;
        }
        
        @keyframes fill-shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        /* MISS COUNTER - ENHANCED UX */
        .miss-counter {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .miss-text {
          font-size: 14px;
          color: #9CA3AF;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .miss-bars {
          display: flex;
          gap: 4px;
        }
        
        .miss-bar {
          width: 10px;
          height: 18px;
          border-radius: 3px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .miss-bar.active {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
          border-color: #ef4444;
          animation: miss-pulse 0.5s ease-in-out;
        }
        
        .miss-bar.inactive {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        @keyframes miss-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); box-shadow: 0 0 12px rgba(239, 68, 68, 1); }
          100% { transform: scale(1); }
        }
        
        /* GAME CANVAS - MAIN PLAY AREA */
        .game-canvas {
          position: relative;
          height: 380px;
          background: linear-gradient(135deg, 
            rgba(26, 34, 44, 0.8) 0%, 
            rgba(30, 40, 53, 0.9) 50%,
            rgba(26, 34, 44, 0.8) 100%);
          cursor: crosshair;
          overflow: hidden;
          border-radius: 15px;
          border: 2px solid rgba(134, 255, 0, 0.3);
        }
        
        .game-canvas::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(134, 255, 0, 0.1) 0%,
            transparent 50%
          );
          pointer-events: none;
          z-index: 1;
        }
        
        /* COMPACT GAME CONTROLS */
        .game-controls-compact {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(30, 40, 53, 0.3);
          border-radius: 8px;
        }
        
        /* LEADERBOARD AREA (RIGHT SIDE) */
        .leaderboard-area {
          display: flex;
          flex-direction: column;
          background: rgba(30, 40, 53, 0.4);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }
        
        .leaderboard-header {
          padding: 15px;
          background: rgba(134, 255, 0, 0.1);
          border-bottom: 1px solid rgba(134, 255, 0, 0.2);
        }
        
        .leaderboard-header h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #86FF00;
          font-weight: bold;
        }
        
        .leaderboard-subtitle {
          font-size: 11px;
          color: #798DA3;
          opacity: 0.8;
        }
        
        .leaderboard-content {
          flex: 1;
          padding: 15px;
        }
        
        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .leaderboard-item .rank {
          font-size: 12px;
          font-weight: bold;
          color: #fbbf24;
          min-width: 20px;
        }
        
        .leaderboard-item .player-info {
          flex: 1;
        }
        
        .leaderboard-item .player-name {
          font-size: 12px;
          color: #ffffff;
          font-weight: 500;
        }
        
        .leaderboard-item .player-level {
          font-size: 10px;
          color: #798DA3;
          opacity: 0.8;
        }
        
        .leaderboard-item .player-score {
          font-size: 12px;
          color: #86FF00;
          font-weight: bold;
        }
        
        .leaderboard-empty {
          text-align: center;
          padding: 30px 15px;
          color: #798DA3;
        }
        
        .leaderboard-empty .empty-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 10px;
          margin-left: auto;
          margin-right: auto;
          color: #798DA3;
          display: block;
        }
        
        .leaderboard-empty .empty-text {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 5px;
        }
        
        .leaderboard-empty .empty-subtitle {
          font-size: 11px;
          opacity: 0.7;
        }
        
        .personal-best {
          padding: 15px;
          background: rgba(134, 255, 0, 0.05);
          border-top: 1px solid rgba(134, 255, 0, 0.2);
          text-align: center;
        }
        
        .personal-best-label {
          font-size: 11px;
          color: #798DA3;
          margin-bottom: 3px;
        }
        
        .personal-best-score {
          font-size: 16px;
          color: #86FF00;
          font-weight: bold;
          text-shadow: 0 0 8px rgba(134, 255, 0, 0.3);
        }
        
        /* HOW TO PLAY SECTION (BOTTOM) */
        .how-to-play-section {
          margin-top: 20px;
          padding: 20px;
          background: rgba(30, 40, 53, 0.4);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .how-to-play-header {
          margin-bottom: 15px;
        }
        
        .how-to-play-header h3 {
          margin: 0;
          font-size: 16px;
          color: #86FF00;
          font-weight: bold;
        }
        
        .how-to-play-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .instruction-card {
          padding: 15px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .instruction-card:hover {
          background: rgba(134, 255, 0, 0.05);
          border-color: rgba(134, 255, 0, 0.2);
          transform: translateY(-2px);
        }
        
        .instruction-card .instruction-icon {
          width: 24px;
          height: 24px;
          margin-bottom: 8px;
          margin-left: auto;
          margin-right: auto;
          color: #86FF00;
          display: block;
        }
        
        .instruction-card .instruction-title {
          font-size: 12px;
          color: #86FF00;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .instruction-card .instruction-text {
          font-size: 10px;
          color: #798DA3;
          line-height: 1.4;
        }
        
        .uglydog {
          position: absolute;
          cursor: pointer;
          user-select: none;
          z-index: 20; /* SIMPLIFIED: Higher priority for primary target */
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.3));
          font-size: 50px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
        }
        
        /* REMOVED: Hover animation - better UX for clicking without interference */
        /* REMOVED: Spawn/Disappear animations - instant response for better gameplay */
        
        .uglydog.not-clickable {
          opacity: 0.6;
          filter: grayscale(50%);
          cursor: not-allowed;
        }
        
        .uglydog.timeout-fade {
          opacity: 0.3;
          filter: grayscale(70%);
          pointer-events: none;
          animation: fade-warning 1s ease-in-out infinite;
        }
        
        /* SIMPLIFIED: No more trap system - CSS removed for cleaner codebase */
        
        /* Non-intrusive timer system */
        .peripheral-timer-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70px;
          height: 70px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 5;
        }
        
        .peripheral-timer-glow.normal {
          box-shadow: 0 0 15px rgba(134, 255, 0, 0.3);
          animation: glow-normal 2s infinite ease-in-out;
        }
        
        .peripheral-timer-glow.warning {
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
          animation: glow-warning 1s infinite ease-in-out;
        }
        
        .peripheral-timer-glow.danger {
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.7);
          animation: glow-danger 0.5s infinite ease-in-out;
        }
        
        .peripheral-timer-border {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 65px;
          height: 65px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top: 3px solid var(--timer-color);
          animation: timer-progress 1s linear;
          pointer-events: none;
          z-index: 6;
          opacity: 0.7;
        }
        
        .peripheral-timer-corner {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          z-index: 15;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .peripheral-timer-corner.normal {
          background: rgba(134, 255, 0, 0.2);
          color: #86FF00;
          border: 1px solid rgba(134, 255, 0, 0.3);
        }
        
        .peripheral-timer-corner.warning {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
          animation: subtle-pulse-timer 1s infinite ease-in-out;
        }
        
        .peripheral-timer-corner.danger {
          background: rgba(239, 68, 68, 0.3);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.4);
          animation: danger-pulse-timer 0.5s infinite ease-in-out;
        }
        
        .timer-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: dot-pulse 2s infinite ease-in-out;
        }
        
        .timer-text {
          min-width: 12px;
          text-align: center;
        }
        
        @keyframes glow-normal {
          0%, 100% { box-shadow: 0 0 15px rgba(134, 255, 0, 0.3); }
          50% { box-shadow: 0 0 20px rgba(134, 255, 0, 0.5); }
        }
        
        @keyframes glow-warning {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
          50% { box-shadow: 0 0 25px rgba(251, 191, 36, 0.7); }
        }
        
        @keyframes glow-danger {
          0%, 100% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.9); }
        }
        
        @keyframes timer-progress {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes subtle-pulse-timer {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        @keyframes danger-pulse-timer {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        
        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        @keyframes subtle-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
          }
          50% { 
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
          }
        }
        
        @keyframes danger-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.3));
          }
          50% { 
            filter: drop-shadow(0 0 10px rgba(255, 100, 100, 0.5));
          }
        }
        
        @keyframes breathe-indicator {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05);
          }
        }
        
        @keyframes fade-warning {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(134, 255, 0, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(255, 107, 107, 0.8)); }
        }
        
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
        }
        
        .game-controls {
          padding: 15px;
          text-align: center;
          background: rgba(30, 40, 53, 0.3);
          border-radius: 8px;
        }
        
        .start-stop-text {
          color: #798DA3;
          margin-bottom: 10px;
          font-size: 12px;
        }
        
        .evolution-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid #86FF00;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          z-index: 1000;
          animation: evolve-in 0.5s ease-out;
          backdrop-filter: blur(10px);
        }
        
        .evolution-popup.level-transition-popup {
          max-width: 400px;
          padding: 35px;
          border: 2px solid;
          box-shadow: 0 0 20px rgba(134, 255, 0, 0.3);
        }
        
        .level-up-break-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
          animation: evolve-in 0.3s ease-out;
        }
        
        .level-up-content {
          text-align: center;
          padding: 30px;
          border-radius: 20px;
          background: rgba(26, 34, 44, 0.8);
          border: 2px solid #86FF00;
          box-shadow: 0 0 30px rgba(134, 255, 0, 0.4);
        }
        
        .evolution-emoji {
          font-size: 3rem;
          display: block;
          margin-bottom: 10px;
          animation: bounce 0.6s ease-out;
        }
        
        .evolution-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #86FF00;
          margin-bottom: 5px;
          text-shadow: 0 0 10px currentColor;
        }
        
        .evolution-name {
          font-size: 1.1rem;
          color: white;
          opacity: 0.9;
        }
        
        .game-over-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 350px;
          color: #798DA3;
        }
        
        .game-over-icon {
          font-size: 64px;
          margin-bottom: 20px;
          animation: float 3s infinite ease-in-out;
        }
        
        .miss-indicators {
          display: flex;
          justify-content: center;
          gap: 3px;
          margin-top: 5px;
        }
        
        .miss-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        
        .miss-dot.active {
          background: #ef4444;
          box-shadow: 0 0 6px #ef4444;
        }
        
        @keyframes float {
          0% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
          100% { transform: translate(-50%, -50%) translateY(0px); }
        }
        
        @keyframes evolve-in {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes section-popup-in {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes section-popup-out {
          0% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1);
          }
          100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.95);
          }
        }
        
        @keyframes bounce {
          0% { transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        @keyframes float-up {
          0% { 
            opacity: 1; 
            transform: translateY(0px); 
          }
          100% { 
            opacity: 0; 
            transform: translateY(-50px); 
          }
        }
        
        @keyframes timeout-miss-float {
          0% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1) translateY(0px);
          }
          20% { 
            transform: translate(-50%, -50%) scale(1.2) translateY(-10px);
          }
          100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.8) translateY(-60px);
          }
        }
        
        /* Miss Counter Highlight Animation */
        @keyframes miss-highlight {
          0%, 100% { 
            background: rgba(239, 68, 68, 0.1);
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
            transform: scale(1);
          }
          25% { 
            background: rgba(239, 68, 68, 0.3);
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
            transform: scale(1.05);
          }
          75% { 
            background: rgba(239, 68, 68, 0.2);
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
            transform: scale(1.02);
          }
        }
        
        .miss-highlight {
          animation: miss-highlight 1.5s ease-in-out;
          border: 2px solid #ef4444 !important;
        }
        
        /* Screen Shake Effect for Timeout */
        @keyframes timeout-shake {
          0%, 100% { transform: translateX(0px); }
          10% { transform: translateX(-2px); }
          20% { transform: translateX(2px); }
          30% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          50% { transform: translateX(-1px); }
          60% { transform: translateX(1px); }
          70% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
          90% { transform: translateX(0px); }
        }
        
        .timeout-shake {
          animation: timeout-shake 0.6s ease-in-out;
        }
        
        /* RESPONSIVE DESIGN - HEXAGONAL OPTIMIZATION */
        @media (max-width: 1024px) {
          .game-main-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 16px;
          }
          
          .gaming-hud {
            padding: 14px 32px;
            gap: 18px;
            clip-path: polygon(18px 0%, 100% 0%, calc(100% - 18px) 100%, 0% 100%);
          }
          
          .gaming-hud::before {
            clip-path: polygon(18px 0%, 100% 0%, calc(100% - 18px) 100%, 0% 100%);
          }
          
          .gaming-hud::after {
            clip-path: polygon(18px 0%, 100% 0%, calc(100% - 18px) 100%, 0% 100%);
          }
          
          .progress-bar {
            width: 65px;
          }
          
          .game-canvas {
            height: 320px;
          }
          
          .how-to-play-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .leaderboard-area {
            order: 2;
          }
          
          .how-to-play-section {
            order: 3;
          }
        }
        
        @media (max-width: 968px) {
          .game-main-grid {
            gap: 12px;
            padding: 12px;
          }
          
          .gaming-hud {
            padding: 12px 24px;
            gap: 14px;
            clip-path: polygon(15px 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%);
          }
          
          .gaming-hud::before {
            clip-path: polygon(15px 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%);
          }
          
          .gaming-hud::after {
            clip-path: polygon(15px 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%);
          }
          
          .hud-separator {
            margin: 0 6px;
          }
          
          .progress-bar {
            width: 60px;
          }
          
          .game-canvas {
            height: 300px;
          }
          
          .how-to-play-grid {
            gap: 10px;
          }
        }
        
        @media (max-width: 768px) {
          .gaming-hud {
            flex-wrap: wrap;
            gap: 8px;
            padding: 8px 16px;
            justify-content: center;
            clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          }
          
          .gaming-hud::before {
            clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          }
          
          .gaming-hud::after {
            clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          }
          
          .hud-separator {
            display: none;
          }
          
          .hud-section {
            flex: 0 0 auto;
            min-width: 80px;
            justify-content: center;
            padding: 4px 8px;
          }
          
          /* Mobile-optimized sizing */
          .health-hearts {
            gap: 3px;
          }
          
          .heart-icon {
            width: 18px;
            height: 18px;
          }
          
          .score-display {
            font-size: 14px;
          }
          
          .level-text {
            font-size: 12px;
            min-width: 25px;
          }
          
          .progress-bar {
            width: 50px;
            height: 6px;
          }
          
          .miss-text {
            font-size: 11px;
          }
          
          .miss-bars {
            gap: 2px;
          }
          
          .miss-bar {
            width: 8px;
            height: 14px;
            border-radius: 2px;
          }
          
          .game-canvas {
            height: 280px;
          }
          
          .uglydog img {
            width: 60px !important;
            height: 60px !important;
          }
          
          .countdown-circle {
            width: 70px !important;
            height: 70px !important;
            font-size: 16px !important;
          }
          
          .how-to-play-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .instruction-card {
            padding: 10px 8px;
          }
          
          .leaderboard-content {
            padding: 8px 6px;
          }
          
          .leaderboard-item {
            padding: 6px 4px;
            gap: 6px;
          }
        }
        
        /* Small mobile optimization */
        @media (max-width: 480px) {
          .gaming-hud {
            padding: 6px 12px;
            gap: 6px;
          }
          
          .hud-section {
            padding: 3px 6px;
            min-width: 70px;
          }
          
          .health-hearts {
            gap: 2px;
          }
          
          .heart-icon {
            width: 16px;
            height: 16px;
          }
          
          .score-display {
            font-size: 12px;
          }
          
          .level-text {
            font-size: 11px;
            min-width: 20px;
          }
          
          .progress-bar {
            width: 40px;
            height: 5px;
          }
          
          .miss-text {
            font-size: 10px;
          }
          
          .miss-bar {
            width: 6px;
            height: 12px;
          }
          
          .game-canvas {
            height: 240px;
          }
          
          .uglydog img {
            width: 50px !important;
            height: 50px !important;
          }
          
          .countdown-circle {
            width: 60px !important;
            height: 60px !important;
            font-size: 14px !important;
          }
        }
        
        @media (max-width: 600px) {
          .game-main-grid {
            padding: 8px;
            gap: 8px;
          }
          
          .gaming-hud {
            flex-direction: column;
            gap: 6px;
            padding: 6px 4px;
            clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          }
          
          .gaming-hud::before {
            clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          }
          
          .gaming-hud::after {
            clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          }
          
          .hud-section {
            justify-content: space-between;
            width: 100%;
            min-width: unset;
            padding: 2px 4px;
          }
          
          .health-hearts {
            gap: 4px;
          }
          
          .heart-icon {
            width: 20px;
            height: 20px;
          }
          
          .progress-bar {
            width: 40px;
            height: 6px;
          }
          
          .game-canvas {
            height: 240px;
            min-height: 200px;
          }
          
          .uglydog img {
            width: 55px !important;
            height: 55px !important;
          }
          
          .leaderboard-header {
            padding: 10px 8px;
          }
          
          .leaderboard-content {
            padding: 6px 4px;
          }
          
          .how-to-play-section {
            padding: 12px 8px;
          }
          
          .instruction-card {
            padding: 8px 6px;
          }
        }
        
        @media (max-width: 480px) {
          .game-main-grid {
            padding: 6px;
            gap: 6px;
          }
          
          .gaming-hud {
            gap: 4px;
            padding: 4px 2px;
          }
          
          .hud-section {
            padding: 2px 2px;
          }
          
          .health-hearts {
            gap: 3px;
          }
          
          .heart-icon {
            width: 18px;
            height: 18px;
          }
          
          .progress-bar {
            width: 35px;
            height: 5px;
          }
          
          .game-canvas {
            height: 220px;
            min-height: 180px;
          }
          
          .uglydog img {
            width: 50px !important;
            height: 50px !important;
          }
          
          .leaderboard-header {
            padding: 8px 6px;
          }
          
          .leaderboard-content {
            padding: 4px 2px;
          }
          
          .how-to-play-section {
            padding: 10px 6px;
          }
          
          .instruction-card {
            padding: 6px 4px;
          }
        }
        
        /* ADDED: High DPI Display Support */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .uglydog img, .trap img {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }
        
        /* ADDED: Landscape Mobile Optimization */
        @media (max-height: 500px) and (orientation: landscape) {
          .game-stats-grid {
            grid-template-columns: repeat(4, 1fr);
            padding: 8px;
          }
          
          .game-canvas {
            height: 180px;
            min-height: 160px;
          }
          
          .gaming-hud {
            padding: 6px 12px;
            gap: 12px;
          }
          
          .hud-section {
            min-width: 60px;
          }
        }
        
        /* Extra Small Mobile (iPhone SE, etc.) */
        @media (max-width: 375px) {
          .game-canvas {
            height: 200px;
            min-height: 160px;
          }
          
          .uglydog img {
            width: 45px !important;
            height: 45px !important;
          }
          
          .heart-icon {
            width: 16px;
            height: 16px;
          }
          
          .progress-bar {
            width: 30px;
            height: 4px;
          }
          
          .gaming-hud {
            padding: 4px 2px;
            gap: 3px;
          }
        }
        
        /* Mobile Dropdown Buttons */
        .mobile-dropdown-buttons {
          display: none;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .mobile-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(134, 255, 0, 0.1);
          border: 1px solid rgba(134, 255, 0, 0.3);
          border-radius: 8px;
          color: #86FF00;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .mobile-dropdown-btn:hover {
          background: rgba(134, 255, 0, 0.2);
          border-color: rgba(134, 255, 0, 0.5);
          transform: translateY(-1px);
        }
        
        .dropdown-arrow {
          transition: transform 0.2s ease;
        }
        
        .dropdown-arrow.open {
          transform: rotate(180deg);
        }
        
        /* Mobile Dropdown Content */
        .mobile-dropdown-content {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(30, 40, 53, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(134, 255, 0, 0.3);
          border-radius: 12px;
          margin-top: 8px;
          z-index: 100;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .mobile-dropdown-content.show {
          display: block;
          animation: dropdownSlideIn 0.3s ease-out;
        }
        
        @keyframes dropdownSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Mobile Leaderboard Styles */
        .mobile-leaderboard {
          padding: 16px;
        }
        
        .mobile-leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(134, 255, 0, 0.2);
        }
        
        .mobile-leaderboard-header h3 {
          margin: 0;
          color: #86FF00;
          font-size: 16px;
          font-weight: 700;
        }
        
        .close-dropdown {
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .close-dropdown:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .mobile-leaderboard-content {
          margin-bottom: 12px;
        }
        
        .mobile-leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .mobile-leaderboard-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }
        
        .mobile-leaderboard-item:hover {
          background: rgba(134, 255, 0, 0.1);
          border-color: rgba(134, 255, 0, 0.3);
        }
        
        .mobile-rank {
          font-size: 12px;
          font-weight: bold;
          color: #86FF00;
          min-width: 20px;
        }
        
        .mobile-player-info {
          flex: 1;
        }
        
        .mobile-player-name {
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }
        
        .mobile-player-level {
          font-size: 10px;
          color: #9CA3AF;
        }
        
        .mobile-player-score {
          font-size: 12px;
          font-weight: bold;
          color: #fbbf24;
        }
        
        .mobile-leaderboard-empty {
          text-align: center;
          padding: 20px;
        }
        
        .mobile-empty-text {
          color: #9CA3AF;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .mobile-empty-subtitle {
          color: #6B7280;
          font-size: 12px;
        }
        
        .mobile-personal-best {
          padding: 8px;
          background: rgba(134, 255, 0, 0.1);
          border: 1px solid rgba(134, 255, 0, 0.3);
          border-radius: 6px;
          text-align: center;
        }
        
        .mobile-personal-best-label {
          font-size: 11px;
          color: #86FF00;
          margin-bottom: 2px;
        }
        
        .mobile-personal-best-score {
          font-size: 14px;
          font-weight: bold;
          color: #fff;
        }
        
        /* Mobile How to Play Styles */
        .mobile-how-to-play {
          padding: 16px;
        }
        
        .mobile-how-to-play-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(134, 255, 0, 0.2);
        }
        
        .mobile-how-to-play-header h3 {
          margin: 0;
          color: #86FF00;
          font-size: 16px;
          font-weight: 700;
        }
        
        .mobile-how-to-play-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .mobile-instruction-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .mobile-instruction-icon {
          font-size: 18px;
          min-width: 24px;
          text-align: center;
        }
        
        .mobile-instruction-title {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
        }
        
        .mobile-instruction-text {
          font-size: 11px;
          color: #9CA3AF;
          line-height: 1.3;
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .mobile-dropdown-buttons {
            display: flex;
          }
          
          .mobile-dropdown-content {
            position: relative;
            top: auto;
            left: auto;
            right: auto;
            margin-top: 8px;
            margin-bottom: 8px;
          }
          
          .leaderboard-area {
            display: none;
          }
          
          .how-to-play-section > .how-to-play-header,
          .how-to-play-section > .how-to-play-grid {
            display: none;
          }
        }
        
        /* Scrollbar for mobile dropdown */
        .mobile-dropdown-content::-webkit-scrollbar {
          width: 4px;
        }
        
        .mobile-dropdown-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        
        .mobile-dropdown-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #86FF00, #8b5cf6);
          border-radius: 2px;
        }
        
        .mobile-dropdown-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #86FF00, #00FFFF);
        }
        
        /* NEW: Rotation Prompt Styles */
        .rotation-prompt {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1A222C 0%, #1E2835 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .rotation-content {
          text-align: center;
          color: #ffffff;
          padding: 40px;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          max-width: 300px;
          width: 90%;
        }
        
        .rotation-icon {
          font-size: 48px;
          margin-bottom: 16px;
          animation: pulse 2s infinite;
        }
        
        .rotation-text {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #86FF00;
          text-shadow: 0 0 16px rgba(134, 255, 0, 0.8);
        }
        
        .rotation-subtitle {
          font-size: 14px;
          opacity: 0.8;
          color: #ffffff;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        /* NEW: Landscape-optimized mobile styles */
        @media (max-width: 768px) and (orientation: landscape) {
          .native-uglydog-game {
            transform: scale(0.85);
            transform-origin: center;
            margin: 0 auto;
          }
          
          .gaming-hud {
            padding: 8px 16px;
            gap: 12px;
          }
          
          .hud-section {
            padding: 6px 12px;
            min-width: 90px;
          }
          
          .health-hearts {
            gap: 4px;
          }
          
          .heart-icon {
            width: 20px;
            height: 20px;
          }
          
          .score-display {
            font-size: 16px;
          }
          
          .level-text {
            font-size: 14px;
            min-width: 30px;
          }
          
          .progress-bar {
            width: 60px;
            height: 8px;
          }
          
          .miss-text {
            font-size: 13px;
          }
          
          .miss-bars {
            gap: 3px;
          }
          
          .miss-bar {
            width: 10px;
            height: 16px;
            border-radius: 2px;
          }
          
          .game-canvas {
            height: 300px;
          }
          
          .uglydog img {
            width: 70px !important;
            height: 70px !important;
          }
          
          .countdown-circle {
            width: 80px !important;
            height: 80px !important;
            font-size: 18px !important;
          }
        }
        
        /* NEW: Game-Only Rotation Prompt Styles */
        .game-rotation-prompt {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(26, 34, 44, 0.98) 0%, rgba(30, 40, 53, 0.98) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999 !important;
          border-radius: 16px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        
        .game-rotation-content {
          text-align: center;
          color: #ffffff;
          padding: 30px;
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
          max-width: 320px;
          width: 90%;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .game-rotation-icon {
          font-size: 48px;
          margin-bottom: 16px;
          animation: pulse 2s infinite;
          color: #86FF00;
          text-shadow: 0 0 16px rgba(134, 255, 0, 0.8);
        }
        
        .game-rotation-text {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #86FF00;
          text-shadow: 0 0 16px rgba(134, 255, 0, 0.8);
        }
        
        .game-rotation-subtitle {
          font-size: 14px;
          opacity: 0.9;
          color: #ffffff;
          margin-bottom: 16px;
        }
        
        /* Show rotation prompt in portrait mode */
        @media (max-width: 768px) and (orientation: portrait) {
          .game-rotation-prompt {
            display: flex !important;
          }
          
          /* Hide actual game content in portrait */
          .actual-game-content {
            display: none;
          }
        }
        
        /* Hide rotation prompt in landscape */
        @media (max-width: 768px) and (orientation: landscape) {
          .game-rotation-prompt {
            display: none !important;
          }
          
          .actual-game-content {
            display: block;
          }
        }
        
        /* NEW: Mini Interactive Preview Styles */
        .mini-preview-start-btn {
          background: linear-gradient(135deg, #86FF00, #00FFFF) !important;
          border: none !important;
          color: #000000 !important;
          padding: 12px 24px !important;
          border-radius: 25px !important;
          font-weight: bold !important;
          cursor: pointer !important;
          margin-top: 20px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 12px rgba(134, 255, 0, 0.5) !important;
          font-size: 14px !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }
        
        .mini-preview-start-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(134, 255, 0, 0.7) !important;
        }
        
        .mini-preview-container {
          width: 100% !important;
          height: 180px !important;
          background: rgba(0, 0, 0, 0.5) !important;
          border-radius: 12px !important;
          position: relative !important;
          margin: 20px 0 !important;
          border: 2px solid rgba(134, 255, 0, 0.3) !important;
          overflow: hidden !important;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3) !important;
        }
        
        .mini-preview-score {
          position: absolute !important;
          top: 10px !important;
          left: 10px !important;
          color: #86FF00 !important;
          font-weight: bold !important;
          font-size: 16px !important;
          z-index: 10 !important;
          background: rgba(0, 0, 0, 0.8) !important;
          padding: 6px 12px !important;
          border-radius: 20px !important;
          border: 1px solid rgba(134, 255, 0, 0.5) !important;
        }
        
        .mini-uglydog {
          z-index: 5 !important;
        }
        
        .mini-uglydog:hover {
          transform: scale(1.2) !important;
        }
        
        .mini-uglydog:active {
          transform: scale(0.9) !important;
        }
        
        /* Universal Mobile Responsive Styles */
        /* Small Mobile (320x568 - iPhone SE) */
        @media only screen and (max-width: 375px) {
          .mini-preview-container {
            height: 140px;
          }
          
          .mini-preview-score {
            font-size: 12px;
          }
          
          .game-rotation-text {
            font-size: 16px;
          }
          
          .game-rotation-subtitle {
            font-size: 11px;
          }
          
          .mini-preview-start-btn {
            padding: 8px 16px;
            font-size: 12px;
          }
        }
        
        /* Standard Mobile (376px - 414px) */
        @media only screen and (min-width: 376px) and (max-width: 414px) {
          .mini-preview-container {
            height: 160px;
          }
          
          .mini-preview-score {
            font-size: 14px;
          }
        }
        
        /* Large Mobile (415px - 428px) */
        @media only screen and (min-width: 415px) and (max-width: 428px) {
          .mini-preview-container {
            height: 180px;
          }
          
          .mini-preview-score {
            font-size: 16px;
          }
          
          .game-rotation-text {
            font-size: 20px;
          }
          
          .game-rotation-subtitle {
            font-size: 14px;
          }
        }
        
        /* Device Specific Optimizations */
        /* iPhone SE/8/12/13 */
        @media only screen and (device-width: 375px) and (device-height: 667px),
                   only screen and (device-width: 390px) and (device-height: 844px),
                   only screen and (device-width: 393px) and (device-height: 852px) {
          .mini-preview-container {
            border-radius: 20px;
            border: 2px solid rgba(134, 255, 0, 0.3);
          }
          
          .mini-preview-start-btn {
            background: linear-gradient(135deg, #86FF00, #00FFFF);
            font-weight: 600;
          }
        }
        
        /* Android Common Devices */
        @media only screen and (device-width: 360px) and (device-height: 640px),
                   only screen and (device-width: 411px) and (device-height: 731px),
                   only screen and (device-width: 412px) and (device-height: 892px) {
          .mini-preview-container {
            background: rgba(0, 0, 0, 0.4);
          }
          
          .mini-uglydog img {
            border-radius: 50%;
            border: 3px solid #ffffff;
          }
        }
      `}</style>

      <div className="native-uglydog-game">
        {/* Main Game Layout - Grid System */}
        <div className="game-main-grid">
          {/* Left Side - Game Area */}
          <div className="game-area">
            {/* NEW: Mini Interactive Preview */}
            {showGameRotationPrompt && (
              <div className="game-rotation-prompt">
                <div className="game-rotation-content">
                  {!miniGameState.showMiniGame ? (
                    <>
                      <div className="game-rotation-icon">🎮</div>
                      <div className="game-rotation-text">Try Mini Preview</div>
                      <div className="game-rotation-subtitle">Tap to experience the game</div>
                      <button 
                        className="mini-preview-start-btn"
                        onClick={startMiniGame}
                      >
                        Start Mini Game
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mini-preview-container">
                        <div className="mini-preview-score">Score: {miniGameState.score}</div>
                        <div 
                          className="mini-uglydog"
                          style={{
                            left: `${miniGameState.dogPosition.x}%`,
                            top: `${miniGameState.dogPosition.y}%`,
                            position: 'absolute',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '40px',
                            userSelect: 'none'
                          }}
                          onClick={handleMiniDogClick}
                        >
                          🐶
                        </div>
                      </div>
                      <div className="game-rotation-subtitle">📱 Rotate for full game experience</div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Actual Game Content */}
            <div className="actual-game-content">
              {/* Gaming HUD - Horizontal Bar */}
              <div className="gaming-hud">
              {/* Mobile Dropdown Buttons - Only visible on mobile */}
              <div className="mobile-dropdown-buttons">
                <button 
                  className="mobile-dropdown-btn"
                  onClick={() => setShowLeaderboardDropdown(!showLeaderboardDropdown)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                    <path d="M4 22h16"/>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                  </svg>
                  Leaderboard
                  <svg className={`dropdown-arrow ${showLeaderboardDropdown ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>
                
                <button 
                  className="mobile-dropdown-btn"
                  onClick={() => setShowHowToPlayDropdown(!showHowToPlayDropdown)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <circle cx="12" cy="17" r="1"/>
                  </svg>
                  How to Play
                  <svg className={`dropdown-arrow ${showHowToPlayDropdown ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>
              </div>

              {/* Health Hearts */}
              <div className="hud-section">
                <div className="health-hearts">
                  {[1, 2, 3].map((heartIndex) => (
                    <svg 
                      key={heartIndex}
                      className={`heart-icon ${heartIndex <= gameState.health ? 'filled' : 'empty'}`}
                      viewBox="0 0 24 24" 
                      fill={heartIndex <= gameState.health ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  ))}
                </div>
              </div>

              <div className="hud-separator"></div>

              {/* Score */}
              <div className="hud-section">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#86FF00'}}>
                  <path d="M3 3v5h5"/>
                  <path d="M21 21v-5h-5"/>
                  <path d="M21 3L9 15l-6-6"/>
                </svg>
                <div className="score-display">{gameState.score}</div>
              </div>

              <div className="hud-separator"></div>

              {/* Level Progress */}
              <div className="hud-section">
                <div className="level-progress">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#86FF00'}}>
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  <div className="level-text">L{currentLevel.level}</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${((gameState.score - currentLevel.minScore) / (currentLevel.maxScore === Infinity ? 100 : currentLevel.maxScore - currentLevel.minScore)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="hud-separator"></div>

              {/* Miss Counter */}
              <div className="hud-section">
                <div className="miss-counter">
                  <div className="miss-text">Miss</div>
                  <div className="miss-bars">
                    {[1, 2, 3].map((missIndex) => (
                      <div 
                        key={missIndex}
                        className={`miss-bar ${missIndex <= gameState.misses ? 'active' : 'inactive'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Canvas - Main Play Area */}
            <div className="game-canvas" onClick={handleMissClick}>
              {gameState.gameActive ? (
                <>
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      zIndex: 50
                    }}>
                      break={levelUpBreak.toString()}, countdown={breakCountdown}
                    </div>
                  )}

                  {/* UglyDog - Real Target */}
                  <div
                    className={`uglydog${!dogClickable ? ' not-clickable' : ''}${dogTimeoutState ? ' timeout-fade' : ''}`}
                    style={{
                      left: `${dogPosition.x}%`,
                      top: `${dogPosition.y}%`,
                      pointerEvents: dogClickable ? 'auto' : 'none',
                    }}
                    onClick={dogClickable ? handleUglyDogClick : undefined}
                  >
                    <img 
                      src="/assets/images/uglydog-original.png" 
                      alt="UglyDog"
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 8px rgba(134, 255, 0, 0.5))',
                        transition: 'all 0.3s ease',
                        cursor: dogClickable ? 'pointer' : 'not-allowed'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '12px',
                      color: '#86FF00',
                      fontWeight: 'bold',
                      textShadow: '0 0 6px rgba(134, 255, 0, 0.8)',
                      pointerEvents: 'none'
                    }}>
                      UglyDog
                    </div>
                  </div>
                  
                  {/* Level indicator overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: currentLevel.color,
                    padding: '6px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: `1px solid ${currentLevel.color}`,
                    zIndex: 30,
                    boxShadow: `0 0 8px ${currentLevel.color}40`
                  }}>
                    {currentLevel.difficulty}
                  </div>
                  
                  {/* Instructions for new players */}
                  {gameState.score === 0 && currentLevel.level === 1 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: '#86FF00',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      zIndex: 15,
                      border: '1px solid #86FF00',
                      textAlign: 'center',
                      maxWidth: '200px',
                      lineHeight: '1.3'
                    }}>
                      🎯 Click UglyDog before it disappears!
                    </div>
                  )}
                </>
              ) : (
                <div className="game-over-state">
                <svg className="game-over-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '20px'}}>
                    <rect x="14" y="14" width="4" height="6" rx="2"/>
                    <rect x="6" y="4" width="4" height="16" rx="2"/>
                    <path d="M6 20h4"/>
                    <path d="M14 10h4"/>
                    <path d="M6 14h2v6"/>
                    <path d="M14 4h2v6"/>
                  </svg>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    {gameState.health <= 0 ? 'Game Over!' : 'UglyDog Clicker'}
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '15px' }}>
                    {gameState.health <= 0 
                      ? `Final Score: ${gameState.score}`
                      : 'Ready to start?'
                    }
                  </div>
                  {!gameState.gameActive ? (
                    <button
                      onClick={startGame}
                      className="tf-button style1"
                      style={{ fontSize: '14px', padding: '10px 20px' }}
                      disabled={!isAuthenticated}
                    >
                      <svg style={{display: 'inline-block', width: '16px', height: '16px', marginRight: '6px', verticalAlign: 'middle'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5,3 19,12 5,21"/>
                      </svg>
                      Start Game
                    </button>
                  ) : null}
                  {!isAuthenticated && !loading && (
                    <div style={{color: '#ef4444', marginTop: 8}}>Login dulu untuk main!</div>
                  )}
                </div>
              )}
            </div>

            {/* Game Controls - Bottom of Game Area */}
            {gameState.gameActive && (
              <div className="game-controls-compact">
                <button
                  onClick={stopGame}
                  className="tf-button style1"
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    borderColor: '#dc2626',
                    marginRight: '10px'
                  }}
                >
                  <svg style={{display: 'inline-block', width: '12px', height: '12px', marginRight: '4px', verticalAlign: 'middle'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                  Stop
                </button>
              </div>
            )}

            {/* Mobile Leaderboard Dropdown */}
            <div className={`mobile-dropdown-content ${showLeaderboardDropdown ? 'show' : ''}`}>
              <div className="mobile-leaderboard">
                <div className="mobile-leaderboard-header">
                  <h3>🏆 Leaderboard</h3>
                  <button 
                    className="close-dropdown"
                    onClick={() => setShowLeaderboardDropdown(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                
                <div className="mobile-leaderboard-content">
                  {leaderboard.length > 0 ? (
                    <div className="mobile-leaderboard-list">
                      {leaderboard.slice(0, 5).map((player, index) => (
                        <div key={player.user_id || index} className="mobile-leaderboard-item">
                          <div className="mobile-rank">#{player.rank || index + 1}</div>
                          <div className="mobile-player-info">
                            <div className="mobile-player-name">{player.username || player.name || (player.user && player.user.name) || 'Anon'}</div>
                            <div className="mobile-player-level">{player.evolution_stage}</div>
                          </div>
                          <div className="mobile-player-score">{player.best_session ?? player.total_score ?? player.score ?? 0}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mobile-leaderboard-empty">
                      <div className="mobile-empty-text">No scores yet</div>
                      <div className="mobile-empty-subtitle">Be the first to play!</div>
                    </div>
                  )}
                </div>

                {/* Your Best Score */}
                {gameState.highestScore > 0 && (
                  <div className="mobile-personal-best">
                    <div className="mobile-personal-best-label">Your Best</div>
                    <div className="mobile-personal-best-score">{gameState.highestScore}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
            </div> {/* Closing actual-game-content */}

          {/* Right Side - Leaderboard */}
          <div className="leaderboard-area">
            <div className="leaderboard-header">
              <h3>
                <svg style={{display: 'inline-block', width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
                Leaderboard
              </h3>
              <div className="leaderboard-subtitle">Top Players</div>
            </div>
            
            <div className="leaderboard-content">
                  {leaderboard.length > 0 ? (
                    <div className="leaderboard-list">
                      {leaderboard.map((player, index) => (
                        <div key={player.user_id || index} className="leaderboard-item">
                          <div className="rank">#{player.rank || index + 1}</div>
                          <div className="player-info">
                            <div className="player-name">{player.username || player.name || (player.user && player.user.name) || 'Anon'}</div>
                            <div className="player-level">{player.evolution_stage}</div>
                          </div>
                          <div className="player-score">{player.best_session ?? player.total_score ?? player.score ?? 0}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                <div className="leaderboard-empty">
                  <svg className="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '10px', opacity: '0.6'}}>
                    <path d="M3 3v5h5"/>
                    <path d="M21 21v-5h-5"/>
                    <path d="M21 3L9 15l-6-6"/>
                  </svg>
                  <div className="empty-text">No scores yet</div>
                  <div className="empty-subtitle">Be the first to play!</div>
                </div>
              )}
            </div>

            {/* Your Best Score */}
            {gameState.highestScore > 0 && (
              <div className="personal-best">
                <div className="personal-best-label">Your Best</div>
                <div className="personal-best-score">{gameState.highestScore}</div>
              </div>
            )}
          </div>
        </div>

        {/* How to Play Section - Full Width Bottom */}
        <div className="how-to-play-section">
          {/* Mobile How to Play Dropdown */}
          <div className={`mobile-dropdown-content ${showHowToPlayDropdown ? 'show' : ''}`}>
            <div className="mobile-how-to-play">
              <div className="mobile-how-to-play-header">
                <h3>❓ How to Play</h3>
                <button 
                  className="close-dropdown"
                  onClick={() => setShowHowToPlayDropdown(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div className="mobile-how-to-play-grid">
                <div className="mobile-instruction-card">
                  <div className="mobile-instruction-icon">🎯</div>
                  <div className="mobile-instruction-title">Click UglyDog</div>
                  <div className="mobile-instruction-text">Click the UglyDog before it disappears to score points</div>
                </div>
                
                <div className="mobile-instruction-card">
                  <div className="mobile-instruction-icon">⚡</div>
                  <div className="mobile-instruction-title">Speed Challenge</div>
                  <div className="mobile-instruction-text">Higher levels = faster spawns and shorter timers</div>
                </div>
                
                <div className="mobile-instruction-card">
                  <div className="mobile-instruction-icon">❤️</div>
                  <div className="mobile-instruction-title">Health System</div>
                  <div className="mobile-instruction-text">3 misses = lose 1 health. Game over when health reaches 0</div>
                </div>
                
                <div className="mobile-instruction-card">
                  <div className="mobile-instruction-icon">⭐</div>
                  <div className="mobile-instruction-title">Level Up</div>
                  <div className="mobile-instruction-text">Every 50 points = new level + 5 second break</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop How to Play - Hidden on mobile */}
          <div className="how-to-play-header">
            <h3>
              <svg style={{display: 'inline-block', width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <circle cx="12" cy="17" r="1"/>
              </svg>
              How to Play
            </h3>
          </div>
          
          <div className="how-to-play-grid">
            <div className="instruction-card">
              <svg className="instruction-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="14" y="14" width="4" height="6" rx="2"/>
                <rect x="6" y="4" width="4" height="16" rx="2"/>
                <path d="M6 20h4"/>
                <path d="M14 10h4"/>
                <path d="M6 14h2v6"/>
                <path d="M14 4h2v6"/>
              </svg>
              <div className="instruction-title">Click UglyDog</div>
              <div className="instruction-text">Click the UglyDog before it disappears to score points</div>
            </div>
            
            <div className="instruction-card">
              <svg className="instruction-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <div className="instruction-title">Speed Challenge</div>
              <div className="instruction-text">Higher levels = faster spawns and shorter timers</div>
            </div>
            
            <div className="instruction-card">
              <svg className="instruction-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <div className="instruction-title">Health System</div>
              <div className="instruction-text">3 misses = lose 1 health. Game over when health reaches 0</div>
            </div>
            
            <div className="instruction-card">
              <svg className="instruction-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 21l8-11-8-11"/>
                <path d="M12 21l8-11-8-11"/>
              </svg>
              <div className="instruction-title">Level Up</div>
              <div className="instruction-text">Every 50 points = new level + 5 second break</div>
            </div>
          </div>
        </div>
      </div>



    </>
  )
}