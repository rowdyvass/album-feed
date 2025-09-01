// Core data types for Album Feed and SpinGrid

export interface Album {
  id: string
  releaseGroupId: string
  title: string
  primaryArtistId: string
  artistCredit: string
  label: string
  releaseDate: string
  regions: string[]
  genres: string[]
  isReissue: boolean
  primaryType: "Album" | "EP"
  coverUrl: string
  weeklyScore: number
  sourceTags: string[]
  sourceCount: number
  badges: Badge[]
}

export interface Artist {
  id: string
  name: string
  wikidataId?: string
  wikipediaUrl?: string
  bioExcerpt: string
  relatedArtistIds: string[]
  previousReleases: Album[]
}

export interface Review {
  id: string
  albumId: string
  source: string
  url: string
  score100: number
  tag?: "BNM" | "Editor" | "AOTM"
  excerpt: string
  publishedAt: string
}

export interface Badge {
  type: "BNM" | "YearEnd" | "Chart" | "Store" | "Bandcamp"
  source: string
  awardedAt: string
  meta?: {
    position?: number
    listName?: string
  }
}

export interface StreamingLinks {
  spotify?: {
    id: string
    url: string
  }
  appleMusic?: {
    url: string
  }
  tidal?: {
    url: string
  }
  bandcamp?: {
    url: string
  }
}

export interface PurchaseLinks {
  bandcamp?: string
  roughTrade?: string
  amazon?: string
  juno?: string
  discogs?: string
}

export interface AlbumDetail extends Album {
  artist: Artist
  streamingLinks: StreamingLinks
  purchaseLinks: PurchaseLinks
  recommendationBlurb: string
  reviews: Review[]
}

export interface FeedFilters {
  genres?: string[]
  week?: string // YYYY-WW format
  regions?: string[]
  format?: ("Album" | "EP")[]
  excludeReissues?: boolean
  sources?: string[]
}

export interface FeedSort {
  by: "weeklyScore" | "mostDiscussed" | "highestCritic"
  direction: "desc" | "asc"
}

export interface FeedResponse {
  items: Album[]
  nextCursor?: string
  totalCount: number
  filters: {
    availableGenres: string[]
    availableWeeks: string[]
    availableRegions: string[]
  }
}

// Core data types for SpinGrid
