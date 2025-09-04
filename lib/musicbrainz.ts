// MusicBrainz API service for fetching weekly releases and album data
// https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2'
const COVER_ART_ARCHIVE_BASE_URL = 'https://coverartarchive.org'

export interface MusicBrainzRelease {
  id: string
  title: string
  'artist-credit': Array<{
    name: string
    artist?: {
      id: string
      name: string
      'sort-name'?: string
    }
  }>
  date: string
  country: string
  'release-group': {
    id: string
    title: string
    'primary-type': string
    'secondary-types': string[]
  }
  'label-info': Array<{
    label: {
      name: string
    }
  }>
  media: Array<{
    tracks: Array<{
      title: string
    }>
  }>
  'status': string
}

export interface MusicBrainzReleaseGroup {
  id: string
  title: string
  'primary-type': string
  'secondary-types': string[]
  'first-release-date': string
  'artist-credit': Array<{
    name: string
    artist: {
      id: string
      name: string
      'sort-name'?: string
    }
  }>
  releases: MusicBrainzRelease[]
  tags: Array<{
    name: string
    count: number
  }>
}

export interface MusicBrainzArtist {
  id: string
  name: string
  'sort-name'?: string
  'begin-area'?: {
    name: string
  }
  'end-area'?: {
    name: string
  }
  tags: Array<{ 
    name: string
    count: number
  }>
  relations?: Array<{ 
    type: string
    url: { resource: string }
  }>
}

export interface CoverArtArchiveResponse {
  images: Array<{
    front: boolean
    back: boolean
    image: string
    thumbnails: {
      small: string
      large: string
    }
    types: string[]
  }>
}

class MusicBrainzService {
  private userAgent: string
  private rateLimitDelay: number = 1000 // 1 second between requests to respect rate limits

