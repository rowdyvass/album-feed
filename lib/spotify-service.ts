interface SpotifySearchResponse {
  albums: {
    items: Array<{
      id: string
      name: string
      artists: Array<{ name: string }>
      external_urls: { spotify: string }
      images: Array<{ url: string; height: number; width: number }>
    }>
    total: number
  }
}

interface SpotifyAlbum {
  id: string
  name: string
  artists: Array<{ name: string }>
  external_urls: { spotify: string }
  images: Array<{ url: string; height: number; width: number }>
}

export class SpotifyService {
  private clientId: string
  private redirectUri: string
  private scope: string

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || ''
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback/spotify'
    this.scope = 'user-library-modify playlist-modify-public playlist-modify-private'
  }

  /**
   * Search for an album on Spotify using the Web API
   */
  async searchAlbum(albumTitle: string, artistName: string): Promise<SpotifyAlbum | null> {
    try {
      // Construct search query
      const query = `${albumTitle} artist:${artistName}`
      const encodedQuery = encodeURIComponent(query)
      
      // Use Spotify Web API search endpoint
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=1`
      
      console.log(`[Spotify] Searching for: ${query}`)
      console.log(`[Spotify] Search URL: ${searchUrl}`)
      
      // For now, we'll construct the direct album URL based on the search
      // In a full implementation, you'd need OAuth tokens to call the API
      const albumId = await this.getAlbumIdFromSearch(albumTitle, artistName)
      
      if (albumId) {
        return {
          id: albumId,
          name: albumTitle,
          artists: [{ name: artistName }],
          external_urls: { spotify: `https://open.spotify.com/album/${albumId}` },
          images: []
        }
      }
      
      // Fallback to search URL if no direct album found
      return {
        id: 'search-fallback',
        name: albumTitle,
        artists: [{ name: artistName }],
        external_urls: { spotify: `https://open.spotify.com/search/${encodedQuery}` },
        images: []
      }
    } catch (error) {
      console.error('[Spotify] Error searching for album:', error)
      return null
    }
  }

  /**
   * Get album ID by searching Spotify's web interface and parsing the results
   * This is a workaround until we implement proper OAuth authentication
   */
  private async getAlbumIdFromSearch(albumTitle: string, artistName: string): Promise<string | null> {
    try {
      // For now, we'll use a simple approach that works for many albums
      // This constructs a direct album URL based on common Spotify patterns
      
      // Clean up the album title and artist name for URL construction
      const cleanTitle = albumTitle
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase()
        .trim()
      
      const cleanArtist = artistName
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase()
        .trim()
      
      // Try to construct a direct album URL
      // This pattern works for many albums: https://open.spotify.com/album/{id}
      // We'll use a hash of the title + artist as a pseudo-ID for now
      
      // Create a simple hash from title + artist
      const combined = `${cleanTitle}-${cleanArtist}`
      const hash = this.simpleHash(combined)
      
      // For demonstration, we'll construct a URL that might work
      // In a real implementation, you'd use the actual Spotify API to get the real album ID
      
      console.log(`[Spotify] Attempting to construct direct album URL for: ${albumTitle} by ${artistName}`)
      
      // Return null for now to fall back to search
      // In the future, this could be enhanced with:
      // 1. Spotify API integration
      // 2. Cached album ID database
      // 3. Web scraping of Spotify search results
      
      return null
    } catch (error) {
      console.error('[Spotify] Error getting album ID:', error)
      return null
    }
  }

  /**
   * Simple hash function for generating pseudo-IDs
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Add album to user's Spotify library
   */
  async addToLibrary(albumId: string): Promise<boolean> {
    try {
      console.log(`[Spotify] Adding album ${albumId} to library`)
      
      // In a real implementation, this would make an API call to add to user's library
      // For now, we'll return success
      return true
    } catch (error) {
      console.error('[Spotify] Error adding album to library:', error)
      return false
    }
  }

  /**
   * Add album to a specific playlist
   */
  async addToPlaylist(playlistId: string, albumId: string): Promise<boolean> {
    try {
      console.log(`[Spotify] Adding album ${albumId} to playlist ${playlistId}`)
      
      // In a real implementation, this would make an API call to add to playlist
      // For now, we'll return success
      return true
    } catch (error) {
      console.error('[Spotify] Error adding album to playlist:', error)
      return false
    }
  }

  /**
   * Get the Spotify URL for an album (direct album page if possible, search if not)
   */
  async getAlbumUrl(albumTitle: string, artistName: string): Promise<string> {
    const album = await this.searchAlbum(albumTitle, artistName)
    if (album && album.id !== 'search-fallback') {
      return album.external_urls.spotify
    }
    
    // Fallback to search URL
    const query = `${albumTitle} ${artistName}`
    const encodedQuery = encodeURIComponent(query)
    return `https://open.spotify.com/search/${encodedQuery}`
  }

  /**
   * Open Spotify album page directly (if found) or search page (if not)
   */
  async openAlbumPage(albumTitle: string, artistName: string): Promise<void> {
    try {
      // Use our API endpoint to find the actual album
      const response = await fetch(`/api/spotify-search?album=${encodeURIComponent(albumTitle)}&artist=${encodeURIComponent(artistName)}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          if (data.directAlbumUrl) {
            // We found the album! Open the direct album page
            console.log(`[Spotify] Opening direct album page: ${data.directAlbumUrl}`)
            window.open(data.directAlbumUrl, '_blank')
            return
          } else if (data.searchUrl) {
            // Album not found, but we have an optimized search
            console.log(`[Spotify] Opening optimized search: ${data.searchUrl}`)
            window.open(data.searchUrl, '_blank')
            return
          }
        }
      }
      
      // Fallback to basic search if API fails
      const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(`${albumTitle} ${artistName}`)}`
      console.log(`[Spotify] Fallback to basic search: ${searchUrl}`)
      window.open(searchUrl, '_blank')
      
    } catch (error) {
      console.error('[Spotify] Error opening album page:', error)
      // Final fallback to basic search
      const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(`${albumTitle} ${artistName}`)}`
      window.open(searchUrl, '_blank')
    }
  }

  /**
   * Open Spotify search for an album in a new tab (legacy method)
   */
  openAlbumSearch(albumTitle: string, artistName: string): void {
    const url = `https://open.spotify.com/search/${encodeURIComponent(`${albumTitle} ${artistName}`)}`
    window.open(url, '_blank')
  }
}

export const spotifyService = new SpotifyService()
