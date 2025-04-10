"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi"
import { createWalletVerificationMessage } from "@/lib/wagmi"
import { Address, Hex } from "viem"

interface WalletConnectProps {
  onSignatureComplete: (
    address: Address,
    message: string,
    signature: Hex,
  ) => void
}

export function WalletConnect({ onSignatureComplete }: WalletConnectProps) {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending: isConnectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync, isPending: isSignPending } = useSignMessage()

  const [error, setError] = useState<string | null>(null)
  const [signatureComplete, setSignatureComplete] = useState(false)

  // Handle signature completion
  const handleSign = async () => {
    if (!address) return

    setError(null)

    try {
      // Create a SIWE message with 10-minute expiry
      const siweMessage = createWalletVerificationMessage(
        address as `0x${string}`,
      )

      // Sign the message
      const signature = await signMessageAsync({ message: siweMessage })
      setSignatureComplete(true)
      onSignatureComplete(address, siweMessage, signature)
    } catch (err) {
      setError("Failed to sign message. Please try again.")
      console.error("Signature error:", err)
    }
  }

  // Reset state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setSignatureComplete(false)
    }
  }, [isConnected])

  // If not connected, show connect buttons
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Connect Your Wallet</h2>
        <p className="text-sm text-gray-600 mb-4">
          Connect your wallet to verify ownership and claim your reward.
        </p>

        <div className="space-y-2">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isConnectPending}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {isConnectPending
                ? "Connecting..."
                : `Connect with ${connector.name}`}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // If connected but not signed, show sign message button
  if (!signatureComplete) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Wallet Connected</h2>
          <button
            onClick={() => disconnect()}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Disconnect
          </button>
        </div>

        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-mono break-all">{address}</p>
        </div>

        <p className="text-sm text-gray-600">
          Please sign a message to verify you own this wallet.
        </p>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSign}
          disabled={isSignPending}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
        >
          {isSignPending ? "Signing..." : "Sign Message"}
        </button>
      </div>
    )
  }

  // If connected and signed, show success
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Wallet Verified</h2>
        <button
          onClick={() => disconnect()}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Disconnect
        </button>
      </div>

      <div className="p-3 bg-gray-100 rounded-lg">
        <p className="text-sm font-mono break-all">{address}</p>
      </div>

      <div className="p-3 bg-green-100 text-green-700 rounded-lg">
        <p className="text-sm">✓ Signature verified</p>
        <p className="text-xs mt-1">Valid for 10 minutes</p>
      </div>
    </div>
  )
}
