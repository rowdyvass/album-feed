import { NextRequest, NextResponse } from 'next/server'
import { criticalConsensusService } from '@/lib/critical-consensus-service'
import { databaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log(`[Admin] Starting review generation for ${limit} albums`)

    // Get albums that don't have reviews yet
    const albums = await databaseService.getAlbumsWithoutReviews?.(limit) || []

    if (albums.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No albums need review generation',
        processed: 0
      })
    }

    const results = []

    // Process albums one by one to avoid overwhelming OpenAI
    for (const dbAlbum of albums) {
      try {
        // Convert database album to Album type
        const album = {
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
        }

        console.log(`[Admin] Generating reviews for "${album.title}" by ${album.artistCredit}`)
        
        // Generate mock reviews using OpenAI
        const mockReviews = await criticalConsensusService.generateMockReviews(album)
        
        // Store the generated reviews in the database
        if (mockReviews.length > 0) {
          await databaseService.storeAlbumReviews(mockReviews)
          console.log(`[Admin] ✓ Generated ${mockReviews.length} reviews for "${album.title}"`)
        }

        results.push({
          id: album.id,
          title: album.title,
          artist: album.artistCredit,
          reviewsGenerated: mockReviews.length,
          success: true
        })

        // Add a small delay between albums to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        console.error(`[Admin] ✗ Failed to generate reviews for "${dbAlbum.title}":`, error)
        results.push({
          id: dbAlbum.id,
          title: dbAlbum.title,
          artist: dbAlbum.artistCredit,
          reviewsGenerated: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalReviews = results.reduce((sum, r) => sum + r.reviewsGenerated, 0)

    return NextResponse.json({
      success: true,
      message: `Generated reviews for ${successCount}/${albums.length} albums`,
      processed: albums.length,
      successCount,
      totalReviews,
      results
    })

  } catch (error) {
    console.error('[Admin] Error generating reviews:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get statistics about review generation
    const allAlbums = await databaseService.getAlbums(1000)
    
    // Count albums with reviews
    let albumsWithReviews = 0
    let totalReviews = 0
    
    for (const album of allAlbums) {
      const reviews = await databaseService.getAlbumReviews(album.id)
      if (reviews.length > 0) {
        albumsWithReviews++
        totalReviews += reviews.length
      }
    }
    
    const totalAlbums = allAlbums.length
    const albumsWithoutReviews = totalAlbums - albumsWithReviews
    const reviewCoveragePercentage = totalAlbums > 0 ? Math.round((albumsWithReviews / totalAlbums) * 100) : 0
    const avgReviewsPerAlbum = albumsWithReviews > 0 ? Math.round((totalReviews / albumsWithReviews) * 10) / 10 : 0

    return NextResponse.json({
      totalAlbums,
      albumsWithReviews,
      albumsWithoutReviews,
      reviewCoveragePercentage,
      totalReviews,
      avgReviewsPerAlbum
    })

  } catch (error) {
    console.error('[Admin] Error getting review stats:', error)
    return NextResponse.json(
      { error: 'Failed to get review statistics' },
      { status: 500 }
    )
  }
}

