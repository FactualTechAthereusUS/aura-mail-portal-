import { NextResponse } from 'next/server';
import { UserManager } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const { username, password, fullName, dateOfBirth, gender, country } = userData;

    // Validate required fields
    if (!username || !password || !fullName || !dateOfBirth || !gender || !country) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'All fields are required' 
        },
        { status: 400 }
      );
    }

    // Validate username format
    const validation = UserManager.validateUsername(username);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.message 
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordStrength = getPasswordStrength(password);
    if (passwordStrength < 3) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password is too weak. Please use a stronger password.' 
        },
        { status: 400 }
      );
    }

    // Validate date of birth (must be a valid date and not in the future)
    const dobDate = new Date(dateOfBirth);
    const today = new Date();
    if (isNaN(dobDate.getTime()) || dobDate > today) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please enter a valid date of birth' 
        },
        { status: 400 }
      );
    }

    // Validate gender
    if (!['Male', 'Female'].includes(gender)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please select a valid gender' 
        },
        { status: 400 }
      );
    }

    // Validate country (basic validation - country should not be empty after trimming)
    if (!country.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please select your country' 
        },
        { status: 400 }
      );
    }

    // Create user account
    const result = await UserManager.createUser({
      username,
      password,
      fullName,
      dateOfBirth,
      gender,
      country
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        email: result.email
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Registration failed. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// Password strength calculation (same as frontend)
function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
} 