import { NextRequest, NextResponse } from "next/server"
import { OTP_COOKIE_NAME } from "@/middleware"

export async function GET(request: NextRequest) {
  // Get the OTP and redirect path from query parameters
  const { searchParams } = new URL(request.url)
  const otp = searchParams.get("otp")
  const redirectTo = searchParams.get("redirectTo")

  // Validate parameters
  if (!otp || !redirectTo) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    )
  }

  // Create a response that redirects to the specified path
  const response = NextResponse.redirect(new URL(redirectTo, request.url))

  // Set the OTP cookie on the response
  response.cookies.set({
    name: OTP_COOKIE_NAME,
    value: otp,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 60, // 30 minutes in seconds
    path: "/",
  })

  return response
}
