import { openAIService } from './openai-service'
import { databaseService } from './database'
import type { Album } from '@/types'

interface CriticalConsensus {
  albumId: string
  consensus: string
  generatedAt: string
  model: string
}

interface ReviewData {
  id: string
  albumId: string
  source: string
  url: string | null
  score: number | null
  maxScore: number | null
  excerpt: string
  reviewer: string | null
  publishedAt: string | null
  scrapedAt: string
}

class CriticalConsensusService {
  async getCriticalConsensus(album: Album): Promise<string> {
    try {
      // First, check if we already have a consensus for this album
      const existingConsensus = await this.getStoredConsensus(album.id)
      
      if (existingConsensus && this.isConsensusFresh(existingConsensus.generatedAt)) {
        console.log(`[Consensus] Using cached consensus for "${album.title}"`)
        return existingConsensus.consensus
      }

      // Generate new consensus using OpenAI
      console.log(`[Consensus] Generating new consensus for "${album.title}" by ${album.artistCredit}`)
      
      const consensus = await openAIService.generateCriticalConsensus({
        title: album.title,
        artistCredit: album.artistCredit,
        genres: album.genres,
        releaseDate: album.releaseDate,
        label: album.label
      })

      // Store the generated consensus
      await this.storeConsensus({
        albumId: album.id,
        consensus,
        generatedAt: new Date().toISOString(),
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
      })

      return consensus

    } catch (error) {
      console.error(`[Consensus] Error getting consensus for album ${album.id}:`, error)
      
      // Return a fallback consensus
      return this.generateFallbackConsensus(album)
    }
  }

  async getAlbumReviews(albumId: string): Promise<ReviewData[]> {
    try {
      const reviews = await databaseService.getAlbumReviews(albumId)
      return reviews
    } catch (error) {
      console.error(`[Consensus] Error fetching reviews for album ${albumId}:`, error)
      return []
    }
  }

  async generateMockReviews(album: Album): Promise<ReviewData[]> {
    const mockReviews: ReviewData[] = []
    const publications = [
      { name: 'Pitchfork', maxScore: 10 },
      { name: 'Rolling Stone', maxScore: 5 },
      { name: 'AllMusic', maxScore: 5 }
    ]

    for (const pub of publications) {
      try {
        // Generate a score based on album's weeklyScore
        const score = this.generateReviewScore(album.weeklyScore, pub.maxScore)
        
        // Generate excerpt using OpenAI
        const excerpt = await openAIService.generateReviewExcerpt(
          {
            title: album.title,
            artistCredit: album.artistCredit,
            genres: album.genres
          },
          pub.name as 'Pitchfork' | 'Rolling Stone' | 'AllMusic',
          score
        )

        const review: ReviewData = {
          id: `generated_${albumId}_${pub.name.toLowerCase()}`,
          albumId: album.id,
          source: pub.name,
          url: this.generateReviewUrl(album, pub.name),
          score,
          maxScore: pub.maxScore,
          excerpt,
          reviewer: null,
          publishedAt: album.releaseDate,
          scrapedAt: new Date().toISOString()
        }

        mockReviews.push(review)

        // Small delay to avoid hitting OpenAI rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`[Consensus] Error generating ${pub.name} review:`, error)
        
        // Add fallback review
        mockReviews.push({
          id: `fallback_${album.id}_${pub.name.toLowerCase()}`,
          albumId: album.id,
          source: pub.name,
          url: this.generateReviewUrl(album, pub.name),
          score: this.generateReviewScore(album.weeklyScore, pub.maxScore),
          maxScore: pub.maxScore,
          excerpt: this.generateFallbackExcerpt(album, pub.name),
          reviewer: null,
          publishedAt: album.releaseDate,
          scrapedAt: new Date().toISOString()
        })
      }
    }

    return mockReviews
  }

  private async getStoredConsensus(albumId: string): Promise<CriticalConsensus | null> {
    try {
      return await databaseService.getCriticalConsensus(albumId)
    } catch (error) {
      console.error(`[Consensus] Error fetching stored consensus:`, error)
      return null
    }
  }

  private async storeConsensus(consensus: CriticalConsensus): Promise<void> {
    try {
      await databaseService.storeCriticalConsensus(consensus)
      console.log(`[Consensus] Stored consensus for album ${consensus.albumId}`)
    } catch (error) {
      console.error(`[Consensus] Error storing consensus:`, error)
    }
  }

