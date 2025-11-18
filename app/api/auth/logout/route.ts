import { NextRequest, NextResponse } from 'next/server';

// Explicitly set the runtime to edge to ensure compatibility
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // In a JWT-based system, logout is typically just removing the token from the client
    // We can add server-side token invalidation if needed, but for now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during logout' },
      { status: 500 }
    );
  }
}