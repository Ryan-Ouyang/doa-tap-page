import { Address, Hex } from "viem"
import { parseSiweMessage } from "viem/siwe"
import { getPublicClient } from "./wagmi"

/**
 * Verify that a signature was created by the provided wallet address
 * and that the signature hasn't expired (10-minute validity)
 *
 * @param walletAddress The wallet address that supposedly created the signature
 * @param signature The signature to verify
 * @param message The SIWE message that was signed
 * @returns True if the signature is valid and not expired, false otherwise
 */
export async function verifyWalletSignature(
  signature: Hex,
  message: string,
): Promise<{ isValid: boolean; address: Address | null }> {
  try {
    const fields = parseSiweMessage(message)

    if (fields.expirationTime) {
      const expiryTime = new Date(fields.expirationTime)
      const now = new Date()

      if (now > expiryTime) {
        console.error("Signature has expired")
        return {
          isValid: false,
          address: null,
        }
      }
    }

    if (!fields.address) {
      console.error("Invalid SIWE message: missing address")
      return {
        isValid: false,
        address: null,
      }
    }

    // Verify the signature
    const isValid = await getPublicClient().verifySiweMessage({
      message,
      signature,
    })

    if (!isValid) {
      console.error("Signature verification failed")
      return {
        isValid: false,
        address: null,
      }
    }

    return {
      isValid: true,
      address: fields.address,
    }
  } catch (error) {
    console.error("Error verifying signature:", error)
    return {
      isValid: false,
      address: null,
    }
  }
}
