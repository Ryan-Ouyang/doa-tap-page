import { NextRequest, NextResponse } from "next/server"
import { startRewardPeriod } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { adminUsername } = await request.json()

    // Validate the input
    if (!adminUsername) {
      return NextResponse.json(
        { message: "Missing adminUsername parameter" },
        { status: 400 },
      )
    }

    // In a real application, you would validate the admin credentials here
    // For this demo, we'll just use the username as the created_by field

    // Start a new reward period (10 minutes)
    const rewardPeriod = await startRewardPeriod(adminUsername)

    if (!rewardPeriod) {
      return NextResponse.json(
        { message: "Failed to start reward period" },
        { status: 500 },
      )
    }

    // Return success response
    return NextResponse.json(
      {
        message: "Reward period started successfully",
        rewardPeriodId: rewardPeriod.id,
        startedAt: rewardPeriod.started_at,
        endedAt: rewardPeriod.ended_at,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error starting reward period:", error)

    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}
