/**
 * Comprehensive Cover Art Service
 * Tries multiple sources to find album artwork
 */

interface CoverArtSource {
  name: string
  priority: number
  getCoverArt: (title: string, artist: string, albumId?: string) => Promise<string | null>
}

export class CoverArtService {
  private sources: CoverArtSource[]

  constructor() {
    this.sources = [
      // Primary source - MusicBrainz Cover Art Archive
      {
        name: 'Cover Art Archive',
        priority: 1,
        getCoverArt: this.getFromCoverArtArchive.bind(this)
      },
      // Fallback 1 - Last.fm (free, good coverage)
      {
        name: 'Last.fm',
        priority: 2,
        getCoverArt: this.getFromLastfm.bind(this)
      },
      // Fallback 2 - iTunes/Apple Music (good quality)
      {
        name: 'iTunes',
        priority: 3,
        getCoverArt: this.getFromItunes.bind(this)
      },
      // Fallback 3 - Spotify (if we have access)
      {
        name: 'Spotify',
        priority: 4,
        getCoverArt: this.getFromSpotify.bind(this)
      }
    ]
  }

  /**
   * Get cover art from the best available source
   */
  async getCoverArt(title: string, artist: string, musicBrainzId?: string): Promise<string> {
    console.log(`[CoverArt] Searching for: "${title}" by ${artist}`)

    // Add overall timeout to prevent hanging
    const overallTimeout = new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error('Cover art search timeout')), 15000)
    )

    const searchPromise = this.searchCoverArt(title, artist, musicBrainzId)
    
    try {
      return await Promise.race([searchPromise, overallTimeout])
    } catch (error) {
      console.warn(`[CoverArt] Search failed for "${title}":`, error.message)
      return '/placeholder.svg'
    }
  }

  private async searchCoverArt(title: string, artist: string, musicBrainzId?: string): Promise<string> {
    // Try MusicBrainz first if we have the ID
    if (musicBrainzId) {
      try {
        const coverArt = await this.getFromCoverArtArchive(title, artist, musicBrainzId)
        if (coverArt) {
          console.log(`[CoverArt] Found in Cover Art Archive`)
          return coverArt
        }
      } catch (error) {
        console.warn(`[CoverArt] Cover Art Archive failed:`, error.message)
      }
    }

    // Try other sources in priority order
    for (const source of this.sources.slice(1)) {
      try {
        console.log(`[CoverArt] Trying ${source.name}...`)
        const coverArt = await source.getCoverArt(title, artist)
        if (coverArt) {
          console.log(`[CoverArt] Found in ${source.name}`)
          return coverArt
        }
      } catch (error) {
        console.warn(`[CoverArt] ${source.name} failed:`, error.message)
        continue
      }
    }

    // Use static placeholder as final fallback
    console.log(`[CoverArt] No cover found, using static placeholder`)
    return '/placeholder.svg'
  }

  /**
   * MusicBrainz Cover Art Archive
   */
  private async getFromCoverArtArchive(title: string, artist: string, releaseId: string): Promise<string | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
      
      const response = await fetch(`https://coverartarchive.org/release/${releaseId}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      // Look for front cover image
      if (data.images && data.images.length > 0) {
        const frontCover = data.images.find((img: any) => img.front === true)
        if (frontCover) {
          return frontCover.image
        }
        
        // Fallback to first image if no front cover specified
        return data.images[0].image
      }

      return null
    } catch (error) {
      console.warn(`[CoverArt] Cover Art Archive failed:`, error.message)
      return null
    }
  }

  /**
   * Last.fm API (free, good coverage)
   */
  private async getFromLastfm(title: string, artist: string): Promise<string | null> {
    try {
      // Last.fm API key (free tier)
      const API_KEY = process.env.LASTFM_API_KEY
      
      if (!API_KEY) {
        console.warn(`[CoverArt] Last.fm API key not configured`)
        return null
      }

      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(title)}&format=json`
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      if (data.album && data.album.image && data.album.image.length > 0) {
        // Get the largest image available
        const largeImage = data.album.image.find((img: any) => img.size === 'extralarge')
        if (largeImage) {
          return largeImage['#text']
        }
        
        // Fallback to any available image
        return data.album.image[0]['#text']
      }

      return null
    } catch (error) {
      console.warn(`[CoverArt] Last.fm failed:`, error.message)
      return null
    }
  }

  /**
   * iTunes/Apple Music API (free, good quality)
   */
  private async getFromItunes(title: string, artist: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(`${artist} ${title}`)}&entity=album&limit=1`
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const album = data.results[0]
        if (album.artworkUrl100) {
          // Convert 100x100 to 600x600 for better quality
          return album.artworkUrl100.replace('100x100', '600x600')
        }
      }

      return null
    } catch (error) {
      console.warn(`[CoverArt] iTunes failed:`, error.message)
      return null
    }
  }

  /**
   * Spotify API (if we have access)
   */
  private async getFromSpotify(title: string, artist: string): Promise<string | null> {
    try {
      // Spotify API credentials (you'll need to set these up)
      const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
      const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
      
      if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn(`[CoverArt] Spotify credentials not configured`)
        return null
      }

      // Get access token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!tokenResponse.ok) {
        return null
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token

      // Search for album
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(`${artist} ${title}`)}&type=album&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!searchResponse.ok) {
        return null
      }

      const searchData = await searchResponse.json()
      
      if (searchData.albums && searchData.albums.items && searchData.albums.items.length > 0) {
        const album = searchData.albums.items[0]
        if (album.images && album.images.length > 0) {
          // Get the largest image available
          return album.images[0].url
        }
      }

      return null
    } catch (error) {
      console.warn(`[CoverArt] Spotify failed:`, error.message)
      return null
    }
  }


}

// Export singleton instance
export const coverArtService = new CoverArtService()
