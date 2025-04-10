import { createPublicClient } from "viem"
import { createSiweMessage } from "viem/siwe"
import { createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

// Get WalletConnect project ID from environment variable
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""

if (!walletConnectProjectId) {
  console.warn(
    "WalletConnect project ID is not set. Please add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID to your .env.local file.",
  )
}

export const CHAIN = base

// Create Wagmi config with popular mobile-friendly connectors
export const config = createConfig({
  chains: [base],
  connectors: [
    injected(), // MetaMask, Trust Wallet, etc.
    walletConnect({ projectId: walletConnectProjectId }), // WalletConnect
  ],
  transports: {
    [CHAIN.id]: http(),
  },
})

export const getPublicClient = () => {
  return createPublicClient({
    chain: CHAIN,
    transport: http(),
  })
}

/**
 * Creates a SIWE message for the given address with a 10-minute expiry
 * @param address The wallet address to create the message for
 * @returns A SIWE message string
 */
export function createWalletVerificationMessage(
  address: `0x${string}`,
): string {
  // Current time
  const now = new Date()

  // Expiry time (10 minutes from now)
  const expirationTime = new Date(now.getTime() + 10 * 60 * 1000)

  // TODO: get this in a better way
  const domain = window.location.host
  const origin = window.location.origin

  // Create the SIWE message
  return createSiweMessage({
    domain,
    address,
    statement:
      "Sign in to verify your wallet ownership for the Department of Agriculture reward claim. This signature will not trigger any blockchain transaction or cost any gas fees.",
    uri: origin,
    version: "1",
    chainId: CHAIN.id,
    nonce: Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((x) => (x % 36).toString(36))
      .join(""), // TODO: set this on the server and get it here vs generating it on the client
    issuedAt: now,
    expirationTime: expirationTime,
  })
}
