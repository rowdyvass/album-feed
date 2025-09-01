import { databaseService, type DatabaseAlbum, type DatabaseArtist, type DatabaseCoverArt } from './database'
import { multiSourceScraperService } from './multi-source-scraper'
import { musicBrainzService } from './musicbrainz'
import { coverArtService } from './cover-art-service'

export class DataSyncService {
  private isRunning = false
  private lastSyncTime: Date | null = null

  /**
   * Sync all data from external APIs to the database
   */
  async syncAllData(limit: number = 100): Promise<void> {
    if (this.isRunning) {
      console.log('[DataSync] Sync already in progress, skipping...')
      return
    }

    this.isRunning = true
    const startTime = Date.now()

    try {
      console.log(`[DataSync] Starting full data sync for ${limit} albums...`)

      // Step 1: Get curated feed from multiple sources + MusicBrainz
      const scrapedReleases = await multiSourceScraperService.getCuratedFeed(limit)
      console.log(`[DataSync] Retrieved ${scrapedReleases.length} releases from multi-source scraper`)

      // Step 2: Process each release and store in database
      let processedCount = 0
      let errorCount = 0

      for (const release of scrapedReleases) {
        try {
          if (!release.musicBrainzRelease) {
            console.log(`[DataSync] Skipping ${release.title} - no MusicBrainz match`)
            continue
          }

          await this.processRelease(release)
          processedCount++

          // Add small delay to be respectful to APIs
          if (processedCount % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log(`[DataSync] Processed ${processedCount}/${scrapedReleases.length} releases...`)
          }
        } catch (error) {
          errorCount++
          console.error(`[DataSync] Error processing ${release.title}:`, error)
        }
      }

      this.lastSyncTime = new Date()
      const duration = Date.now() - startTime

      console.log(`[DataSync] Sync completed in ${duration}ms`)
      console.log(`[DataSync] Successfully processed: ${processedCount}`)
      console.log(`[DataSync] Errors: ${errorCount}`)

      // Get database stats
      const stats = await databaseService.getDatabaseStats()
      console.log(`[DataSync] Database stats:`, stats)

    } catch (error) {
      console.error('[DataSync] Fatal error during sync:', error)
      throw error
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Process a single release and store it in the database
   */
  private async processRelease(release: any): Promise<void> {
    const mbRelease = release.musicBrainzRelease
    const multiSourceRelease = release

    // Skip if no MusicBrainz data
    if (!mbRelease) {
      console.log(`[DataSync] Skipping release - no MusicBrainz match`)
      return
    }

    console.log(`[DataSync] Processing release: ${mbRelease.title} by ${mbRelease['artist-credit']?.[0]?.name}`)

    // Get cover art
    let coverUrl = release.coverUrl
    if (!coverUrl) {
      try {
        console.log(`[DataSync] Fetching cover art for ${mbRelease.title}...`)
        coverUrl = await coverArtService.getCoverArt(mbRelease.id)
        console.log(`[DataSync] Cover art URL: ${coverUrl}`)
      } catch (error) {
        console.warn(`[DataSync] Failed to get cover art for ${mbRelease.title}:`, error.message)
        coverUrl = '/placeholder.svg'
      }
    }

    // Store cover art
    if (coverUrl && coverUrl !== '/placeholder.svg') {
      try {
        console.log(`[DataSync] Storing cover art for ${mbRelease.title}...`)
        await databaseService.upsertCoverArt({
          albumId: mbRelease.id,
          url: coverUrl,
          source: 'Cover Art Archive'
        })
        console.log(`[DataSync] Cover art stored successfully`)
      } catch (error) {
        console.error(`[DataSync] Failed to store cover art for ${mbRelease.title}:`, error)
      }
    }

    // Store album
    const album: Omit<DatabaseAlbum, 'lastUpdated'> = {
      id: mbRelease.id,
      releaseGroupId: mbRelease['release-group']?.id || '',
      title: mbRelease.title,
      primaryArtistId: mbRelease['artist-credit']?.[0]?.artist?.id || '',
      artistCredit: mbRelease['artist-credit']?.map(ac => ac.name).join(', ') || '',
      label: mbRelease['label-info']?.[0]?.label?.name || 'Unknown Label',
      releaseDate: multiSourceRelease.reviewDate,
      regions: mbRelease.country ? [mbRelease.country].join(',') : '',
      genres: [multiSourceRelease.genre].join(','),
      isReissue: mbRelease['release-group']?.['secondary-types']?.includes('Reissue') || false,
      primaryType: mbRelease['release-group']?.['primary-type'] || 'Album',
      coverUrl: coverUrl,
      weeklyScore: this.calculateWeeklyScore(multiSourceRelease.reviewDate),
      trackCount: mbRelease['track-count'] || 0,
      barcode: mbRelease.barcode || undefined,
      sourceTags: multiSourceRelease.sources.join(', '),
      sourceCount: multiSourceRelease.sourceCount
    }

    console.log(`[DataSync] Storing album: ${album.title} with score ${album.weeklyScore}`)
    try {
      await databaseService.upsertAlbum(album)
      console.log(`[DataSync] Album stored successfully: ${album.title}`)
    } catch (error) {
      console.error(`[DataSync] Failed to store album ${album.title}:`, error)
      throw error // Re-throw to be caught by the caller
    }

    // Store artist information if available
    if (mbRelease['artist-credit']?.[0]?.artist?.id) {
      try {
        const artistId = mbRelease['artist-credit'][0].artist.id
        const artist = await musicBrainzService.getArtist(artistId)
        
        if (artist) {
          await databaseService.upsertArtist({
            id: artist.id,
            name: artist.name,
            bioExcerpt: artist.tags?.map(tag => tag.name).join(', ') || undefined,
            tags: artist.tags?.map(tag => tag.name).join(',') || undefined
          })
        }
      } catch (error) {
        console.warn(`[DataSync] Failed to get artist info for ${mbRelease.title}:`, error.message)
      }
    }
  }

  /**
   * Calculate weekly score based on review date
   */
  private calculateWeeklyScore(reviewDate: string): number {
    const review = new Date(reviewDate)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - review.getTime()) / (1000 * 60 * 60 * 24))
    
    // Higher score for more recent reviews
    if (daysDiff <= 7) return 95
    if (daysDiff <= 14) return 90
    if (daysDiff <= 30) return 85
    if (daysDiff <= 60) return 80
    return 75
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isRunning: boolean
    lastSyncTime: Date | null
  } {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime
    }
  }

  /**
   * Check if sync is needed (e.g., if database is empty or data is old)
   */
  async isSyncNeeded(): Promise<boolean> {
    const stats = await databaseService.getDatabaseStats()
    
    // Sync if no albums in database
    if (stats.totalAlbums === 0) {
      return true
    }

    // Sync if data is older than 24 hours
    if (stats.lastUpdated) {
      const lastUpdate = new Date(stats.lastUpdated)
      const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
      return hoursSinceUpdate > 24
    }

    return true
  }

  /**
   * Incremental sync - only fetch new data
   */
  async incrementalSync(): Promise<void> {
    if (this.isRunning) {
      console.log('[DataSync] Sync already in progress, skipping...')
      return
    }

    this.isRunning = true

    try {
      console.log('[DataSync] Starting incremental sync...')
      
      // For now, just do a full sync
      // In the future, we could implement logic to only fetch new releases
      await this.syncAllData(50)
      
    } catch (error) {
      console.error('[DataSync] Error during incremental sync:', error)
      throw error
    } finally {
      this.isRunning = false
    }
  }
}

export const dataSyncService = new DataSyncService()
