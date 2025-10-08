'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Level system
const GAME_LEVELS = [
  { level: 1, name: 'Easy', minScore: 0, maxScore: 49, color: '#86FF00' },
  { level: 2, name: 'Easy', minScore: 50, maxScore: 99, color: '#86FF00' },
  { level: 3, name: 'Easy+', minScore: 100, maxScore: 149, color: '#86FF00' },
  { level: 4, name: 'Medium', minScore: 150, maxScore: 199, color: '#fbbf24' },
  { level: 5, name: 'Medium', minScore: 200, maxScore: 299, color: '#fbbf24' },
  { level: 6, name: 'Medium+', minScore: 300, maxScore: 399, color: '#fbbf24' },
  { level: 7, name: 'Hard', minScore: 400, maxScore: 599, color: '#ef4444' },
  { level: 8, name: 'Hard+', minScore: 600, maxScore: 799, color: '#ef4444' },
  { level: 9, name: 'Expert', minScore: 800, maxScore: 999, color: '#ef4444' },
  { level: 10, name: 'Ultimate', minScore: 1000, maxScore: Infinity, color: '#8b5cf6' }
]

export default function UglyDogGame() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Game state
  const [gameState, setGameState] = useState({
    score: 0,
    misses: 0,
    health: 3,
    gameActive: false,
    level: 1
  })
  
  const [dogPosition, setDogPosition] = useState({ x: 50, y: 50 })
  const [dogVisible, setDogVisible] = useState(false)
  const [dogClickable, setDogClickable] = useState(false)
  const [levelUpBreak, setLevelUpBreak] = useState(false)
  const [breakCountdown, setBreakCountdown] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [showMissAlert, setShowMissAlert] = useState(false)

  // Refs
  const gameTimerRef = useRef(null)
  const levelUpTimerRef = useRef(null)

  // Get current level
  const getCurrentLevel = useCallback(() => {
    for (let i = GAME_LEVELS.length - 1; i >= 0; i--) {
      if (gameState.score >= GAME_LEVELS[i].minScore) {
        return GAME_LEVELS[i]
      }
    }
    return GAME_LEVELS[0]
  }, [gameState.score])

  const currentLevel = getCurrentLevel()

  // Get difficulty settings
  const getDifficultySettings = useCallback(() => {
    const level = currentLevel.level
    if (level <= 2) return { spawnDelay: 2000, visibleTime: 5000 }
    if (level <= 4) return { spawnDelay: 1800, visibleTime: 4000 }
    if (level <= 5) return { spawnDelay: 1500, visibleTime: 2500 }
    if (level >= 6) return { spawnDelay: 800, visibleTime: 700 }
    return { spawnDelay: 800, visibleTime: 700 }
  }, [currentLevel.level])

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.get('/api/leaderboard/dev-daily')
      setLeaderboard(res.data.data || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (gameTimerRef.current) {
      clearTimeout(gameTimerRef.current)
      gameTimerRef.current = null
    }
    if (levelUpTimerRef.current) {
      clearInterval(levelUpTimerRef.current)
      levelUpTimerRef.current = null
    }
  }, [])

  // Spawn UglyDog
  const spawnUglyDog = useCallback(() => {
    if (!gameState.gameActive || levelUpBreak) return

    const x = Math.random() * 60 + 20 // 20-80%
    const y = Math.random() * 50 + 25 // 25-75%
    
    setDogPosition({ x, y })
    setDogVisible(true)
    setDogClickable(true)

    const difficulty = getDifficultySettings()
    
    // Auto-hide dog after visibleTime
    gameTimerRef.current = setTimeout(() => {
      if (dogClickable) {
        handleMiss()
      }
    }, difficulty.visibleTime)
  }, [gameState.gameActive, levelUpBreak, dogClickable, getDifficultySettings])

  // Handle dog click
  const handleDogClick = useCallback(() => {
    if (!dogClickable || !gameState.gameActive) return

    clearAllTimers()
    setDogClickable(false)
    setDogVisible(false)

    const newScore = gameState.score + 1
    setGameState(prev => ({ ...prev, score: newScore }))

    // Check for level up
    const newLevel = GAME_LEVELS.find(level => 
      newScore >= level.minScore && newScore <= level.maxScore
    ) || GAME_LEVELS[GAME_LEVELS.length - 1]

    if (newLevel.level > gameState.level) {
      startLevelUpBreak(newLevel.level)
    } else {
      // Spawn next dog
      setTimeout(() => {
        if (gameState.gameActive) {
          spawnUglyDog()
        }
      }, 300)
    }
  }, [dogClickable, gameState.gameActive, gameState.score, gameState.level, clearAllTimers, spawnUglyDog])

  // Handle miss
  const handleMiss = useCallback(() => {
    if (!gameState.gameActive) return

    setShowMissAlert(true)
    setTimeout(() => setShowMissAlert(false), 600)

    const newMisses = gameState.misses + 1
    let newHealth = gameState.health
    let newScore = gameState.score

    if (newMisses >= 3) {
      newHealth = gameState.health - 1
      newScore = Math.max(0, gameState.score - 10)
      
      if (newHealth <= 0) {
        stopGame()
        return
      }
    }

    setGameState(prev => ({
      ...prev,
      misses: newMisses % 3, // Reset misses after losing health
      health: newHealth,
      score: newScore
    }))

    // Spawn next dog
    setTimeout(() => {
      if (gameState.gameActive) {
        spawnUglyDog()
      }
    }, getDifficultySettings().spawnDelay)
  }, [gameState, stopGame, spawnUglyDog, getDifficultySettings])

  // Start level up break
  const startLevelUpBreak = useCallback((newLevel) => {
    clearAllTimers()
    setLevelUpBreak(true)
    setBreakCountdown(5)
    setDogVisible(false)
    setDogClickable(false)

    levelUpTimerRef.current = setInterval(() => {
      setBreakCountdown(prev => {
        if (prev <= 1) {
          clearInterval(levelUpTimerRef.current)
          setLevelUpBreak(false)
          setGameState(prev => ({ ...prev, level: newLevel }))
          
          setTimeout(() => {
            if (gameState.gameActive) {
              spawnUglyDog()
            }
          }, 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearAllTimers, gameState.gameActive, spawnUglyDog])

  // Stop game
  const stopGame = useCallback(() => {
    clearAllTimers()
    setGameState(prev => ({
      ...prev,
      gameActive: false,
      score: 0,
      misses: 0,
      health: 3,
      level: 1
    }))
    setDogVisible(false)
    setDogClickable(false)
    setLevelUpBreak(false)
    setBreakCountdown(0)
  }, [clearAllTimers])

  // Start game
  const startGame = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    clearAllTimers()
    setGameState(prev => ({
      ...prev,
      gameActive: true,
      score: 0,
      misses: 0,
      health: 3,
      level: 1
    }))
    setDogVisible(false)
    setDogClickable(false)
    setLevelUpBreak(false)
    setBreakCountdown(0)

    // Spawn first dog
    setTimeout(() => {
      spawnUglyDog()
    }, 1000)
  }, [isAuthenticated, clearAllTimers, spawnUglyDog, router])

  // Save score to backend
  const saveScore = useCallback(async (score) => {
    if (!isAuthenticated || score === 0) return

    try {
      await api.post('/auth/game/saved', { session_score: score })
      fetchLeaderboard() // Refresh leaderboard
    } catch (error) {
      console.error('Failed to save score:', error)
    }
  }, [isAuthenticated, fetchLeaderboard])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [clearAllTimers])

  // Save score when game ends
  useEffect(() => {
    if (!gameState.gameActive && gameState.score > 0) {
      saveScore(gameState.score)
    }
  }, [gameState.gameActive, gameState.score, saveScore])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2">UglyDog Clicker</h1>
        <p className="text-yellow-400">Click the UglyDog before it disappears!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-green-400">Game</CardTitle>
                <div className="flex gap-4">
                  <div className="text-red-400">
                    ❤️ {gameState.health}
                  </div>
                  <div className="text-yellow-400">
                    ⭐ {gameState.score}
                  </div>
                  <div className="text-blue-400">
                    Level {currentLevel.level}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="relative bg-gray-800 rounded-lg h-96 overflow-hidden cursor-crosshair"
                onClick={(e) => {
                  if (gameState.gameActive && !levelUpBreak) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    
                    // Check if click is near dog
                    const distance = Math.sqrt(
                      Math.pow(x - dogPosition.x, 2) + Math.pow(y - dogPosition.y, 2)
                    )
                    
                    if (distance < 15 && dogVisible && dogClickable) {
                      handleDogClick()
                    } else {
                      handleMiss()
                    }
                  }
                }}
              >
                {/* UglyDog */}
                {dogVisible && (
                  <div
                    className="absolute w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl transition-all duration-200 cursor-pointer"
                    style={{
                      left: `${dogPosition.x}%`,
                      top: `${dogPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 0 20px rgba(134, 255, 0, 0.6)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDogClick()
                    }}
                  >
                    🐶
                  </div>
                )}

                {/* Level Up Break Overlay */}
                {levelUpBreak && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🎉</div>
                      <div className="text-3xl font-bold text-green-400 mb-2">LEVEL UP!</div>
                      <div className="text-xl mb-4">Level {currentLevel.level}</div>
                      <div className="text-4xl font-bold text-red-400">{breakCountdown}</div>
                      <div className="text-sm text-gray-400 mt-2">Get Ready...</div>
                    </div>
                  </div>
                )}

                {/* Start Game Overlay */}
                {!gameState.gameActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="text-center">
                      <Button 
                        onClick={startGame}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 text-xl"
                      >
                        {isAuthenticated ? 'Start Game' : 'Login to Play'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Miss Alert */}
                {showMissAlert && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-xl">
                    Miss!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div>
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">Daily Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div 
                    key={entry.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      entry.userId === user?.id ? 'bg-green-900' : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 text-center font-bold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : entry.rank}
                      </div>
                      <img 
                        src={entry.userAvatar || `https://ui-avatars.com/api/?name=${entry.userName}&background=86FF00&color=fff`} 
                        alt={entry.userName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm">{entry.userName}</span>
                    </div>
                    <div className="font-bold text-green-400">{entry.score}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}