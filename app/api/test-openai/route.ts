import { NextRequest, NextResponse } from 'next/server'
import { openAIService } from '@/lib/openai-service'

export async function GET(request: NextRequest) {
  try {
    // Test OpenAI connection
    const isConnected = await openAIService.testConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI connection failed'
      }, { status: 500 })
    }

    // Test consensus generation
    const testAlbum = {
      title: "Test Album",
      artistCredit: "Test Artist",
      genres: ["Indie Rock", "Alternative"],
      releaseDate: "2024-01-01",
      label: "Test Records"
    }

    const consensus = await openAIService.generateCriticalConsensus(testAlbum)

    return NextResponse.json({
      success: true,
      openaiConnected: isConnected,
      testConsensus: consensus,
      message: 'OpenAI service is working correctly!'
    })

  } catch (error) {
    console.error('OpenAI test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

