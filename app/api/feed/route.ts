import { NextRequest, NextResponse } from 'next/server'
import { musicBrainzService } from '@/lib/musicbrainz'
import { multiSourceScraperService } from '@/lib/multi-source-scraper'
import { coverArtService } from '@/lib/cover-art-service'
import { databaseService } from '@/lib/database'
import { dataSyncService } from '@/lib/data-sync'

import type { FeedResponse, FeedFilters } from '@/types'

export async function GET(request: NextRequest) {
  try {
    console.log(`[API] Feed API called`)
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const week = searchParams.get('week')
    const genres = searchParams.get('genres')?.split(',') || []
    const regions = searchParams.get('regions')?.split(',') || []
    const format = searchParams.get('format')?.split(',') as ('Album' | 'EP')[] || []
    const excludeReissues = searchParams.get('excludeReissues') === 'true'
    const limit = parseInt(searchParams.get('limit') || '25')
    const cursor = searchParams.get('cursor')


    // Determine which week to fetch
    let targetWeek: string
    if (week) {
      targetWeek = week
    } else {
      // Default to current week's Friday
      targetWeek = musicBrainzService.getCurrentWeekFriday()
    }

    console.log(`[API] Target week: ${targetWeek}`)

    let albums: any[] = []
    
    console.log(`[API] Using database for album data`)
    
    // Check if we need to sync data
    const syncNeeded = await dataSyncService.isSyncNeeded()
    if (syncNeeded) {
      console.log('[API] Database sync needed, starting background sync...')
      // Start sync in background (don't wait for it)
      dataSyncService.syncAllData(100).catch(error => {
        console.error('[API] Background sync failed:', error)
      })
    }
    
    // Get albums from database (get all to combine with AllMusic albums)
    const offset = cursor ? parseInt(cursor) : 0
    const dbAlbums = await databaseService.getAlbums(1000, 0) // Get all albums
    
    // Convert database albums to our format
    albums = dbAlbums.map(dbAlbum => ({
      id: dbAlbum.id,
      releaseGroupId: dbAlbum.releaseGroupId,
      title: dbAlbum.title,
      primaryArtistId: dbAlbum.primaryArtistId,
      artistCredit: dbAlbum.artistCredit,
      label: dbAlbum.label,
      releaseDate: dbAlbum.releaseDate,
      regions: dbAlbum.regions ? dbAlbum.regions.split(',').filter(Boolean) : [],
      genres: dbAlbum.genres ? dbAlbum.genres.split(',').filter(Boolean) : [],
      isReissue: dbAlbum.isReissue,
      primaryType: dbAlbum.primaryType,
      coverUrl: dbAlbum.coverUrl,
      weeklyScore: dbAlbum.weeklyScore,
      sourceTags: dbAlbum.sourceTags ? dbAlbum.sourceTags.split(', ') : [],
      sourceCount: dbAlbum.sourceCount || 1,
      badges: []
    }))
    
    console.log(`[API] Found ${albums.length} albums from database`)

    // Add AllMusic albums to the mix
    const { allAllMusicAlbums2025 } = await import('@/lib/allmusic-albums-2025')

    const allMusicAlbums = allAllMusicAlbums2025.map(album => ({
      id: album.id,
      releaseGroupId: album.releaseGroupId,
      title: album.title,
      primaryArtistId: album.primaryArtistId,
      artistCredit: album.artistCredit,
      label: album.label,
      releaseDate: album.releaseDate,
      regions: album.regions,
      genres: album.genres,
      isReissue: album.isReissue,
      primaryType: album.primaryType,
      coverUrl: album.coverUrl,
      weeklyScore: album.weeklyScore,
      sourceTags: album.sourceTags,
      sourceCount: album.sourceCount,
      badges: album.badges
    }))

    console.log(`[API] AllMusic albums data:`, allMusicAlbums.length)
    console.log(`[API] AllMusic album titles:`, allMusicAlbums.map(a => a.title))

    // Merge database albums with AllMusic albums, avoiding duplicates
    const existingIds = new Set(albums.map(album => album.id))
    const uniqueAllMusicAlbums = allMusicAlbums.filter(album => !existingIds.has(album.id))
    
    console.log(`[API] Existing IDs:`, Array.from(existingIds))
    console.log(`[API] Unique AllMusic albums:`, uniqueAllMusicAlbums.length)
    console.log(`[API] Unique AllMusic album titles:`, uniqueAllMusicAlbums.map(a => a.title))
    
    // Combine all albums
    const allAlbums = [...albums, ...uniqueAllMusicAlbums]
    
    console.log(`[API] Added ${uniqueAllMusicAlbums.length} AllMusic albums, total: ${allAlbums.length}`)
    console.log(`[API] Combined album titles:`, allAlbums.map(a => a.title).slice(0, 10))

    // Apply filters
    let filteredAlbums = allAlbums

    if (genres.length > 0) {
      filteredAlbums = filteredAlbums.filter(album =>
        album.genres.some(genre => genres.includes(genre))
      )
    }

    if (regions.length > 0) {
      filteredAlbums = filteredAlbums.filter(album =>
        album.regions.some(region => regions.includes(region))
      )
    }

    if (format.length > 0) {
      filteredAlbums = filteredAlbums.filter(album =>
        format.includes(album.primaryType)
      )
    }

    if (excludeReissues) {
      filteredAlbums = filteredAlbums.filter(album => !album.isReissue)
    }

    // Sort by weekly score (descending)
    filteredAlbums.sort((a, b) => b.weeklyScore - a.weeklyScore)

    // Get total count for pagination (including AllMusic albums)
    const totalCount = await databaseService.getTotalAlbumCount() + uniqueAllMusicAlbums.length

    // Apply pagination to the combined albums
    const paginatedAlbums = filteredAlbums.slice(offset, offset + limit)

    // Generate next cursor for pagination
    const nextCursor = filteredAlbums.length > offset + limit ? 
      Buffer.from(JSON.stringify({ week: targetWeek, offset: offset + limit })).toString('base64') : 
      undefined
    
    const response: FeedResponse = {
      items: paginatedAlbums,
      nextCursor,
      totalCount: totalCount,
      filters: {
        availableGenres: Array.from(new Set(allAlbums.flatMap(album => album.genres))),
        availableWeeks: [
          musicBrainzService.getCurrentWeekFriday(),
          musicBrainzService.getPreviousWeekFriday(1),
          musicBrainzService.getPreviousWeekFriday(2),
          musicBrainzService.getPreviousWeekFriday(3)
        ],
        availableRegions: Array.from(new Set(allAlbums.flatMap(album => album.regions)))
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching feed:', error)
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch feed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Calculate weekly score based on Pitchfork review date
 */
function calculateWeeklyScore(reviewDate: string): number {
  try {
    const releaseDate = new Date(reviewDate)
    const now = new Date()
    const daysSinceRelease = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24))
    
    let score = 70 // Base score
    
    // Boost for new releases
    if (daysSinceRelease <= 7) {
      score += 15 // New release bonus
    } else if (daysSinceRelease <= 14) {
      score += 10 // Recent release bonus
    } else if (daysSinceRelease <= 30) {
      score += 5 // Recent month bonus
    }
    
    // Bonus for being a Pitchfork-reviewed release
    score += 10
    
    return Math.min(100, Math.max(50, score))
    
  } catch (error) {
    return 75 // Default score if date parsing fails
  }
}