  constructor() {
    this.userAgent = 'SpinGrid/1.0.0 (https://spingrid.com; contact@spingrid.com)'
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${MUSICBRAINZ_BASE_URL}${endpoint}`)
    
    // Add default parameters
    const defaultParams = {
      fmt: 'json',
      ...params
    }
    
    Object.entries(defaultParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    console.log(`[MusicBrainz] Making request to: ${url.toString()}`)

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[MusicBrainz] Response status: ${response.status}`)
    return data
  }

  /**
   * Fetch releases for a specific week (Friday releases)
   */
  async getWeeklyReleases(weekStart: string, limit: number = 25): Promise<MusicBrainzRelease[]> {
    console.log(`[MusicBrainz] Fetching ${limit} releases for week starting: ${weekStart}`)

    // Calculate the date range for recent releases (focus on today and recent past)
    const today = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7) // Last 7 days to ensure we get today's releases
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = today.toISOString().split('T')[0]

    console.log(`[MusicBrainz] Date range: ${startDateStr} to ${endDateStr} (last 7 days, including today)`)

    // Strategy: Use search with date range to get releases, then filter for exact matches
    console.log(`[MusicBrainz] Using search with date range, then filtering for exact matches...`)
    
    let allReleases: MusicBrainzRelease[] = []
    let offset = 0
    const searchLimit = 100
    
    while (allReleases.length < limit && offset < 1000) {
      console.log(`[MusicBrainz] Fetching batch at offset ${offset}...`)
      
      try {
        // Search for releases in our date range, including tags for genres
        const batch = await this.makeRequest('/release', {
          query: `date:[${startDateStr} TO ${endDateStr}]`,
          limit: searchLimit.toString(),
          offset: offset.toString(),
          inc: 'artist-credits+labels+release-groups+media+tags'
        })

        if (batch && batch.releases && batch.releases.length > 0) {
          // Filter for releases with exact dates in our range, plus some with just "2025" dates
          const filteredReleases = batch.releases.filter(release => {
            if (!release.date) return false
            
            // Check if the release date exactly matches our target date
            if (release.date === endDateStr) return true
            
            // Also include releases with dates in our range
            const releaseDate = new Date(release.date)
            const startDate = new Date(startDateStr)
            const endDate = new Date(endDateStr)
            
            const inDateRange = releaseDate >= startDate && releaseDate <= endDate
            
            // Also include some releases with just "2025" dates (which often have tags)
            const isJustYear = release.date === '2025'
            
            return inDateRange || isJustYear
          })
          
          allReleases.push(...filteredReleases)
          console.log(`[MusicBrainz] Batch: ${batch.releases.length} total, ${filteredReleases.length} filtered to exact date range`)
        } else {
          console.log(`[MusicBrainz] No more releases found at offset ${offset}`)
          break
        }
        
        offset += searchLimit
        
        // Respect rate limiting: wait 1 second between requests
        if (offset < 1000) {
          await this.delay(1000)
        }
        
      } catch (error) {
        console.log(`[MusicBrainz] Error fetching batch at offset ${offset}:`, error)
        break
      }
    }

    // Limit to exactly the requested number
    const finalReleases = allReleases.slice(0, limit)
    
    console.log(`[MusicBrainz] Final result: ${finalReleases.length} releases in date range`)
    
    // Only log a sample of the response to avoid console spam
    if (finalReleases.length > 0) {
      console.log(`[MusicBrainz] Sample release:`, JSON.stringify(finalReleases[0], null, 2))
    }

    return finalReleases
  }

  /**
   * Fetch a specific release by ID with full details
   */
  async getRelease(releaseId: string): Promise<MusicBrainzRelease> {
    const release = await this.makeRequest(`/release/${releaseId}`, {
      inc: 'artist-credits+labels+release-groups+media+tags+recordings+works'
    })

    return release
  }

  /**
   * Fetch a release group by ID
   */
  async getReleaseGroup(releaseGroupId: string): Promise<MusicBrainzReleaseGroup> {
    const releaseGroup = await this.makeRequest(`/release-group/${releaseGroupId}`, {
      inc: 'artists+releases+tags'
    })

    return releaseGroup
  }

  /**
   * Fetch an artist by ID
   */
  async getArtist(artistId: string): Promise<MusicBrainzArtist> {
    const artist = await this.makeRequest(`/artist/${artistId}`, {
      inc: 'tags+aliases+url-rels'
    })

    return artist
  }

  /**
   * Search for releases by query
   */
  async searchReleases(query: string, limit: number = 20): Promise<MusicBrainzRelease[]> {
    const results = await this.makeRequest('/release', {
      query: query,
      limit: limit.toString(),
      inc: 'artist-credits+labels+release-groups'
    })

    return results.releases || []
  }

  /**
   * Get cover art for a release
   */
  async getCoverArt(releaseId: string): Promise<string | null> {
    try {
      const response = await fetch(`${COVER_ART_ARCHIVE_BASE_URL}/release/${releaseId}`)
      
      if (!response.ok) {
        return null
      }

      const coverArt: CoverArtArchiveResponse = await response.json()
      
      // Find the front cover image
      const frontCover = coverArt.images.find(img => img.front)
      
      if (frontCover) {
        return frontCover.thumbnails.large || frontCover.image
      }

      // Fallback to any image if no front cover
      if (coverArt.images.length > 0) {
        return coverArt.images[0].thumbnails.large || coverArt.images[0].image
      }

      return null
    } catch (error) {
      console.error('Error fetching cover art:', error)
      return null
    }
  }

  /**
   * Get the current week's Friday date
   */
  getCurrentWeekFriday(): string {
    const today = new Date()
    const daysUntilFriday = (5 - today.getDay() + 7) % 7
    const friday = new Date(today)
    friday.setDate(today.getDate() + daysUntilFriday)
    return friday.toISOString().split('T')[0]
  }

  /**
   * Get the previous week's Friday date
   */
  getPreviousWeekFriday(weeksBack: number = 1): string {
    const friday = new Date(this.getCurrentWeekFriday())
    friday.setDate(friday.getDate() - (weeksBack * 7))
    return friday.toISOString().split('T')[0]
  }

  /**
   * Convert MusicBrainz release to our Album type
   */
  convertToAlbum(release: MusicBrainzRelease, coverUrl?: string): any {
    const artistCredit = release['artist-credit']
      .map(ac => ac.name)
      .join(', ')

    // Get genres from release tags (more reliable) or release-group tags
    // Include tags with count >= 1 (less restrictive filtering)
    const genres = (release.tags || release['release-group']?.tags || [])
      ?.filter(tag => tag.count >= 1)
      ?.map(tag => tag.name)
      ?.slice(0, 3) || []
    
    // Debug logging for genres
    if (genres.length > 0) {
      console.log(`[MusicBrainz] Found genres for ${release.title}:`, genres)
    } else if (release.tags || release['release-group']?.tags) {
      console.log(`[MusicBrainz] Tags found but filtered out for ${release.title}:`, {
        releaseTags: release.tags?.map(t => ({name: t.name, count: t.count})),
        releaseGroupTags: release['release-group']?.tags?.map(t => ({name: t.name, count: t.count}))
      })
    }

    const isReissue = release['release-group']['secondary-types']?.includes('Reissue') || false

    return {
      id: release.id,
      releaseGroupId: release['release-group'].id,
      title: release.title,
      primaryArtistId: release['artist-credit'][0]?.artist?.id || '',
      artistCredit,
      label: release['label-info']?.[0]?.label?.name || 'Unknown Label',
      releaseDate: release.date,
      regions: release.country ? [release.country] : [],
      genres,
      isReissue,
      primaryType: release['release-group']['primary-type'] as 'Album' | 'EP',
      coverUrl: coverUrl || '/placeholder.svg',
      weeklyScore: this.calculateWeeklyScore(release),
      badges: []
    }
  }

  /**
   * Calculate a weekly score based on various factors
   */
  private calculateWeeklyScore(release: MusicBrainzRelease): number {
    let score = 70 // Base score

    // Boost for new releases
    const releaseDate = new Date(release.date)
    const now = new Date()
    const daysSinceRelease = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceRelease <= 7) {
      score += 10 // New release bonus
    } else if (daysSinceRelease <= 14) {
      score += 5 // Recent release bonus
    }

    // Boost for albums vs EPs
    if (release['release-group']['primary-type'] === 'Album') {
      score += 5
    }

    // Boost for multiple tracks - handle the actual data structure
    let trackCount = 0
    if (release.media && Array.isArray(release.media)) {
      trackCount = release.media.reduce((total, media) => {
        // Check if media has tracks array or track-count property
        if (media.tracks && Array.isArray(media.tracks)) {
          return total + media.tracks.length
        } else if (media['track-count']) {
          return total + media['track-count']
        }
        return total
      }, 0)
    }
    
    if (trackCount >= 10) {
      score += 3
    }

    // Boost for popular genres
    const popularGenres = ['rock', 'pop', 'hip hop', 'electronic', 'indie']
    const hasPopularGenre = release['release-group']?.tags?.some(tag => 
      popularGenres.includes(tag.name.toLowerCase())
    )
    if (hasPopularGenre) {
      score += 2
    }

    return Math.min(100, Math.max(50, score))
  }
}

export const musicBrainzService = new MusicBrainzService()
