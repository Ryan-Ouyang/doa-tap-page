import { NextResponse, type NextRequest } from 'next/server';
import { validateIykOtp } from '@/lib/iyk-api';

// Define the cookie name for the OTP
export const OTP_COOKIE_NAME = 'doa-tap-otp';

// Pages that require OTP authentication
const PROTECTED_PAGES = [
  '/reward-not-active',
  '/reward-active-unclaimed',
  '/reward-claimed-active',
  '/reward-claimed-inactive',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current page is a protected page
  const isProtectedPage = PROTECTED_PAGES.some(page => pathname.startsWith(page));
  
  // If not a protected page, continue without validation
  if (!isProtectedPage) {
    return NextResponse.next();
  }
  
  // Get the OTP from the cookie
  const otpCookie = request.cookies.get(OTP_COOKIE_NAME);
  
  // If no OTP cookie exists, redirect to the home page
  if (!otpCookie?.value) {
    console.log('No OTP cookie found, redirecting to home page');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Validate the OTP with the IYK API
  const { isExpired } = await validateIykOtp(otpCookie.value);
  
  // If the OTP is invalid, redirect to the home page
  if (isExpired) {
    console.log('Invalid OTP, redirecting to home page');
    
    // Create a response that redirects to the home page
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Delete the invalid OTP cookie
    response.cookies.delete(OTP_COOKIE_NAME);
    
    return response;
  }
  
  // OTP is valid, continue to the protected page
  return NextResponse.next();
}

// Configure middleware to only run on paths prefixed with "reward"
export const config = {
  matcher: ['/reward-:path*']
};
