import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import passwordService from '@/lib/services/password-service';

interface ResetPasswordRequestBody {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequestBody = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email in the database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      // Don't reveal if the email exists or not for security reasons
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a reset link has been sent'
      });
    }

    // In a real implementation, you would send an email with a reset token
    // For now, we'll just return success without actually sending an email
    console.warn('Password reset functionality: In a real implementation, send an email with a reset token to', email);

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a reset link has been sent'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while resetting password' },
      { status: 500 }
    );
  }
}