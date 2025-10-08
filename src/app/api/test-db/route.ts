import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}