/**
 * Dynamic Spotify Album ID Lookup Service
 * This service searches Spotify dynamically to find album IDs
 */

interface SpotifySearchResult {
  id: string
  title: string
  artist: string
  confidence: number
  spotifyUrl: string
}

interface SpotifySearchResponse {
  albums: {
    items: Array<{
      id: string
      name: string
      artists: Array<{ name: string }>
      external_urls: { spotify: string }
    }>
    total: number
  }
}

export class SpotifyDynamicLookup {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || ''
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || ''
    
    // Debug log to verify credentials are loaded
    console.log('[Spotify Dynamic Lookup] Initializing with credentials:', {
      hasClientId: !!this.clientId,
      clientIdLength: this.clientId.length,
      hasClientSecret: !!this.clientSecret,
      clientSecretLength: this.clientSecret.length
    })
  }

  /**
   * Search for an album on Spotify and return the best match
   */
  async searchAlbum(albumTitle: string, artistName: string): Promise<SpotifySearchResult | null> {
    try {
      // First try to get an access token
      await this.ensureAccessToken()
      
      if (!this.accessToken) {
        console.log('[Spotify Dynamic Lookup] No access token available, using fallback search')
        return this.fallbackSearch(albumTitle, artistName)
      }

      // Use Spotify's official API to search
      const searchQuery = `${albumTitle} artist:${artistName}`
      const encodedQuery = encodeURIComponent(searchQuery)
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        console.log('[Spotify Dynamic Lookup] API request failed, using fallback search')
        return this.fallbackSearch(albumTitle, artistName)
      }

      const data: SpotifySearchResponse = await response.json()
      
      if (data.albums.items.length === 0) {
        console.log(`[Spotify Dynamic Lookup] No albums found for: ${albumTitle} by ${artistName}`)
        return null
      }

      // Find the best match using fuzzy matching
      const bestMatch = this.findBestMatch(albumTitle, artistName, data.albums.items)
      
      if (bestMatch) {
        return {
          id: bestMatch.id,
          title: bestMatch.name,
          artist: bestMatch.artists[0]?.name || artistName,
          confidence: bestMatch.confidence || 0,
          spotifyUrl: bestMatch.external_urls.spotify
        }
      }

      return null

    } catch (error) {
      console.error('[Spotify Dynamic Lookup] Error searching album:', error)
      return this.fallbackSearch(albumTitle, artistName)
    }
  }

  /**
   * Find the best matching album from search results
   */
  private findBestMatch(
    searchTitle: string, 
    searchArtist: string, 
    albums: Array<{ id: string; name: string; artists: Array<{ name: string }>; external_urls: { spotify: string } }>
  ): { id: string; name: string; artists: Array<{ name: string }>; external_urls: { spotify: string }; confidence: number } | null {
    const normalizedSearchTitle = searchTitle.toLowerCase().trim()
    const normalizedSearchArtist = searchArtist.toLowerCase().trim()
    
    let bestMatch: any = null
    let bestScore = 0

    for (const album of albums) {
      const albumTitle = album.name.toLowerCase().trim()
      const albumArtist = album.artists[0]?.name.toLowerCase().trim() || ''
      
      let score = 0
      
      // Title matching (higher weight)
      if (albumTitle === normalizedSearchTitle) score += 100
      else if (albumTitle.includes(normalizedSearchTitle)) score += 80
      else if (normalizedSearchTitle.includes(albumTitle)) score += 70
      else if (this.calculateSimilarity(albumTitle, normalizedSearchTitle) > 0.7) score += 60
      
      // Artist matching (higher weight)
      if (albumArtist === normalizedSearchArtist) score += 100
      else if (albumArtist.includes(normalizedSearchArtist)) score += 80
      else if (normalizedSearchArtist.includes(albumArtist)) score += 70
      else if (this.calculateSimilarity(albumArtist, normalizedSearchArtist) > 0.7) score += 60
      
      // Bonus for both matching well
      if (score > 120) score += 30
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = { ...album, confidence: score }
      }
    }

    // Only return if we have a good enough match (score > 100)
    return bestScore > 100 ? bestMatch : null
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * Fallback search using web scraping approach
   */
  private async fallbackSearch(albumTitle: string, artistName: string): Promise<SpotifySearchResult | null> {
    try {
      // This would implement web scraping of Spotify's search results
      // For now, return null to indicate no match found
      console.log(`[Spotify Dynamic Lookup] Fallback search for: ${albumTitle} by ${artistName}`)
      return null
    } catch (error) {
      console.error('[Spotify Dynamic Lookup] Fallback search error:', error)
      return null
    }
  }

  /**
   * Get or refresh Spotify access token
   */
  private async ensureAccessToken(): Promise<void> {
    if (this.accessToken) return

    try {
      // Check if we have both client ID and secret
      if (!this.clientId || !this.clientSecret) {
        console.log('[Spotify Dynamic Lookup] Missing client credentials, access token not available')
        return
      }

      // Use client credentials flow with proper Basic auth
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: 'grant_type=client_credentials'
      })

      if (response.ok) {
        const data = await response.json()
        this.accessToken = data.access_token
        console.log('[Spotify Dynamic Lookup] Successfully obtained access token')
      } else {
        const errorText = await response.text()
        console.log(`[Spotify Dynamic Lookup] Failed to get access token: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('[Spotify Dynamic Lookup] Error getting access token:', error)
    }
  }
}

export const spotifyDynamicLookup = new SpotifyDynamicLookup()
