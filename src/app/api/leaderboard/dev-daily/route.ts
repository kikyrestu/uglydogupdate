import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get daily leaderboard with rankings
    const leaderboard = await db.leaderboard.findMany({
      where: {
        period: 'daily',
        date: today
      },
      orderBy: {
        score: 'desc'
      },
      take: 10 // Limit to top 10 for dev
    });

    // Add rankings
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      id: entry.id,
      userId: entry.userId,
      userName: entry.userName,
      userAvatar: entry.userAvatar,
      score: entry.score,
      rank: index + 1
    }));

    return NextResponse.json({
      success: true,
      data: leaderboardWithRank
    });
  } catch (error) {
    console.error('Get dev-daily leaderboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}