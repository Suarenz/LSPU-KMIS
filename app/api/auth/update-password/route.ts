import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';
import passwordService from '@/lib/services/password-service';

interface UpdatePasswordRequestBody {
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication using the existing middleware
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;
    const body: UpdatePasswordRequestBody = await request.json();
    const { newPassword } = body;

    // Validate input
    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await passwordService.hashPassword(newPassword);

    // Update the password in the database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating password' },
      { status: 500 }
    );
 }
}