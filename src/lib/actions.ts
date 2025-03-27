'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OTP_COOKIE_NAME } from '@/middleware';

/**
 * Set the OTP cookie and redirect to the specified path
 * This must be a server action to properly set cookies and redirect
 */
export async function setOtpAndRedirect(path: string, otp: string): Promise<never> {
  // In Next.js 15, cookies() is an asynchronous function that returns a promise
  const cookieStore = await cookies();
  
  // Set the cookie using the correct method
  cookieStore.set(OTP_COOKIE_NAME, otp, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60, // 30 minutes in seconds
    path: '/',
  });
  
  // Redirect to the specified path
  return redirect(path);
}
