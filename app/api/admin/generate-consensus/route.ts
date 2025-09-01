import { NextRequest, NextResponse } from 'next/server'
import { criticalConsensusService } from '@/lib/critical-consensus-service'
import { databaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const force = searchParams.get('force') === 'true'

    console.log(`[Admin] Starting consensus generation for ${limit} albums (force=${force})`)

    let albums: any[] = []
    
    if (force) {
      // Generate consensus for all albums regardless of existing consensus
      albums = await databaseService.getAlbums(limit)
    } else {
      // Only generate for albums without consensus
      albums = await databaseService.getAlbumsWithoutConsensus(limit)
    }

    if (albums.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No albums need consensus generation',
        processed: 0
      })
    }

    // Convert database albums to Album type
    const albumsForProcessing = albums.map(dbAlbum => ({
      id: dbAlbum.id,
      title: dbAlbum.title,
      artistCredit: dbAlbum.artistCredit,
      genres: dbAlbum.genres ? dbAlbum.genres.split(',').map((g: string) => g.trim()) : [],
      releaseDate: dbAlbum.releaseDate,
      label: dbAlbum.label || '',
      weeklyScore: dbAlbum.weeklyScore || 0,
      releaseGroupId: dbAlbum.releaseGroupId || '',
      primaryArtistId: dbAlbum.primaryArtistId || '',
      regions: dbAlbum.regions ? dbAlbum.regions.split(',').map((r: string) => r.trim()) : [],
      isReissue: dbAlbum.isReissue || false,
      primaryType: dbAlbum.primaryType as "Album" | "EP",
      coverUrl: dbAlbum.coverUrl || '',
      sourceTags: dbAlbum.sourceTags ? dbAlbum.sourceTags.split(',').map((t: string) => t.trim()) : [],
      sourceCount: dbAlbum.sourceCount || 1,
      badges: []
    }))

    // Process albums in smaller batches to avoid overwhelming OpenAI
    await criticalConsensusService.batchGenerateConsensus(albumsForProcessing, 3)

    return NextResponse.json({
      success: true,
      message: `Successfully generated consensus for ${albums.length} albums`,
      processed: albums.length,
      albums: albumsForProcessing.map(a => ({ id: a.id, title: a.title, artist: a.artistCredit }))
    })

  } catch (error) {
    console.error('[Admin] Error generating consensus:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate consensus',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get statistics about consensus generation
    const allAlbums = await databaseService.getAlbums(1000)
    const albumsWithoutConsensus = await databaseService.getAlbumsWithoutConsensus(1000)
    
    const totalAlbums = allAlbums.length
    const albumsWithConsensus = totalAlbums - albumsWithoutConsensus.length
    const consensusPercentage = totalAlbums > 0 ? Math.round((albumsWithConsensus / totalAlbums) * 100) : 0

    return NextResponse.json({
      totalAlbums,
      albumsWithConsensus,
      albumsWithoutConsensus: albumsWithoutConsensus.length,
      consensusPercentage,
      sampleAlbumsWithoutConsensus: albumsWithoutConsensus.slice(0, 10).map(album => ({
        id: album.id,
        title: album.title,
        artist: album.artistCredit,
        releaseDate: album.releaseDate
      }))
    })

  } catch (error) {
    console.error('[Admin] Error getting consensus stats:', error)
    return NextResponse.json(
      { error: 'Failed to get consensus statistics' },
      { status: 500 }
    )
  }
}

