import { NextRequest, NextResponse } from 'next/server'
import { findOrLookupAlbum, prePopulateCache } from '@/lib/spotify-album-database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const albumTitle = searchParams.get('album')
    const artistName = searchParams.get('artist')

    if (!albumTitle || !artistName) {
      return NextResponse.json(
        { error: 'Missing album title or artist name' },
        { status: 400 }
      )
    }

    // Pre-populate cache with some known albums on first request
    if (request.headers.get('user-agent')?.includes('Mozilla')) {
      prePopulateCache()
    }

    // Use dynamic lookup to find the album
    console.log(`[Spotify Search API] Looking up album: "${albumTitle}" by "${artistName}"`)
    const album = await findOrLookupAlbum(albumTitle, artistName)
    
    if (album) {
      // We found the album! Return the direct album URL
      console.log(`[Spotify Search API] Found album: ${album.title} by ${album.artist} -> ${album.spotifyUrl} (confidence: ${album.confidence}%)`)
      
      return NextResponse.json({
        success: true,
        albumTitle: album.title,
        artistName: album.artist,
        albumId: album.id,
        directAlbumUrl: album.spotifyUrl,
        confidence: album.confidence,
        message: 'Album found! Opening direct album page.',
        source: 'dynamic_lookup'
      })
    }
    
    // Fallback to optimized search if album not found
    const searchQuery = `${albumTitle} artist:${artistName}`
    const encodedQuery = encodeURIComponent(searchQuery)
    const searchUrl = `https://open.spotify.com/search/${encodedQuery}/albums`
    
    console.log(`[Spotify Search API] Album not found for: "${albumTitle}" by "${artistName}", falling back to search: ${searchUrl}`)
    
    return NextResponse.json({
      success: true,
      albumTitle,
      artistName,
      searchQuery,
      searchUrl,
      message: 'Album not found, opening search page',
      source: 'search_fallback'
    })
    
  } catch (error) {
    console.error('[Spotify Search API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
