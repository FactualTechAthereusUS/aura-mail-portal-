import { NextResponse } from 'next/server';
import { UserManager } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    // Validate username format
    const validation = UserManager.validateUsername(username);
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        message: validation.message
      });
    }

    // Check availability in database
    const isAvailable = await UserManager.isUsernameAvailable(username);

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable 
        ? `${username}@aurafarming.co is available!` 
        : 'This username is already taken'
    });

  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { 
        available: false, 
        message: 'Error checking username availability' 
      },
      { status: 500 }
    );
  }
} 