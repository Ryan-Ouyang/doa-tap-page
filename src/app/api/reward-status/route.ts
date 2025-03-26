import { NextResponse } from 'next/server';

export async function GET() {
  // This is a mock implementation
  // In a real application, this would connect to your actual backend
  
  // Simulate different states based on some logic or randomness for testing
  // You can modify this to return a specific state for testing
  const states = [
    { rewardActive: false, rewardClaimed: false }, // "Rewards not active"
    { rewardActive: true, rewardClaimed: false },  // "Reward active, unclaimed"
    { rewardActive: true, rewardClaimed: true },   // "Reward claimed, reward still active"
    { rewardActive: false, rewardClaimed: true },  // "Reward claimed, reward not active"
  ];
  
  // For testing, you can choose a specific state or randomize
  const randomState = states[Math.floor(Math.random() * states.length)];
  
  return NextResponse.json(randomState);
}
