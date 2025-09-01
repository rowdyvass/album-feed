

"use client"

import { useState, useEffect } from "react"
import { AlbumCard } from "./album-card"
import { useFeed } from "@/hooks/use-feed"
import type { Album, FeedFilters, FeedSort } from "@/types"
import { Search, ChevronDown } from "lucide-react"
import Image from "next/image"

const musicGenres = [
  "All Genres",
  "Rock",
  "Pop",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Folk",
  "Indie Rock",
  "R&B",
  "Metal",
  "Punk",
  "Country",
  "Classical",
  "Reggae",
  "Blues",
  "Ambient",
  "House",
  "Techno",
]

const streamingServices = [
  "Any streaming service",
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "Pandora",
  "Deezer",
  "Tidal",
]

const sortOptions = ["Newest > Oldest", "Oldest > Newest"]

export function AlbumGrid() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All Genres")
  const [selectedService, setSelectedService] = useState("Any streaming service")
  const [selectedSort, setSelectedSort] = useState("Newest > Oldest")
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  // Use the new feed hook
  const {
    albums,
    loading,
    error,
    hasMore,
    filters,
    setFilters,
    loadMore
  } = useFeed({
    initialFilters: {
      excludeReissues: false
    },
    initialSort: {
      by: 'weeklyScore',
      direction: 'desc'
    }
  })

  console.log('[AlbumGrid] Hook state:', { albums: albums?.length, loading, error, hasMore })

  // Function to close all other dropdowns when opening one
  const openDropdown = (dropdownType: 'genre' | 'service' | 'sort') => {
    if (dropdownType === 'genre') {
      setShowGenreDropdown(true)
      setShowServiceDropdown(false)
      setShowSortDropdown(false)
    } else if (dropdownType === 'service') {
      setShowServiceDropdown(true)
      setShowGenreDropdown(false)
      setShowSortDropdown(false)
    } else if (dropdownType === 'sort') {
      setShowSortDropdown(true)
      setShowGenreDropdown(false)
      setShowServiceDropdown(false)
    }
  }

  // Function to handle genre selection
  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre)
    setShowGenreDropdown(false)
  }

  // Function to handle service selection
  const handleServiceSelect = (service: string) => {
    setSelectedService(service)
    setShowServiceDropdown(false)
  }

  // Function to handle sort selection
  const handleSortSelect = (sort: string) => {
    setSelectedSort(sort)
    setShowSortDropdown(false)
  }

  // Function to clear a specific filter
  const clearFilter = (filterType: 'genre' | 'service') => {
    if (filterType === 'genre') {
      setSelectedGenre("All Genres")
    } else if (filterType === 'service') {
      setSelectedService("Any streaming service")
    }
  }

  // Filter albums based on search query and selected filters
  const filteredAlbums = albums.filter(album => {
    if (searchQuery.trim()) {
      const matchesSearch = 
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artistCredit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.genres.some((genre) => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      
      if (!matchesSearch) return false
    }

    if (selectedGenre !== "All Genres") {
      const matchesGenre = album.genres.some((genre) => 
        genre.toLowerCase().includes(selectedGenre.toLowerCase())
      )
      if (!matchesGenre) return false
    }

    if (selectedService !== "Any streaming service") {
      // TODO: Implement actual streaming service filtering in Phase 4
      return Math.random() > 0.3
    }

    return true
  })

  // Sort albums based on selected sort option
  const sortedAlbums = [...filteredAlbums].sort((a, b) => {
    if (selectedSort === "Newest > Oldest") {
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    } else if (selectedSort === "Oldest > Newest") {
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    }
    return 0
  })

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (hasMore && !loading) {
          loadMore()
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasMore, loading, loadMore])

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })
  }

  const groupAlbumsByDate = (albums: Album[]) => {
    const grouped: { [key: string]: Album[] } = {}

    albums.forEach((album) => {
      const dateKey = album.releaseDate
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(album)
    })

    return grouped
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Image src="/spingrid-logo-header.png" alt="SpinGrid Logo" width={32} height={32} className="w-8 h-8" />
                <h1 className="text-2xl font-bold text-white">SpinGrid</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700 text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-md border border-slate-600 focus:border-amber-500 focus:outline-none w-64"
                />
              </div>
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                J
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h2 className="text-lg font-semibold text-white">ALBUMS</h2>
              
              {/* Selected Filters Display */}
              <div className="flex items-center space-x-3">
                {selectedGenre !== "All Genres" && (
                  <div className="px-3 py-1 bg-slate-600 text-white rounded-md text-sm font-medium flex items-center space-x-2">
                    <span>{selectedGenre}</span>
                    <button
                      onClick={() => clearFilter('genre')}
                      className="text-slate-300 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
                {selectedService !== "Any streaming service" && (
                  <div className="px-3 py-1 bg-slate-600 text-white rounded-md text-sm font-medium flex items-center space-x-2">
                    <span>{selectedService}</span>
                    <button
                      onClick={() => clearFilter('service')}
                      className="text-slate-300 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="relative">
                  <button
                    onClick={() => openDropdown('genre')}
                    className="text-slate-300 hover:text-white flex items-center space-x-1"
                  >
                    <span>GENRE</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showGenreDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-10 min-w-[160px]">
                      {musicGenres.map((genre) => (
                                                  <button
                            key={genre}
                            onClick={() => handleGenreSelect(genre)}
                            className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-600 ${
                              selectedGenre === genre ? "text-amber-400" : "text-slate-300"
                            }`}
                          >
                          {genre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => openDropdown('service')}
                    className="text-slate-300 hover:text-white flex items-center space-x-1"
                  >
                    <span>SERVICE</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showServiceDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-10 min-w-[180px]">
                      {streamingServices.map((service) => (
                                                  <button
                            key={service}
                            onClick={() => handleServiceSelect(service)}
                            className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-600 ${
                              selectedService === service ? "text-amber-400" : "text-slate-300"
                            }`}
                          >
                          {service}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => openDropdown('sort')}
                  className="text-slate-300 hover:text-white flex items-center space-x-1 text-sm"
                >
                  <span>Sort by {selectedSort}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-10 min-w-[160px]">
                    {sortOptions.map((option) => (
                                              <button
                          key={option}
                          onClick={() => handleSortSelect(option)}
                          className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-600 ${
                            selectedSort === option ? "text-amber-400" : "text-slate-300"
                          }`}
                        >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="text-center py-8">
            <div className="text-red-400 text-lg mb-2">Error loading albums</div>
            <div className="text-slate-400">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-md hover:bg-amber-400"
            >
              Retry
            </button>
          </div>
        )}

        {!error && sortedAlbums.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-slate-400 text-lg">No albums found</div>
            <div className="text-slate-500">Try adjusting your filters or search terms</div>
          </div>
        )}

        {/* Show skeleton loading while initially loading */}
        {loading && sortedAlbums.length === 0 && (
          <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, dateIndex) => (
              <div key={dateIndex}>
                {/* Release date divider skeleton */}
                <div className="flex items-center mb-6">
                  <div className="flex-1 h-px bg-slate-700"></div>
                  <div className="w-24 h-4 mx-4 skeleton-shimmer rounded"></div>
                  <div className="flex-1 h-px bg-slate-700"></div>
                </div>
                {/* Skeleton grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="group cursor-pointer transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-800 border border-slate-700 shadow-lg skeleton-card">
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-12 h-12 rounded-full skeleton-shimmer"></div>
                            <div className="w-16 h-3 skeleton-shimmer rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show actual albums when loaded */}
        {!loading && sortedAlbums.length > 0 && (() => {
          const groupedAlbums = groupAlbumsByDate(sortedAlbums)
          const sortedDates = Object.keys(groupedAlbums).sort((a, b) => {
            if (selectedSort === "Newest > Oldest") {
              return new Date(b).getTime() - new Date(a).getTime()
            } else {
              return new Date(a).getTime() - new Date(b).getTime()
            }
          })

          return sortedDates.map((date, dateIndex) => (
            <div key={date} className={dateIndex > 0 ? "mt-12" : ""}>
              {/* Release date divider */}
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-slate-700"></div>
                <div className="px-4 text-slate-400 text-sm font-medium">{formatReleaseDate(date)}</div>
                <div className="flex-1 h-px bg-slate-700"></div>
              </div>

              {/* Albums grid for this date */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {groupedAlbums[date].map((album, index) => (
                  <AlbumCard key={`${album.id}-${index}`} album={album} selectedService={selectedService} />
                ))}
              </div>
            </div>
          ))
        })()}

        {loading && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
            <div className="text-slate-400 text-sm">Loading albums...</div>
            <div className="text-slate-500 text-xs mt-2">This may take a few moments</div>
          </div>
        )}

        {!loading && hasMore && (
          <div className="text-center py-8">
            <button 
              onClick={loadMore}
              className="px-6 py-3 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
            >
              Load More Albums
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
