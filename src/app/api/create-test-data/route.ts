import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Create a test user
    const testUser = await db.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        avatar: 'https://ui-avatars.com/api/?name=Test+User&background=86FF00&color=fff'
      }
    });

    // Create game profile
    const gameProfile = await db.gameProfile.create({
      data: {
        userId: testUser.id,
        highestScore: 100,
        totalGames: 5,
        totalTime: 300,
        level: 3
      }
    });

    // Create a test leaderboard entry
    const today = new Date().toISOString().split('T')[0];
    const leaderboard = await db.leaderboard.create({
      data: {
        userId: testUser.id,
        userName: testUser.name || 'Test User',
        userAvatar: testUser.avatar,
        score: 150,
        rank: 1,
        period: 'daily',
        date: today
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test data created successfully',
      user: testUser,
      gameProfile,
      leaderboard
    });
  } catch (error) {
    console.error('Create test data error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}