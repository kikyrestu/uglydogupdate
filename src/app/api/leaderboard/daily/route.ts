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
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      take: 50 // Limit to top 50
    });

    // Add rankings
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    return NextResponse.json({
      success: true,
      data: leaderboardWithRank
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}