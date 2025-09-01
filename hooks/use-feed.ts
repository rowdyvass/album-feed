import { useState, useEffect, useCallback } from 'react'
import type { Album, FeedFilters, FeedSort } from '@/types'

interface UseFeedOptions {
  initialFilters?: FeedFilters
  initialSort?: FeedSort
  pageSize?: number
}

interface UseFeedReturn {
  albums: Album[]
  loading: boolean
  error: string | null
  hasMore: boolean
  filters: FeedFilters
  sort: FeedSort
  setFilters: (filters: FeedFilters) => void
  setSort: (sort: FeedSort) => void
  loadMore: () => void
  refresh: () => void
}

export function useFeed(options: UseFeedOptions = {}): UseFeedReturn {
  const {
    initialFilters = {},
    initialSort = { by: 'weeklyScore', direction: 'desc' },
    pageSize = 50
  } = options

  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<FeedFilters>(initialFilters)
  const [sort, setSort] = useState<FeedSort>(initialSort)
  const [nextCursor, setNextCursor] = useState<string | undefined>()

  const fetchFeed = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      // Add filters
      if (filters.genres?.length) {
        params.append('genres', filters.genres.join(','))
      }
      if (filters.week) {
        params.append('week', filters.week)
      }
      if (filters.regions?.length) {
        params.append('regions', filters.regions.join(','))
      }
      if (filters.format?.length) {
        params.append('format', filters.format.join(','))
      }
      if (filters.excludeReissues) {
        params.append('excludeReissues', 'true')
      }
      
      // Always use curated feed
      params.append('curated', 'true')
      
      // Add pagination
      params.append('limit', pageSize.toString())
      if (isLoadMore && nextCursor) {
        params.append('cursor', nextCursor)
      }

      // Add timeout to the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout
      
      const response = await fetch(`/api/feed?${params.toString()}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (isLoadMore) {
        // Prevent duplicates when loading more
        setAlbums(prev => {
          const existingIds = new Set(prev.map((album: any) => album.id))
          const newAlbums = data.items.filter((album: any) => !existingIds.has(album.id))
          return [...prev, ...newAlbums]
        })
      } else {
        setAlbums(data.items)
      }
      
      setNextCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch (err) {
      let errorMessage = 'Failed to fetch feed'
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      console.error('Error fetching feed:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, sort, pageSize, nextCursor])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchFeed(true)
    }
  }, [loading, hasMore, fetchFeed])

  const refresh = useCallback(() => {
    setNextCursor(undefined)
    setHasMore(true)
    fetchFeed(false)
  }, [fetchFeed])

  const updateFilters = useCallback((newFilters: FeedFilters) => {
    setFilters(newFilters)
    setNextCursor(undefined)
    setHasMore(true)
  }, [])

  const updateSort = useCallback((newSort: FeedSort) => {
    setSort(newSort)
    setNextCursor(undefined)
    setHasMore(true)
  }, [])

  // Single effect to handle all refresh triggers
  useEffect(() => {
    console.log('[useFeed] useEffect triggered, filters:', filters, 'sort:', sort)
    // Reset state when key dependencies change
    setNextCursor(undefined)
    setHasMore(true)
    setAlbums([]) // Clear albums to prevent duplicates
    
    // Fetch fresh data - use a timeout to avoid circular dependency
    const timeoutId = setTimeout(() => {
      fetchFeed(false)
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, [filters, sort]) // Remove fetchFeed from dependencies to avoid circular dependency

  return {
    albums,
    loading,
    error,
    hasMore,
    filters,
    sort,
    setFilters: updateFilters,
    setSort: updateSort,
    loadMore,
    refresh
  }
}
