import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllCachedAlbums, 
  getCacheStats, 
  clearCache, 
  prePopulateCache,
  addKnownAlbum 
} from '@/lib/spotify-album-database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'stats':
        const stats = getCacheStats()
        return NextResponse.json({
          success: true,
          stats,
          message: 'Cache statistics retrieved'
        })

      case 'list':
        const albums = getAllCachedAlbums()
        return NextResponse.json({
          success: true,
          albums,
          count: albums.length,
          message: 'Cached albums retrieved'
        })

      case 'prepopulate':
        prePopulateCache()
        return NextResponse.json({
          success: true,
          message: 'Cache pre-populated with known albums'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: stats, list, or prepopulate'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('[Spotify Admin API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'clear') {
      clearCache()
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully'
      })
    }

    if (action === 'add') {
      const body = await request.json()
      const { id, title, artist, confidence = 100 } = body

      if (!id || !title || !artist) {
        return NextResponse.json({
          success: false,
          error: 'Missing required fields: id, title, artist'
        }, { status: 400 })
      }

      addKnownAlbum(id, title, artist, confidence)
      return NextResponse.json({
        success: true,
        message: `Album "${title}" by ${artist} added to cache`
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: clear or add'
    }, { status: 400 })

  } catch (error) {
    console.error('[Spotify Admin API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