  private isConsensusFresh(generatedAt: string, maxAgeHours: number = 720): boolean {
    // Default: consensus is fresh for 30 days (720 hours)
    const generated = new Date(generatedAt)
    const now = new Date()
    const ageHours = (now.getTime() - generated.getTime()) / (1000 * 60 * 60)
    
    return ageHours < maxAgeHours
  }

  private generateFallbackConsensus(album: Album): string {
    const primaryGenre = album.genres[0]?.toLowerCase() || 'music'
    
    const templates = [
      `A compelling ${primaryGenre} release that showcases ${album.artistCredit}'s artistic growth and musical sophistication. Critics have praised the album's cohesive vision and strong songwriting throughout.`,
      `${album.artistCredit} delivers a solid ${primaryGenre} effort with "${album.title}", featuring well-crafted compositions and polished production. The album demonstrates the artist's continued evolution and commitment to their craft.`,
      `This ${primaryGenre} release finds ${album.artistCredit} exploring new sonic territories while maintaining their distinctive sound. The album has been noted for its thoughtful arrangements and engaging musical narrative.`,
      `A mature and focused ${primaryGenre} album that highlights ${album.artistCredit}'s strengths as both songwriter and performer. The production is crisp and the performances are consistently engaging throughout.`
    ]
    
    // Use album ID to consistently select the same template
    const hash = album.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return templates[Math.abs(hash) % templates.length]
  }

  private generateReviewScore(weeklyScore: number, maxScore: number): number {
    // Convert weeklyScore (0-100) to publication scale
    const normalizedScore = weeklyScore / 100
    
    // Add some variance to make it more realistic
    const variance = (Math.random() - 0.5) * 0.2 // ±10% variance
    const adjustedScore = Math.max(0, Math.min(1, normalizedScore + variance))
    
    if (maxScore === 10) {
      // Pitchfork style (0.0 - 10.0)
      return Math.round(adjustedScore * 100) / 10
    } else {
      // Rolling Stone/AllMusic style (0 - 5)
      return Math.round(adjustedScore * maxScore * 2) / 2 // Round to nearest 0.5
    }
  }

  private generateReviewUrl(album: Album, publication: string): string {
    const searchQuery = encodeURIComponent(`${album.title} ${album.artistCredit}`)
    
    switch (publication) {
      case 'Pitchfork':
        return `https://pitchfork.com/search/?query=${searchQuery}`
      case 'Rolling Stone':
        return `https://www.rollingstone.com/search/articles/?q=${searchQuery}`
      case 'AllMusic':
        return `https://www.allmusic.com/search/albums/${searchQuery}`
      default:
        return '#'
    }
  }

  private generateFallbackExcerpt(album: Album, publication: string): string {
    const primaryGenre = album.genres[0] || 'music'
    
    const excerptsByPublication = {
      'Pitchfork': [
        `${album.artistCredit} crafts a cohesive ${primaryGenre} statement that rewards careful listening.`,
        `A thoughtfully constructed album that showcases the artist's evolving sonic palette.`,
        `The production choices here serve the songs well, creating an immersive listening experience.`
      ],
      'Rolling Stone': [
        `${album.artistCredit} delivers strong performances across this engaging ${primaryGenre} collection.`,
        `The musicianship shines throughout this well-produced effort.`,
        `A confident album that showcases the band's growth and musical chemistry.`
      ],
      'AllMusic': [
        `A solid addition to ${album.artistCredit}'s discography with consistent songwriting.`,
        `The album effectively balances accessibility with artistic ambition.`,
        `Well-executed ${primaryGenre} that should appeal to both newcomers and longtime fans.`
      ]
    }
    
    const options = excerptsByPublication[publication as keyof typeof excerptsByPublication] || excerptsByPublication['AllMusic']
    return options[Math.floor(Math.random() * options.length)]
  }

  async batchGenerateConsensus(albums: Album[], maxConcurrent: number = 3): Promise<void> {
    console.log(`[Consensus] Starting batch generation for ${albums.length} albums`)
    
    // Process albums in batches to avoid overwhelming OpenAI API
    for (let i = 0; i < albums.length; i += maxConcurrent) {
      const batch = albums.slice(i, i + maxConcurrent)
      
      await Promise.all(
        batch.map(async (album) => {
          try {
            await this.getCriticalConsensus(album)
            console.log(`[Consensus] ✓ Generated consensus for "${album.title}"`)
          } catch (error) {
            console.error(`[Consensus] ✗ Failed to generate consensus for "${album.title}":`, error)
          }
        })
      )
      
      // Small delay between batches
      if (i + maxConcurrent < albums.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log(`[Consensus] Batch generation completed`)
  }
}

export const criticalConsensusService = new CriticalConsensusService()

