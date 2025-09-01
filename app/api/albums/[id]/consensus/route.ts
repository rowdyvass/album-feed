import { NextRequest, NextResponse } from 'next/server'
import { criticalConsensusService } from '@/lib/critical-consensus-service'
import { databaseService } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // First get the album from the database
    const album = await databaseService.getAlbumById(id)
    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Convert to Album type format
    const albumData = {
      id: album.id,
      title: album.title,
      artistCredit: album.artistCredit,
      genres: album.genres ? album.genres.split(',').map(g => g.trim()) : [],
      releaseDate: album.releaseDate,
      label: album.label || '',
      weeklyScore: album.weeklyScore || 0,
      releaseGroupId: album.releaseGroupId || '',
      primaryArtistId: album.primaryArtistId || '',
      regions: album.regions ? album.regions.split(',').map(r => r.trim()) : [],
      isReissue: album.isReissue || false,
      primaryType: album.primaryType as "Album" | "EP",
      coverUrl: album.coverUrl || '',
      sourceTags: album.sourceTags ? album.sourceTags.split(',').map(t => t.trim()) : [],
      sourceCount: album.sourceCount || 1,
      badges: []
    }

    // Generate or retrieve critical consensus
    const consensus = await criticalConsensusService.getCriticalConsensus(albumData)

    return NextResponse.json({
      albumId: id,
      consensus,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting critical consensus:', error)
    return NextResponse.json(
      { error: 'Failed to get critical consensus' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the album from the database
    const album = await databaseService.getAlbumById(id)
    if (!album) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    // Convert to Album type format
    const albumData = {
      id: album.id,
      title: album.title,
      artistCredit: album.artistCredit,
      genres: album.genres ? album.genres.split(',').map(g => g.trim()) : [],
      releaseDate: album.releaseDate,
      label: album.label || '',
      weeklyScore: album.weeklyScore || 0,
      releaseGroupId: album.releaseGroupId || '',
      primaryArtistId: album.primaryArtistId || '',
      regions: album.regions ? album.regions.split(',').map(r => r.trim()) : [],
      isReissue: album.isReissue || false,
      primaryType: album.primaryType as "Album" | "EP",
      coverUrl: album.coverUrl || '',
      sourceTags: album.sourceTags ? album.sourceTags.split(',').map(t => t.trim()) : [],
      sourceCount: album.sourceCount || 1,
      badges: []
    }

    // Force regenerate consensus
    const consensus = await criticalConsensusService.getCriticalConsensus(albumData)

    return NextResponse.json({
      albumId: id,
      consensus,
      regenerated: true,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error regenerating critical consensus:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate critical consensus' },
      { status: 500 }
    )
  }
}
