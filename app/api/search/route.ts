import { NextRequest, NextResponse } from 'next/server'
import { musicBrainzService } from '@/lib/musicbrainz'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Search for releases in MusicBrainz
    const releases = await musicBrainzService.searchReleases(query, limit)
    
    // Convert to our Album format and fetch cover art
    const albums = await Promise.all(
      releases.map(async (release) => {
        const coverUrl = await musicBrainzService.getCoverArt(release.id)
        return musicBrainzService.convertToAlbum(release, coverUrl)
      })
    )

    return NextResponse.json({
      albums,
      totalCount: albums.length,
      query
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
