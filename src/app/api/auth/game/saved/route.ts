import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { session_score } = await request.json();

    // Get session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Extract user ID from session token
    const userId = sessionToken.split('_')[1];

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user with game profile
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        gameProfile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update game profile
    const updatedProfile = await db.gameProfile.update({
      where: { userId: userId },
      data: {
        highestScore: Math.max(user.gameProfile?.highestScore || 0, session_score),
        totalGames: (user.gameProfile?.totalGames || 0) + 1,
        // Update level based on score
        level: session_score >= 1000 ? 10 : 
               session_score >= 800 ? 9 :
               session_score >= 600 ? 8 :
               session_score >= 400 ? 7 :
               session_score >= 300 ? 6 :
               session_score >= 200 ? 5 :
               session_score >= 150 ? 4 :
               session_score >= 100 ? 3 :
               session_score >= 50 ? 2 : 1
      }
    });

    // Create game session record
    await db.gameSession.create({
      data: {
        userId: userId,
        profileId: user.gameProfile?.id,
        score: session_score,
        misses: 0, // Will be calculated from game logic
        accuracy: 100, // Will be calculated from game logic
        gameTime: 0, // Will be calculated from game logic
        level: updatedProfile.level,
        completed: true
      }
    });

    // Update leaderboard
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const existingLeaderboard = await db.leaderboard.findUnique({
      where: {
        userId_period_date: {
          userId: userId,
          period: 'daily',
          date: today
        }
      }
    });

    if (existingLeaderboard) {
      // Update existing leaderboard entry if new score is higher
      if (session_score > existingLeaderboard.score) {
        await db.leaderboard.update({
          where: { id: existingLeaderboard.id },
          data: {
            score: session_score
          }
        });
      }
    } else {
      // Create new leaderboard entry
      await db.leaderboard.create({
        data: {
          userId: userId,
          userName: user.name || 'Anonymous',
          userAvatar: user.avatar || '',
          score: session_score,
          rank: 0, // Will be calculated when fetching
          period: 'daily',
          date: today
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Score saved successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Save score error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save score' },
      { status: 500 }
    );
  }
}