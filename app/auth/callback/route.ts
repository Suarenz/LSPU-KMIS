import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // With the new database authentication system, we no longer use external authentication verification
  // Redirect to dashboard or login page
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = '/dashboard'; // or '/login' depending on your preference
  return NextResponse.redirect(redirectTo);
}