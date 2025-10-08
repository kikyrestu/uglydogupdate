import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    // Check if user exists
    let user = await db.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, create one (for development)
    if (!user) {
      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      user = await db.user.create({
        data: {
          email,
          username: username || email.split('@')[0],
          password: hashedPassword,
          name: username || email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username || email.split('@')[0])}&background=86FF00&color=fff`
        }
      });

      // Create game profile for new user
      await db.gameProfile.create({
        data: {
          userId: user.id
        }
      });
    } else {
      // If user exists and password is provided, verify it
      if (password && user.password) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return NextResponse.json(
            { success: false, error: 'Invalid password' },
            { status: 401 }
          );
        }
      }
    }

    // Create session token (simplified for development)
    const sessionToken = `session_${user.id}_${Date.now()}`;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
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