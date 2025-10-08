import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: 'kikyrestu@uglydog.com' }
    })

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          name: existingUser.name
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('uglydog123', 10)

    // Create user for kikyrestu
    const user = await db.user.create({
      data: {
        email: 'kikyrestu@uglydog.com',
        username: 'kikyrestu',
        password: hashedPassword,
        name: 'Kiky Restu',
        avatar: 'https://ui-avatars.com/api/?name=Kiky+Restu&background=86FF00&color=fff'
      }
    })

    // Create game profile
    const gameProfile = await db.gameProfile.create({
      data: {
        userId: user.id,
        highestScore: 500,
        totalGames: 10,
        totalTime: 600,
        level: 5
      }
    })

    // Create leaderboard entry
    const leaderboard = await db.leaderboard.create({
      data: {
        userId: user.id,
        userName: user.name || user.username || 'Kiky Restu',
        userAvatar: user.avatar,
        score: 750,
        rank: 1,
        period: 'daily',
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Kiky Restu user created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar
      },
      gameProfile,
      leaderboard
    })

  } catch (error) {
    console.error('Error creating kiky user:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    }, { status: 500 })
  }
}