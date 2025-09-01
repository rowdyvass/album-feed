import { NextRequest, NextResponse } from 'next/server'
import { dataSyncService } from '@/lib/data-sync'
import { databaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { action, limit } = await request.json()
    
    switch (action) {
      case 'full-sync':
        console.log('[API] Starting full data sync...')
        await dataSyncService.syncAllData(limit || 100)
        break
        
      case 'incremental-sync':
        console.log('[API] Starting incremental data sync...')
        await dataSyncService.incrementalSync()
        break
        
      case 'check-status':
        // Just return status, no sync
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: full-sync, incremental-sync, or check-status' },
          { status: 400 }
        )
    }

    // Get current status
    const syncStatus = dataSyncService.getSyncStatus()
    const dbStats = await databaseService.getDatabaseStats()
    const syncNeeded = await dataSyncService.isSyncNeeded()

    return NextResponse.json({
      success: true,
      syncStatus,
      databaseStats: dbStats,
      syncNeeded,
      message: `Data sync ${action === 'check-status' ? 'status checked' : 'completed successfully'}`
    })

  } catch (error) {
    console.error('[API] Error during data sync:', error)
    
    const syncStatus = dataSyncService.getSyncStatus()
    const dbStats = await databaseService.getDatabaseStats()
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during sync',
        syncStatus,
        databaseStats: dbStats
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const syncStatus = dataSyncService.getSyncStatus()
    const dbStats = await databaseService.getDatabaseStats()
    const syncNeeded = await dataSyncService.isSyncNeeded()

    return NextResponse.json({
      syncStatus,
      databaseStats: dbStats,
      syncNeeded
    })
  } catch (error) {
    console.error('[API] Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}
