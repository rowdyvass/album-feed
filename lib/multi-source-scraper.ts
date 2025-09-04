import { musicBrainzService } from './musicbrainz'
import { coverArtService } from './cover-art-service'

export interface MultiSourceRelease {
  title: string
  artist: string
  reviewDate: string
  genre: string
  sources: string[]
  sourceCount: number
  reviewUrl?: string
  musicBrainzRelease?: any
  coverUrl?: string
}

export interface ScrapedSource {
  name: string
  url: string
  releases: MultiSourceRelease[]
}

export class MultiSourceScraperService {
  private readonly SOURCES = {
    PITCHFORK_BEST_ALBUMS: {
      name: 'Pitchfork Best New Albums',
      url: 'https://pitchfork.com/reviews/best/albums/',
      type: 'pitchfork'
    },
    PITCHFORK_BEST_REISSUES: {
      name: 'Pitchfork Best New Reissues',
      url: 'https://pitchfork.com/reviews/best/reissues/',
      type: 'pitchfork'
    },
    ALLMUSIC_FEATURED: {
      name: 'AllMusic Featured New Releases',
      url: 'https://www.allmusic.com/newreleases',
      type: 'allmusic'
    },
    STEREOGUM_HEAVY_ROTATION: {
      name: 'Stereogum Heavy Rotation',
      url: 'https://www.stereogum.com/heavy-rotation/2025/',
      type: 'stereogum'
    },
    AQUARIUM_DRUNKARD_TURNTABLE: {
      name: 'Aquarium Drunkard On The Turntable',
      url: 'https://aquariumdrunkard.com/',
      type: 'aquarium'
    }
  }

  /**
   * Scrape all sources and return deduplicated releases
   */
  async scrapeAllSources(): Promise<MultiSourceRelease[]> {
    try {
      console.log('[MultiSource] Starting scrape of all sources...')
      
      const allReleases: MultiSourceRelease[] = []
      const sourceResults: ScrapedSource[] = []

      // Scrape each source
      for (const [key, source] of Object.entries(this.SOURCES)) {
        try {
          console.log(`[MultiSource] Scraping ${source.name}...`)
          const releases = await this.scrapeSource(source)
          sourceResults.push({
            name: source.name,
            url: source.url,
            releases
          })
          
          // Add source tag to each release
          releases.forEach(release => {
            release.sources = [source.name]
            release.sourceCount = 1
          })
          
          allReleases.push(...releases)
          
          // Rate limiting between sources
          await this.delay(1000)
        } catch (error) {
          console.error(`[MultiSource] Error scraping ${source.name}:`, error)
        }
      }

      // Deduplicate releases and merge sources
      const deduplicatedReleases = this.deduplicateReleases(allReleases)
      
      console.log(`[MultiSource] Scraped ${allReleases.length} total releases, ${deduplicatedReleases.length} unique`)
      
      return deduplicatedReleases
    } catch (error) {
      console.error('[MultiSource] Error scraping all sources:', error)
      return []
    }
  }

  /**
   * Scrape a specific source based on its type
   */
  private async scrapeSource(source: any): Promise<MultiSourceRelease[]> {
    switch (source.type) {
      case 'pitchfork':
        return this.scrapePitchfork(source.url)
      case 'allmusic':
        return this.scrapeAllMusic(source.url)
      case 'stereogum':
        return this.scrapeStereogum(source.url)
      case 'aquarium':
        return this.scrapeAquariumDrunkard(source.url)
      default:
        console.warn(`[MultiSource] Unknown source type: ${source.type}`)
        return []
    }
  }

  /**
   * Make a fetch request with proper headers to avoid blocking
   */
  private async makeRequest(url: string): Promise<Response> {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }

