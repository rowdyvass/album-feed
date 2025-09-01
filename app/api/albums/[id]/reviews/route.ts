import { NextRequest, NextResponse } from 'next/server'
import { criticalConsensusService } from '@/lib/critical-consensus-service'
import { databaseService } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const generateMock = searchParams.get('generateMock') === 'true'

    // First get existing reviews from database
    let reviews = await criticalConsensusService.getAlbumReviews(id)

    // If no reviews found and generateMock is true, generate mock reviews
    if (reviews.length === 0 && generateMock) {
      // Get the album from the database to generate mock reviews
      const album = await databaseService.getAlbumById(id)
      if (album) {
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

        console.log(`[Reviews API] Generating mock reviews for "${album.title}"`)
        
        // Generate mock reviews using OpenAI
        const mockReviews = await criticalConsensusService.generateMockReviews(albumData)
        
        // Store the generated reviews in the database
        if (mockReviews.length > 0) {
          await databaseService.storeAlbumReviews(mockReviews)
          console.log(`[Reviews API] Stored ${mockReviews.length} mock reviews for album ${id}`)
        }
        
        reviews = mockReviews
      }
    }

    // Format reviews for response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      publication: review.source,
      score: review.score,
      maxScore: review.maxScore,
      excerpt: review.excerpt,
      url: review.url,
      reviewer: review.reviewer,
      publishedAt: review.publishedAt,
      isGenerated: review.id.startsWith('generated_') || review.id.startsWith('fallback_')
    }))

    return NextResponse.json({
      albumId: id,
      reviews: formattedReviews,
      totalCount: formattedReviews.length,
      sources: [...new Set(formattedReviews.map(r => r.publication))]
    })

  } catch (error) {
    console.error('Error getting album reviews:', error)
    return NextResponse.json(
      { error: 'Failed to get album reviews' },
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
    const body = await request.json()
    
    // Store custom review
    const review = {
      id: `custom_${id}_${Date.now()}`,
      albumId: id,
      source: body.source || 'Custom',
      url: body.url || null,
      score: body.score || null,
      maxScore: body.maxScore || null,
      excerpt: body.excerpt,
      reviewer: body.reviewer || null,
      publishedAt: body.publishedAt || new Date().toISOString(),
      scrapedAt: new Date().toISOString()
    }

    await databaseService.storeAlbumReviews([review])

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        publication: review.source,
        score: review.score,
        maxScore: review.maxScore,
        excerpt: review.excerpt,
        url: review.url,
        reviewer: review.reviewer,
        publishedAt: review.publishedAt
      }
    })

  } catch (error) {
    console.error('Error storing custom review:', error)
    return NextResponse.json(
      { error: 'Failed to store review' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Delete all reviews for the album
    await databaseService.deleteAlbumReviews?.(id)

    return NextResponse.json({
      success: true,
      message: `Deleted all reviews for album ${id}`
    })

  } catch (error) {
    console.error('Error deleting album reviews:', error)
    return NextResponse.json(
      { error: 'Failed to delete reviews' },
      { status: 500 }
    )
  }
}
