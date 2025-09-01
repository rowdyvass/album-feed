"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SyncStatus {
  isRunning: boolean
  lastSyncTime: string | null
}

interface DatabaseStats {
  totalAlbums: number
  totalArtists: number
  totalCoverArt: number
  lastUpdated: string | null
}

export default function SyncPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/sync')
      const data = await response.json()
      setSyncStatus(data.syncStatus)
      setDbStats(data.databaseStats)
      setMessage('Status updated')
    } catch (error) {
      setMessage('Failed to check status')
    }
  }

  const triggerSync = async (action: 'full-sync' | 'incremental-sync') => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, limit: 100 })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(data.message)
        // Update status after sync
        await checkStatus()
      } else {
        setMessage(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to trigger sync')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Sync Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sync Controls */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Sync Controls</h2>
            
            <div className="space-y-4">
              <Button
                onClick={() => triggerSync('full-sync')}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {loading ? 'Syncing...' : 'Full Sync (100 albums)'}
              </Button>
              
              <Button
                onClick={() => triggerSync('incremental-sync')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Syncing...' : 'Incremental Sync'}
              </Button>
              
              <Button
                onClick={checkStatus}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Check Status
              </Button>
            </div>
            
            {message && (
              <div className="mt-4 p-3 bg-slate-700 rounded text-sm">
                {message}
              </div>
            )}
          </div>

          {/* Status Display */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            
            {syncStatus && (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-300">Sync Running:</span>
                  <span className={syncStatus.isRunning ? 'text-red-400' : 'text-green-400'}>
                    {syncStatus.isRunning ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-300">Last Sync:</span>
                  <span className="text-slate-200">
                    {syncStatus.lastSyncTime 
                      ? new Date(syncStatus.lastSyncTime).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            )}

            {dbStats && (
              <div className="space-y-3">
                <h3 className="font-medium text-slate-200">Database Stats</h3>
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Albums:</span>
                  <span className="text-slate-200">{dbStats.totalAlbums}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Artists:</span>
                  <span className="text-slate-200">{dbStats.totalArtists}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Cover Art:</span>
                  <span className="text-slate-200">{dbStats.totalCoverArt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Last Updated:</span>
                  <span className="text-slate-200">
                    {dbStats.lastUpdated 
                      ? new Date(dbStats.lastUpdated).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-2 text-slate-300">
            <p>• <strong>Full Sync:</strong> Fetches up to 100 albums from Pitchfork + MusicBrainz and stores them in the database</p>
            <p>• <strong>Incremental Sync:</strong> Updates existing data and fetches new releases</p>
            <p>• <strong>Background Sync:</strong> Automatically triggers when the main feed API detects the database is empty or outdated</p>
            <p>• <strong>Performance:</strong> Once synced, all album data is served instantly from the local database</p>
          </div>
        </div>
      </div>
    </div>
  )
}