    return fetch(url, {
      headers,
      timeout: 10000 // 10 second timeout
    })
  }

  /**
   * Scrape Pitchfork Best New Albums/Reissues
   */
  private async scrapePitchfork(url: string): Promise<MultiSourceRelease[]> {
    try {
      console.log('[MultiSource] Attempting to scrape Pitchfork...')
      const response = await this.makeRequest(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const html = await response.text()
      console.log(`[MultiSource] Pitchfork HTML length: ${html.length} characters`)
      
      const releases: MultiSourceRelease[] = []
      
      // Multiple patterns for Pitchfork's structure
      const patterns = [
        // Look for album titles in various HTML structures
        /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g,
        /<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/g,
        /<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/g
      ]
      
      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(html)) !== null) {
          const title = match[1].trim()
          if (title && title.length > 3 && title.length < 100 && 
              !title.includes('Pitchfork') && !title.includes('Best New') &&
              !title.includes('Reviews') && !title.includes('Albums')) {
            
            // Try to extract artist from context
            const context = html.substring(Math.max(0, match.index - 300), match.index + 300)
            const artistPatterns = [
              /by\s+([^,<]+)/gi,
              /artist[^>]*>([^<]+)</gi,
              /performer[^>]*>([^<]+)</gi
            ]
            
            let artist = 'Unknown Artist'
            for (const artistPattern of artistPatterns) {
              const artistMatch = context.match(artistPattern)
              if (artistMatch) {
                artist = artistMatch[0].replace(/^(by\s+|artist[^>]*>|performer[^>]*>)/i, '').trim()
                break
              }
            }
            
            releases.push({
              title,
              artist,
              reviewDate: new Date().toISOString().split('T')[0],
              genre: 'Unknown',
              sources: [],
              sourceCount: 0
            })
          }
        }
      }
      
      // Remove duplicates based on title
      const uniqueReleases = releases.filter((release, index, self) => 
        index === self.findIndex(r => r.title.toLowerCase() === release.title.toLowerCase())
      )
      
      console.log(`[MultiSource] Pitchfork found ${releases.length} total releases, ${uniqueReleases.length} unique`)
      return uniqueReleases.slice(0, 30) // Increased limit for Pitchfork
    } catch (error) {
      console.error('[MultiSource] Error scraping Pitchfork:', error)
      return []
    }
  }

  /**
   * Scrape AllMusic Featured New Releases
   */
  private async scrapeAllMusic(url: string): Promise<MultiSourceRelease[]> {
    try {
      console.log('[MultiSource] Attempting to scrape AllMusic...')
      const response = await this.makeRequest(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const html = await response.text()
      console.log(`[MultiSource] AllMusic HTML length: ${html.length} characters`)
      
      const releases: MultiSourceRelease[] = []
      
      // Multiple patterns for AllMusic's structure
      const patterns = [
        // Look for album titles in various HTML structures
        /<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/g,
        /<h[1-6][^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h[1-6]>/g,
        /<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/g,
        // Look for album links
        /<a[^>]*href="[^"]*\/album\/[^"]*"[^>]*>([^<]+)<\/a>/g,
        // Look for artist-album combinations
        /<a[^>]*>([^<]+)<\/a>[^<]*<a[^>]*>([^<]+)<\/a>/g,
        // Generic heading patterns as fallback
        /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g
      ]
      
      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(html)) !== null) {
          let title = match[1]?.trim()
          let artist = 'Unknown Artist'
          
          // Handle artist-album combinations
          if (match[2]) {
            artist = match[1]?.trim() || 'Unknown Artist'
            title = match[2]?.trim()
          }
          
          if (title && title.length > 3 && title.length < 100 && 
              !title.includes('AllMusic') && !title.includes('New Releases') &&
              !title.includes('Featured') && !title.includes('Browse')) {
            
            // Try to extract artist from context if not already found
            if (artist === 'Unknown Artist') {
              const context = html.substring(Math.max(0, match.index - 300), match.index + 300)
              const artistPatterns = [
                /by\s+([^,<]+)/gi,
                /artist[^>]*>([^<]+)</gi,
                /performer[^>]*>([^<]+)</gi
              ]
              
              for (const artistPattern of artistPatterns) {
                const artistMatch = context.match(artistPattern)
                if (artistMatch) {
                  artist = artistMatch[0].replace(/^(by\s+|artist[^>]*>|performer[^>]*>)/i, '').trim()
                  break
                }
              }
            }
            
            // Clean up any HTML artifacts
            title = title.replace(/<[^>]*>/g, '').trim()
            artist = artist.replace(/<[^>]*>/g, '').trim()
            
            // Skip if title or artist contains HTML artifacts
            if (title.includes('<') || title.includes('>') || artist.includes('<') || artist.includes('>')) {
              continue
            }
            
            releases.push({
              title,
              artist,
              reviewDate: new Date().toISOString().split('T')[0],
              genre: 'Unknown',
              sources: [],
              sourceCount: 0
            })
          }
        }
      }
      
      // Remove duplicates based on title
      const uniqueReleases = releases.filter((release, index, self) => 
        index === self.findIndex(r => r.title.toLowerCase() === release.title.toLowerCase())
      )
      
      console.log(`[MultiSource] AllMusic found ${releases.length} total releases, ${uniqueReleases.length} unique`)
      return uniqueReleases.slice(0, 50) // Increased limit for AllMusic
    } catch (error) {
      console.error('[MultiSource] Error scraping AllMusic:', error)
      return []
    }
  }

  /**
   * Scrape Stereogum Heavy Rotation
   */
  private async scrapeStereogum(url: string): Promise<MultiSourceRelease[]> {
    try {
      console.log('[MultiSource] Attempting to scrape Stereogum...')
      const response = await this.makeRequest(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const html = await response.text()
      console.log(`[MultiSource] Stereogum HTML length: ${html.length} characters`)
      
      const releases: MultiSourceRelease[] = []

      // Stereogum Heavy Rotation posts typically list albums in <strong> or <em>
      // tags using the pattern "Artist – Album". Extract those pairs.
      const patterns = [
        /<strong>\s*([^<]+?)\s*[–-]\s*([^<]+?)\s*<\/strong>/g,
        /<em>\s*([^<]+?)\s*[–-]\s*([^<]+?)\s*<\/em>/g
      ]

      const seen = new Set<string>()
      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(html)) !== null) {
          const artist = match[1].trim()
          const title = match[2].trim()
          if (artist && title && !seen.has(`${artist}-${title}`.toLowerCase())) {
            releases.push({
              title,
              artist,
              reviewDate: new Date().toISOString().split('T')[0],
              genre: 'Unknown',
              sources: [],
              sourceCount: 0
            })
            seen.add(`${artist}-${title}`.toLowerCase())
          }
        }
      }

      console.log(`[MultiSource] Stereogum found ${releases.length} potential releases`)
      return releases.slice(0, 20)
    } catch (error) {
      console.error('[MultiSource] Error scraping Stereogum:', error)
      return []
    }
  }

  /**
   * Scrape Aquarium Drunkard On The Turntable
   */
  private async scrapeAquariumDrunkard(url: string): Promise<MultiSourceRelease[]> {
    try {
      console.log('[MultiSource] Attempting to scrape Aquarium Drunkard...')
      const response = await this.makeRequest(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const html = await response.text()
      console.log(`[MultiSource] Aquarium Drunkard HTML length: ${html.length} characters`)
      
      const releases: MultiSourceRelease[] = []
      
      // Try multiple patterns for Aquarium Drunkard
      const patterns = [
        /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g,
        /<a[^>]*class="[^"]*entry-title[^"]*"[^>]*>([^<]+)<\/a>/g,
        /<h2[^>]*class="[^"]*entry-title[^"]*"[^>]*>([^<]+)<\/h2>/g
      ]
      
      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(html)) !== null) {
          const title = match[1].trim()
          if (title && title.length > 3 && title.length < 100 && !title.includes('Aquarium Drunkard')) {
            releases.push({
              title,
              artist: 'Unknown Artist',
              reviewDate: new Date().toISOString().split('T')[0],
              genre: 'Unknown',
              sources: [],
              sourceCount: 0
            })
          }
        }
      }
      
      console.log(`[MultiSource] Aquarium Drunkard found ${releases.length} potential releases`)
      return releases.slice(0, 20)
    } catch (error) {
      console.error('[MultiSource] Error scraping Aquarium Drunkard:', error)
      return []
    }
  }

  /**
   * Deduplicate releases and merge sources
   */
  private deduplicateReleases(releases: MultiSourceRelease[]): MultiSourceRelease[] {
    const releaseMap = new Map<string, MultiSourceRelease>()
    
    releases.forEach(release => {
      const key = `${release.title.toLowerCase()}-${release.artist.toLowerCase()}`
      
      if (releaseMap.has(key)) {
        const existing = releaseMap.get(key)!
        existing.sources.push(...release.sources)
        existing.sourceCount = existing.sources.length
      } else {
        releaseMap.set(key, { ...release })
      }
    })
    
    // Convert back to array and sort by source count (popularity)
    return Array.from(releaseMap.values())
      .sort((a, b) => b.sourceCount - a.sourceCount)
  }

  /**
   * Get curated feed with MusicBrainz enrichment
   */
  async getCuratedFeed(limit: number = 50): Promise<MultiSourceRelease[]> {
    try {
      console.log(`[MultiSource] Getting curated feed with limit: ${limit}`)
      
      // Scrape all sources
      const scrapedReleases = await this.scrapeAllSources()
      
      if (scrapedReleases.length === 0) {
        console.warn('[MultiSource] No releases found from sources')
        return []
      }
      
      // Enrich with MusicBrainz data
      const enrichedReleases: MultiSourceRelease[] = []
      
      for (let i = 0; i < Math.min(limit, scrapedReleases.length); i++) {
        const release = scrapedReleases[i]
        
        try {
          console.log(`[MultiSource] Enriching: ${release.title} by ${release.artist}`)
          
          // Search MusicBrainz for the release
          const query = `title:"${release.title}" AND artist:"${release.artist}"`
          const searchResults = await musicBrainzService.searchReleases(query, 1)
          const musicBrainzRelease = searchResults.length > 0 ? searchResults[0] : null
          
          if (musicBrainzRelease) {
            release.musicBrainzRelease = musicBrainzRelease
            
            // Get cover art
            if (musicBrainzRelease.id) {
              const coverUrl = await coverArtService.getCoverArt(musicBrainzRelease.id)
              if (coverUrl) {
                release.coverUrl = coverUrl
              }
            }
            
            // Extract genre from MusicBrainz if available
            if (musicBrainzRelease.tags && musicBrainzRelease.tags.length > 0) {
              release.genre = musicBrainzRelease.tags[0].name
            }
          }
          
          enrichedReleases.push(release)
          
          // Rate limiting
          await this.delay(1000)
          
        } catch (error) {
          console.error(`[MultiSource] Error enriching ${release.title}:`, error)
          // Still add the release even if enrichment fails
          enrichedReleases.push(release)
        }
      }
      
      console.log(`[MultiSource] Successfully enriched ${enrichedReleases.length} releases`)
      return enrichedReleases
      
    } catch (error) {
      console.error('[MultiSource] Error getting curated feed:', error)
      return []
    }
  }

  /**
   * Get source statistics
   */
  getSourceStats(releases: MultiSourceRelease[]): Record<string, number> {
    const stats: Record<string, number> = {}
    
    releases.forEach(release => {
      release.sources.forEach(source => {
        stats[source] = (stats[source] || 0) + 1
      })
    })
    
    return stats
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const multiSourceScraperService = new MultiSourceScraperService()
