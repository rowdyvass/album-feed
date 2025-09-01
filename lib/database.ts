import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

export interface DatabaseAlbum {
  id: string
  releaseGroupId: string
  title: string
  primaryArtistId: string
  artistCredit: string
  label: string
  releaseDate: string
  regions: string
  genres: string
  isReissue: boolean
  primaryType: string
  coverUrl: string
  weeklyScore: number
  trackCount: number
  barcode?: string
  sourceTags: string
  sourceCount: number
  lastUpdated: string
}

export interface DatabaseArtist {
  id: string
  name: string
  bioExcerpt?: string
  tags?: string
  lastUpdated: string
}

export interface DatabaseCoverArt {
  albumId: string
  url: string
  source: string
  lastUpdated: string
}

class DatabaseService {
  private db: Database.Database
  private dbPath: string

  constructor() {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    this.dbPath = path.join(dataDir, 'spingrid.db')
    this.db = new Database(this.dbPath)
    this.initializeTables()
  }

  private initializeTables() {
    // Create albums table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        releaseGroupId TEXT,
        title TEXT NOT NULL,
        primaryArtistId TEXT,
        artistCredit TEXT NOT NULL,
        label TEXT,
        releaseDate TEXT NOT NULL,
        regions TEXT,
        genres TEXT NOT NULL,
        isReissue BOOLEAN DEFAULT FALSE,
        primaryType TEXT DEFAULT 'Album',
        coverUrl TEXT,
        weeklyScore INTEGER DEFAULT 0,
        trackCount INTEGER,
        barcode TEXT,
        sourceTags TEXT DEFAULT '',
        sourceCount INTEGER DEFAULT 1,
        lastUpdated TEXT NOT NULL
      )
    `)

    // Create artists table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS artists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        bioExcerpt TEXT,
        tags TEXT,
        lastUpdated TEXT NOT NULL
      )
    `)

    // Create cover_art table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cover_art (
        albumId TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        source TEXT NOT NULL,
        lastUpdated TEXT NOT NULL,
        FOREIGN KEY (albumId) REFERENCES albums (id)
      )
    `)

    // Create critical_consensus table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS critical_consensus (
        albumId TEXT PRIMARY KEY,
        consensus TEXT NOT NULL,
        generatedAt TEXT NOT NULL,
        model TEXT NOT NULL,
        FOREIGN KEY (albumId) REFERENCES albums (id)
      )
    `)

    // Create album_reviews table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS album_reviews (
        id TEXT PRIMARY KEY,
        albumId TEXT NOT NULL,
        source TEXT NOT NULL,
        url TEXT,
        score REAL,
        maxScore REAL,
        excerpt TEXT NOT NULL,
        reviewer TEXT,
        publishedAt TEXT,
        scrapedAt TEXT NOT NULL,
        FOREIGN KEY (albumId) REFERENCES albums (id)
      )
    `)

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_albums_release_date ON albums (releaseDate);
      CREATE INDEX IF NOT EXISTS idx_albums_genres ON albums (genres);
      CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums (artistCredit);
      CREATE INDEX IF NOT EXISTS idx_albums_weekly_score ON albums (weeklyScore);
      CREATE INDEX IF NOT EXISTS idx_consensus_album ON critical_consensus (albumId);
      CREATE INDEX IF NOT EXISTS idx_reviews_album ON album_reviews (albumId);
      CREATE INDEX IF NOT EXISTS idx_reviews_source ON album_reviews (source);
    `)

    console.log('[Database] Tables initialized successfully')
    
    // Check if migration is needed
    this.migrateIfNeeded()
  }

  private migrateIfNeeded() {
    try {
      // Check if sourceCount column exists
      const tableInfo = this.db.prepare("PRAGMA table_info(albums)").all() as any[]
      const hasSourceCount = tableInfo.some(col => col.name === 'sourceCount')
      
      if (!hasSourceCount) {
        console.log('[Database] Migrating database to add source columns...')
        
        // Add new columns to existing table
        this.db.exec(`
          ALTER TABLE albums ADD COLUMN sourceTags TEXT DEFAULT '';
          ALTER TABLE albums ADD COLUMN sourceCount INTEGER DEFAULT 1;
        `)
        
        console.log('[Database] Migration completed successfully')
      }
    } catch (error) {
      console.error('[Database] Migration error:', error)
    }
  }

  // Album operations
  async upsertAlbum(album: Omit<DatabaseAlbum, 'lastUpdated'>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO albums (
        id, releaseGroupId, title, primaryArtistId, artistCredit, label, 
        releaseDate, regions, genres, isReissue, primaryType, coverUrl, 
        weeklyScore, trackCount, barcode, sourceTags, sourceCount, lastUpdated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      album.id,
      album.releaseGroupId,
      album.title,
      album.primaryArtistId,
      album.artistCredit,
      album.label,
      album.releaseDate,
      album.regions,
      album.genres,
      album.isReissue ? 1 : 0,  // Convert boolean to integer
      album.primaryType,
      album.coverUrl,
      album.weeklyScore,
      album.trackCount,
      album.barcode,
      album.sourceTags || '',
      album.sourceCount || 1,
      new Date().toISOString()
    )
  }

  async getAlbums(limit: number = 50, offset: number = 0): Promise<DatabaseAlbum[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM albums 
      ORDER BY releaseDate DESC, sourceCount DESC, weeklyScore DESC 
      LIMIT ? OFFSET ?
    `)
    
    const rows = stmt.all(limit, offset) as any[]
    return rows.map(row => ({
      ...row,
      isReissue: Boolean(row.isReissue)  // Convert integer back to boolean
    })) as DatabaseAlbum[]
  }

  async getAlbumById(id: string): Promise<DatabaseAlbum | null> {
    const stmt = this.db.prepare('SELECT * FROM albums WHERE id = ?')
    const result = stmt.get(id) as any
    if (!result) return null
    
    return {
      ...result,
      isReissue: Boolean(result.isReissue)  // Convert integer back to boolean
    } as DatabaseAlbum
  }

  async searchAlbums(query: string, limit: number = 20): Promise<DatabaseAlbum[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM albums 
      WHERE title LIKE ? OR artistCredit LIKE ? OR genres LIKE ?
      ORDER BY weeklyScore DESC 
      LIMIT ?
    `)
    
    const searchTerm = `%${query}%`
    const rows = stmt.all(searchTerm, searchTerm, searchTerm, limit) as any[]
    return rows.map(row => ({
      ...row,
      isReissue: Boolean(row.isReissue)  // Convert integer back to boolean
    })) as DatabaseAlbum[]
  }

  async getAlbumsByGenre(genre: string, limit: number = 50): Promise<DatabaseAlbum[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM albums 
      WHERE genres LIKE ? 
      ORDER BY weeklyScore DESC, releaseDate DESC 
      LIMIT ?
    `)
    
    const rows = stmt.all(`%${genre}%`, limit) as any[]
    return rows.map(row => ({
      ...row,
      isReissue: Boolean(row.isReissue)  // Convert integer back to boolean
    })) as DatabaseAlbum[]
  }

  async getAlbumsByDateRange(startDate: string, endDate: string): Promise<DatabaseAlbum[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM albums 
      WHERE releaseDate BETWEEN ? AND ? 
      ORDER BY weeklyScore DESC, releaseDate DESC
    `)
    
    const rows = stmt.all(startDate, endDate) as any[]
    return rows.map(row => ({
      ...row,
      isReissue: Boolean(row.isReissue)  // Convert integer back to boolean
    })) as DatabaseAlbum[]
  }

  async getTotalAlbumCount(): Promise<number> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM albums')
    const result = stmt.get() as { count: number }
    return result.count
  }

  async removeAlbum(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM albums WHERE id = ?')
    stmt.run(id)
  }

  async removeCoverArt(albumId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM cover_art WHERE albumId = ?')
    stmt.run(albumId)
  }

  // Artist operations
  async upsertArtist(artist: Omit<DatabaseArtist, 'lastUpdated'>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO artists (id, name, bioExcerpt, tags, lastUpdated)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(
      artist.id,
      artist.name,
      artist.bioExcerpt,
      artist.tags,
      new Date().toISOString()
    )
  }

  async getArtistById(id: string): Promise<DatabaseArtist | null> {
    const stmt = this.db.prepare('SELECT * FROM artists WHERE id = ?')
    const result = stmt.get(id) as DatabaseArtist | undefined
    return result || null
  }

  // Cover art operations
  async upsertCoverArt(coverArt: Omit<DatabaseCoverArt, 'lastUpdated'>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO cover_art (albumId, url, source, lastUpdated)
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(
      coverArt.albumId,
      coverArt.url,
      coverArt.source,
      new Date().toISOString()
    )
  }

  async getCoverArtByAlbumId(albumId: string): Promise<DatabaseCoverArt | null> {
    const stmt = this.db.prepare('SELECT * FROM cover_art WHERE albumId = ?')
    const result = stmt.get(albumId) as DatabaseCoverArt | undefined
    return result || null
  }

  // Utility methods
  async clearOldData(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    const cutoffISO = cutoffDate.toISOString()

    const stmt = this.db.prepare('DELETE FROM albums WHERE lastUpdated < ?')
    stmt.run(cutoffISO)
    
    console.log(`[Database] Cleared albums older than ${daysOld} days`)
  }

  async getDatabaseStats(): Promise<{
    totalAlbums: number
    totalArtists: number
    totalCoverArt: number
    lastUpdated: string | null
  }> {
    const albumCount = await this.getTotalAlbumCount()
    
    const artistStmt = this.db.prepare('SELECT COUNT(*) as count FROM artists')
    const artistResult = artistStmt.get() as { count: number }
    
    const coverStmt = this.db.prepare('SELECT COUNT(*) as count FROM cover_art')
    const coverResult = coverStmt.get() as { count: number }
    
    const lastUpdatedStmt = this.db.prepare('SELECT MAX(lastUpdated) as lastUpdated FROM albums')
    const lastUpdatedResult = lastUpdatedStmt.get() as { lastUpdated: string | null }
    
    return {
      totalAlbums: albumCount,
      totalArtists: artistResult.count,
      totalCoverArt: coverResult.count,
      lastUpdated: lastUpdatedResult.lastUpdated
    }
  }

  // Critical Consensus methods
  async getCriticalConsensus(albumId: string): Promise<{
    albumId: string
    consensus: string
    generatedAt: string
    model: string
  } | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM critical_consensus WHERE albumId = ?')
      const result = stmt.get(albumId) as any
      return result || null
    } catch (error) {
      console.error('[Database] Error getting critical consensus:', error)
      return null
    }
  }

  async storeCriticalConsensus(data: {
    albumId: string
    consensus: string
    generatedAt: string
    model: string
  }): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO critical_consensus (albumId, consensus, generatedAt, model)
        VALUES (?, ?, ?, ?)
      `)
      stmt.run(data.albumId, data.consensus, data.generatedAt, data.model)
    } catch (error) {
      console.error('[Database] Error storing critical consensus:', error)
      throw error
    }
  }

  // Album Reviews methods
  async getAlbumReviews(albumId: string): Promise<{
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
  }[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM album_reviews WHERE albumId = ? ORDER BY source')
      const results = stmt.all(albumId) as any[]
      return results
    } catch (error) {
      console.error('[Database] Error getting album reviews:', error)
      return []
    }
  }

  async storeAlbumReviews(reviews: Array<{
    id: string
    albumId: string
    source: string
    url?: string | null
    score?: number | null
    maxScore?: number | null
    excerpt: string
    reviewer?: string | null
    publishedAt?: string | null
    scrapedAt: string
  }>): Promise<void> {
    const transaction = this.db.transaction((reviewsList: any[]) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO album_reviews 
        (id, albumId, source, url, score, maxScore, excerpt, reviewer, publishedAt, scrapedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const review of reviewsList) {
        stmt.run(
          review.id,
          review.albumId,
          review.source,
          review.url || null,
          review.score || null,
          review.maxScore || null,
          review.excerpt,
          review.reviewer || null,
          review.publishedAt || null,
          review.scrapedAt
        )
      }
    })
    
    try {
      transaction(reviews)
      console.log(`[Database] Stored ${reviews.length} reviews`)
    } catch (error) {
      console.error('[Database] Error storing album reviews:', error)
      throw error
    }
  }

  async getAlbumsWithoutConsensus(limit: number = 50): Promise<DatabaseAlbum[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT a.* FROM albums a
        LEFT JOIN critical_consensus c ON a.id = c.albumId
        WHERE c.albumId IS NULL
        ORDER BY a.weeklyScore DESC
        LIMIT ?
      `)
      const results = stmt.all(limit) as any[]
      return results.map(row => this.convertDbRowToAlbum(row))
    } catch (error) {
      console.error('[Database] Error getting albums without consensus:', error)
      return []
    }
  }

  async getAlbumsWithoutReviews(limit: number = 50): Promise<DatabaseAlbum[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT a.* FROM albums a
        LEFT JOIN album_reviews r ON a.id = r.albumId
        WHERE r.albumId IS NULL
        ORDER BY a.weeklyScore DESC
        LIMIT ?
      `)
      const results = stmt.all(limit) as any[]
      return results.map(row => this.convertDbRowToAlbum(row))
    } catch (error) {
      console.error('[Database] Error getting albums without reviews:', error)
      return []
    }
  }

  async deleteAlbumReviews(albumId: string): Promise<void> {
    try {
      const stmt = this.db.prepare('DELETE FROM album_reviews WHERE albumId = ?')
      stmt.run(albumId)
    } catch (error) {
      console.error('[Database] Error deleting album reviews:', error)
      throw error
    }
  }

  private convertDbRowToAlbum(row: any): DatabaseAlbum {
    return {
      ...row,
      isReissue: Boolean(row.isReissue)
    } as DatabaseAlbum
  }

  close(): void {
    this.db.close()
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()

// Ensure graceful shutdown
process.on('SIGINT', () => {
  console.log('[Database] Closing database connection...')
  databaseService.close()
  process.exit(0)
})
