/**
 * Dynamic Spotify Album ID Database
 * This database automatically populates itself by searching Spotify
 */

import { spotifyDynamicLookup } from './spotify-dynamic-lookup'

interface SpotifyAlbumEntry {
  id: string
  title: string
  artist: string
  spotifyUrl: string
  confidence: number
  lastUpdated: Date
}

// In-memory storage for album IDs (in production, this would be a database)
const ALBUM_CACHE = new Map<string, SpotifyAlbumEntry>()

/**
 * Search for an album in our database or dynamically look it up
 */
export async function findOrLookupAlbum(title: string, artist: string): Promise<SpotifyAlbumEntry | null> {
  const cacheKey = `${title.toLowerCase().trim()}|${artist.toLowerCase().trim()}`
  
  // Check cache first
  const cached = ALBUM_CACHE.get(cacheKey)
  if (cached) {
    console.log(`[Spotify Album DB] Cache hit: ${title} by ${artist}`)
    return cached
  }
  
  // Not in cache, try to look it up dynamically
  console.log(`[Spotify Album DB] Cache miss, looking up: "${title}" by "${artist}"`)
  
  try {
    const lookupResult = await spotifyDynamicLookup.searchAlbum(title, artist)
    
    if (lookupResult && lookupResult.confidence > 80) {
      // Found a good match, add to cache
      const albumEntry: SpotifyAlbumEntry = {
        id: lookupResult.id,
        title: lookupResult.title,
        artist: lookupResult.artist,
        spotifyUrl: lookupResult.spotifyUrl,
        confidence: lookupResult.confidence,
        lastUpdated: new Date()
      }
      
      ALBUM_CACHE.set(cacheKey, albumEntry)
      console.log(`[Spotify Album DB] Added to cache: "${title}" by "${artist}" -> ${lookupResult.spotifyUrl} (confidence: ${lookupResult.confidence}%)`)
      
      return albumEntry
    } else if (lookupResult) {
      console.log(`[Spotify Album DB] Low confidence match (${lookupResult.confidence}%) for: "${title}" by "${artist}", not caching`)
    }
  } catch (error) {
    console.error(`[Spotify Album DB] Error during lookup for "${title}" by "${artist}":`, error)
  }
  
  console.log(`[Spotify Album DB] No good match found for: "${title}" by "${artist}"`)
  return null
}

/**
 * Search for an album in our known database (legacy method)
 */
export function findKnownAlbum(title: string, artist: string): SpotifyAlbumEntry | null {
  const cacheKey = `${title.toLowerCase().trim()}|${artist.toLowerCase().trim()}`
  return ALBUM_CACHE.get(cacheKey) || null
}

/**
 * Add a new album to the database manually
 */
export function addKnownAlbum(id: string, title: string, artist: string, confidence: number = 100): void {
  const cacheKey = `${title.toLowerCase().trim()}|${artist.toLowerCase().trim()}`
  
  const albumEntry: SpotifyAlbumEntry = {
    id,
    title,
    artist,
    spotifyUrl: `https://open.spotify.com/album/${id}`,
    confidence,
    lastUpdated: new Date()
  }
  
  ALBUM_CACHE.set(cacheKey, albumEntry)
  console.log(`[Spotify Album DB] Manually added: ${title} by ${artist} (${id})`)
}

/**
 * Get all cached albums
 */
export function getAllCachedAlbums(): SpotifyAlbumEntry[] {
  return Array.from(ALBUM_CACHE.values())
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { total: number; lastUpdated: Date | null } {
  const albums = getAllCachedAlbums()
  const lastUpdated = albums.length > 0 
    ? new Date(Math.max(...albums.map(a => a.lastUpdated.getTime())))
    : null
  
  return {
    total: albums.length,
    lastUpdated
  }
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  ALBUM_CACHE.clear()
  console.log('[Spotify Album DB] Cache cleared')
}

/**
 * Pre-populate cache with some known albums for testing
 */
export function prePopulateCache(): void {
  const knownAlbums = [
    { id: "3iE2EtiK9bWxYqhkzCgea0", title: "Forever Forever The Hives", artist: "The Hives" },
    { id: "4aawyAB9vmqN3uQ7FjRGTy", title: "Currents", artist: "Tame Impala" },
    { id: "2UJwKSBUz6rtW4QLK74yQu", title: "Punisher", artist: "Phoebe Bridgers" }
  ]
  
  knownAlbums.forEach(album => {
    addKnownAlbum(album.id, album.title, album.artist, 100)
  })
  
  console.log(`[Spotify Album DB] Pre-populated with ${knownAlbums.length} albums`)
}
