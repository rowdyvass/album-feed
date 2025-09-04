import { NextRequest, NextResponse } from 'next/server'
import { musicBrainzService } from '@/lib/musicbrainz'
import { criticalConsensusService } from '@/lib/critical-consensus-service'
import { databaseService } from '@/lib/database'
import { wikipediaService } from '@/lib/wikipedia'
import type { AlbumDetail } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // First try to get the album from our curated feed
    const feedResponse = await fetch(`${request.nextUrl.origin}/api/feed?limit=100`)
    if (feedResponse.ok) {
      const feedData = await feedResponse.json()
      const albumFromFeed = feedData.items.find((a: any) => a.id === id)
      
      if (albumFromFeed) {
        // We found the album in our feed, use that data
        const album = albumFromFeed
        
        // Fetch additional details from MusicBrainz if needed
        let artist = null
        let wikipediaUrl: string | undefined
        let bioExcerpt = 'Artist information coming soon...'
        try {
          const release = await musicBrainzService.getRelease(id)
          const artistId = release['artist-credit']?.[0]?.artist?.id
          if (artistId) {
            artist = await musicBrainzService.getArtist(artistId)
            wikipediaUrl = artist?.relations?.find((r: any) => r.type === 'wikipedia')?.url?.resource
            if (wikipediaUrl) {
              try {
                const summary = await wikipediaService.getSummaryFromUrl(wikipediaUrl)
                if (summary) bioExcerpt = summary
              } catch (e) {
                console.warn('Failed to fetch Wikipedia summary:', e)
              }
            } else if (artist?.tags) {
              bioExcerpt = artist.tags.map((t: any) => t.name).join(', ')
            }
          }
        } catch (error) {
          console.warn('Failed to fetch additional MusicBrainz data:', error)
        }

        // Create mock streaming and purchase links (these will be enhanced in Phase 4)
        const streamingLinks = {
          spotify: {
            id: `spotify_${id}`,
            url: `https://open.spotify.com/search/${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`
          },
          appleMusic: {
            url: `https://music.apple.com/search?term=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`
          },
          bandcamp: {
            url: `https://bandcamp.com/search?q=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`
          }
        }

        const purchaseLinks = {
          bandcamp: `https://bandcamp.com/search?q=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`,
          roughTrade: `https://roughtrade.com/search?q=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`,
          amazon: `https://amazon.com/s?k=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`,
          discogs: `https://discogs.com/search/?q=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}&type=release`
        }

        // Generate recommendation blurb based on album data (this will be replaced by AI consensus)
        const recommendationBlurb = generateRecommendationBlurb(album, artist)

        // Get real critical consensus and reviews
        let criticalConsensus = recommendationBlurb
        let reviews: any[] = []

        try {
          // Get AI-powered critical consensus
          criticalConsensus = await criticalConsensusService.getCriticalConsensus(album)
          
          // Get real reviews from database, or generate them if none exist
          const albumReviews = await criticalConsensusService.getAlbumReviews(id)
          
          if (albumReviews.length === 0) {
            // Generate mock reviews using OpenAI
            console.log(`[Album API] Generating reviews for "${album.title}"`)
            const mockReviews = await criticalConsensusService.generateMockReviews(album)
            
            // Store them in the database
            if (mockReviews.length > 0) {
              await databaseService.storeAlbumReviews(mockReviews)
            }
            
            // Convert to expected format
            reviews = mockReviews.map(review => ({
              id: review.id,
              albumId: review.albumId,
              source: review.source,
              url: review.url || '#',
              score100: review.score ? (review.score / (review.maxScore || 10)) * 100 : album.weeklyScore,
              tag: review.score && review.maxScore && (review.score / review.maxScore) >= 0.85 ? 'BNM' : undefined,
              excerpt: review.excerpt,
              publishedAt: review.publishedAt || new Date().toISOString()
            }))
          } else {
            // Use existing reviews
            reviews = albumReviews.map(review => ({
              id: review.id,
              albumId: review.albumId,
              source: review.source,
              url: review.url || '#',
              score100: review.score ? (review.score / (review.maxScore || 10)) * 100 : album.weeklyScore,
              tag: review.score && review.maxScore && (review.score / review.maxScore) >= 0.85 ? 'BNM' : undefined,
              excerpt: review.excerpt,
              publishedAt: review.publishedAt || new Date().toISOString()
            }))
          }
        } catch (error) {
          console.error('[Album API] Error getting consensus/reviews:', error)
          // Fallback to original mock data
          reviews = [
            {
              id: `review_${id}_1`,
              albumId: id,
              source: 'SpinGrid',
              url: '#',
              score100: album.weeklyScore,
              tag: album.weeklyScore >= 85 ? 'BNM' : undefined,
              excerpt: recommendationBlurb,
              publishedAt: new Date().toISOString()
            }
          ]
        }

        const albumDetail: AlbumDetail = {
          ...album,
          artist: {
            id: artist?.id || '',
            name: artist?.name || album.artistCredit || '',
            wikidataId: undefined,
            wikipediaUrl: wikipediaUrl || (artist?.id && artist.name ? `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(artist.name)}` : undefined),
            bioExcerpt,
            relatedArtistIds: [],
            previousReleases: []
          },
          streamingLinks,
          purchaseLinks,
          recommendationBlurb: criticalConsensus,
          reviews
        }

        return NextResponse.json(albumDetail)
      }
    }

    // If we didn't find it in our feed, try MusicBrainz directly
    try {
      const release = await musicBrainzService.getRelease(id)
      const coverUrl = await musicBrainzService.getCoverArt(id)
      const album = musicBrainzService.convertToAlbum(release, coverUrl)
      
      // Fetch artist information
      const artistId = release['artist-credit']?.[0]?.artist?.id
      let artist = null
      let wikipediaUrl: string | undefined
      let bioExcerpt = 'Artist information coming soon...'
      if (artistId) {
        artist = await musicBrainzService.getArtist(artistId)
        wikipediaUrl = artist?.relations?.find((r: any) => r.type === 'wikipedia')?.url?.resource
        if (wikipediaUrl) {
          try {
            const summary = await wikipediaService.getSummaryFromUrl(wikipediaUrl)
            if (summary) bioExcerpt = summary
          } catch (e) {
            console.warn('Failed to fetch Wikipedia summary:', e)
          }
        } else if (artist?.tags) {
          bioExcerpt = artist.tags.map((t: any) => t.name).join(', ')
        }
      }

      // Create mock streaming and purchase links
      const streamingLinks = {
        spotify: {
          id: `spotify_${id}`,
          url: `https://open.spotify.com/search/${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`
        },
        appleMusic: {
          url: `https://music.apple.com/search?term=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`
        },
        bandcamp: {
          url: `https://bandcamp.com/search?q=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`
        }
      }

      const purchaseLinks = {
        bandcamp: `https://bandcamp.com/search?q=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`,
        roughTrade: `https://roughtrade.com/search?q=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`,
        amazon: `https://amazon.com/s?k=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}`,
        discogs: `https://discogs.com/search/?q=${encodeURIComponent(`${album.title} ${album.artistCredit}`)}&type=release`
      }

      const recommendationBlurb = generateRecommendationBlurb(album, artist)

      // Get real critical consensus and reviews for MusicBrainz fallback
      let criticalConsensus = recommendationBlurb
      let reviews: any[] = []

      try {
        // Get AI-powered critical consensus
        criticalConsensus = await criticalConsensusService.getCriticalConsensus(album)
        
        // Get real reviews from database, or generate them if none exist
        const albumReviews = await criticalConsensusService.getAlbumReviews(id)
        
        if (albumReviews.length === 0) {
          // Generate mock reviews using OpenAI
          console.log(`[Album API] Generating reviews for MusicBrainz album "${album.title}"`)
          const mockReviews = await criticalConsensusService.generateMockReviews(album)
          
          // Store them in the database
          if (mockReviews.length > 0) {
            await databaseService.storeAlbumReviews(mockReviews)
          }
          
          // Convert to expected format
          reviews = mockReviews.map(review => ({
            id: review.id,
            albumId: review.albumId,
            source: review.source,
            url: review.url || '#',
            score100: review.score ? (review.score / (review.maxScore || 10)) * 100 : album.weeklyScore,
            tag: review.score && review.maxScore && (review.score / review.maxScore) >= 0.85 ? 'BNM' : undefined,
            excerpt: review.excerpt,
            publishedAt: review.publishedAt || new Date().toISOString()
          }))
        } else {
          // Use existing reviews
          reviews = albumReviews.map(review => ({
            id: review.id,
            albumId: review.albumId,
            source: review.source,
            url: review.url || '#',
            score100: review.score ? (review.score / (review.maxScore || 10)) * 100 : album.weeklyScore,
            tag: review.score && review.maxScore && (review.score / review.maxScore) >= 0.85 ? 'BNM' : undefined,
            excerpt: review.excerpt,
            publishedAt: review.publishedAt || new Date().toISOString()
          }))
        }
      } catch (error) {
        console.error('[Album API] Error getting consensus/reviews for MusicBrainz album:', error)
        // Fallback to original mock data
        reviews = [
          {
            id: `review_${id}_1`,
            albumId: id,
            source: 'SpinGrid',
            url: '#',
            score100: album.weeklyScore,
            tag: album.weeklyScore >= 85 ? 'BNM' : undefined,
            excerpt: recommendationBlurb,
            publishedAt: new Date().toISOString()
          }
        ]
      }

      const albumDetail: AlbumDetail = {
        ...album,
        artist: {
          id: artist?.id || '',
          name: artist?.name || album.artistCredit,
          wikidataId: undefined,
          wikipediaUrl: wikipediaUrl || (artist?.id && artist.name ? `https://en.wikipedia.org/wiki/Special:Search/${encodeURIComponent(artist.name)}` : undefined),
          bioExcerpt,
          relatedArtistIds: [],
          previousReleases: []
        },
        streamingLinks,
        purchaseLinks,
        recommendationBlurb: criticalConsensus,
        reviews
      }

      return NextResponse.json(albumDetail)
    } catch (musicBrainzError) {
      console.error('Failed to fetch from MusicBrainz:', musicBrainzError)
      return NextResponse.json(
        { error: 'Album not found in curated feed or MusicBrainz' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    )
  }
}

function generateRecommendationBlurb(album: any, artist: any): string {
  const genre = album.genres[0]?.toLowerCase() || 'music'
  const isNew = new Date(album.releaseDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const isAlbum = album.primaryType === 'Album'
  
  let blurb = ''
  
  if (isNew) {
    blurb += `Fresh ${genre} release. `
  }
  
  if (isAlbum) {
    blurb += `A full-length ${genre} album that showcases `
  } else {
    blurb += `A ${genre} ${album.primaryType?.toLowerCase()} that highlights `
  }
  
  if (artist?.tags?.length > 0) {
    const artistStyle = artist.tags[0].name
    blurb += `${artistStyle} influences and `
  }
  
  blurb += `innovative songwriting. This is the kind of release that defines the current ${genre} landscape.`
  
  return blurb
}
