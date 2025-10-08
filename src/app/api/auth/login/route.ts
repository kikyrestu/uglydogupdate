import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Simple authentication for development
    // In production, use proper password hashing and validation
    let user = await db.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, create one (for development)
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: email.split('@')[0], // Use part before @ as name
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=86FF00&color=fff`
        }
      });

      // Create game profile for new user
      await db.gameProfile.create({
        data: {
          userId: user.id
        }
      });
    }

    // Create session token (simplified for development)
    const sessionToken = `session_${user.id}_${Date.now()}`;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });

    // Set session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}