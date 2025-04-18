/**
 * Utilities for interacting with the IYK API
 * Documentation: https://docs.iyk.app/api-core/refs
 */

/**
 * Response type for the IYK API /refs/:id endpoint
 */
export type IykRefResponse = {
  isValidRef: boolean
  uid: string | null
  otp: {
    code: string
  } | null
}

/**
 * Response type for the IYK API /otps/:id endpoint
 */
export type IykOtpResponse = {
  isExpired: boolean
  uid: string | null
}

/**
 * Validate an IYK reference ID
 * @param iykRef The reference ID from the NFC chip
 * @returns The validation response with isValidRef, uid, and otp
 */
export async function validateIykRef(iykRef: string): Promise<IykRefResponse> {
  try {
    const apiUrl = process.env.IYK_API_URL || "https://api.iyk.app"
    const response = await fetch(`${apiUrl}/refs/${iykRef}`)

    if (!response.ok) {
      console.error(`IYK API error: ${response.status} ${response.statusText}`)
      return { isValidRef: false, uid: null, otp: null }
    }

    const data = await response.json()
    return data as IykRefResponse
  } catch (error) {
    console.error("Error validating IYK reference:", error)
    return { isValidRef: false, uid: null, otp: null }
  }
}

/**
 * Validate an IYK OTP code
 * @param otp The OTP code to validate
 * @returns The validation response with isValidOtp and uid
 */
export async function validateIykOtp(otp: string): Promise<IykOtpResponse> {
  try {
    const apiUrl = process.env.IYK_API_URL || "https://api.iyk.app"
    const response = await fetch(`${apiUrl}/otps/${otp}`)

    if (!response.ok) {
      console.error(`IYK API error: ${response.status} ${response.statusText}`)
      return { isExpired: true, uid: null }
    }

    const data = await response.json()
    return data as IykOtpResponse
  } catch (error) {
    console.error("Error validating IYK OTP:", error)
    return { isExpired: true, uid: null }
  }
}
