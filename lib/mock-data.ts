// Mock data for development and testing

import type { Album, Artist, Review, AlbumDetail, Badge } from "@/types"

export const mockGenres = [
  "Indie Rock",
  "Electronic",
  "Hip Hop",
  "Jazz",
  "Folk",
  "Pop",
  "Metal",
  "R&B",
  "Punk",
  "Ambient",
  "House",
  "Techno",
]

export const mockArtists: Artist[] = [
  {
    id: "artist_1",
    name: "Boygenius",
    bioExcerpt: "Indie rock supergroup featuring Phoebe Bridgers, Lucy Dacus, and Julien Baker.",
    relatedArtistIds: ["artist_2", "artist_3"],
    previousReleases: [],
  },
  {
    id: "artist_2",
    name: "Phoebe Bridgers",
    bioExcerpt: "Indie rock singer-songwriter known for introspective lyrics and ethereal soundscapes.",
    relatedArtistIds: ["artist_1"],
    previousReleases: [],
  },
  {
    id: "artist_3",
    name: "Burial",
    bioExcerpt: "UK electronic producer pioneering the dubstep and UK garage revival.",
    relatedArtistIds: [],
    previousReleases: [],
  },
]

export const mockBadges: Badge[] = [
  {
    type: "BNM",
    source: "Pitchfork",
    awardedAt: "2024-03-15T00:00:00Z",
  },
  {
    type: "Chart",
    source: "Billboard 200",
    awardedAt: "2024-03-20T00:00:00Z",
    meta: { position: 3 },
  },
  {
    type: "Store",
    source: "Rough Trade",
    awardedAt: "2024-03-10T00:00:00Z",
    meta: { listName: "Album of the Month" },
  },
]

// Generate more mock albums for testing infinite scroll
const generateMockAlbums = (count: number): Album[] => {
  const albums: Album[] = []

  const artistNames = [
    "The Strokes",
    "Radiohead",
    "Aphex Twin",
    "Kendrick Lamar",
    "Björk",
    "Death Grips",
    "FKA twigs",
    "Tyler, The Creator",
    "Grimes",
    "Mac Miller",
    "Solange",
    "JPEGMAFIA",
    "Arca",
    "Danny Brown",
    "Caroline Polachek",
    "100 gecs",
    "Charli XCX",
    "SOPHIE",
    "Clairo",
    "Rex Orange County",
    "Tame Impala",
    "King Krule",
    "Blood Orange",
    "Frank Ocean",
    "Bon Iver",
    "Sufjan Stevens",
    "Animal Collective",
    "Beach House",
    "Vampire Weekend",
    "Arctic Monkeys",
    "The National",
    "LCD Soundsystem",
    "Interpol",
    "Yeah Yeah Yeahs",
    "Modest Mouse",
    "Built to Spill",
    "Pavement",
    "Sonic Youth",
    "My Bloody Valentine",
    "Slowdive",
    "Ride",
    "Cocteau Twins",
    "Mazzy Star",
    "Galaxie 500",
  ]

  const albumTitles = [
    "Midnight Reverie",
    "Digital Dreams",
    "Neon Nights",
    "Urban Echoes",
    "Cosmic Drift",
    "Raw Energy",
    "Velvet Shadows",
    "Electric Pulse",
    "Golden Hour",
    "Infinite Loop",
    "Broken Glass",
    "Silver Lining",
    "Dark Matter",
    "Crystal Vision",
    "Neon Genesis",
    "Acid Rain",
    "Purple Haze",
    "Ocean Waves",
    "Mountain Peak",
    "Desert Storm",
    "City Lights",
    "Starlight",
    "Moonbeam",
    "Sunrise",
    "Twilight",
    "Dawn Chorus",
    "Night Shift",
    "Day Dreams",
    "Lucid State",
    "Fever Dream",
    "Reality Check",
    "Time Capsule",
    "Memory Lane",
    "Future Shock",
    "Past Lives",
    "Present Tense",
    "Parallel Universe",
    "Alternate Reality",
    "Virtual World",
    "Digital Age",
    "Analog Soul",
  ]

  const fridayDates = [
    "2024-08-30", // Most recent Friday - 15 albums
    "2024-08-23", // 12 albums
    "2024-08-16", // 10 albums
    "2024-08-09", // 8 albums
    "2024-08-02", // 6 albums
    "2024-07-26", // 5 albums
    "2024-07-19", // 4 albums
  ]

  // Define how many albums per date
  const albumsPerDate = [15, 12, 10, 8, 6, 5, 4]
  let albumIndex = 0

  fridayDates.forEach((date, dateIndex) => {
    const albumCount = albumsPerDate[dateIndex]

    for (let i = 0; i < albumCount; i++) {
      const artistName = artistNames[albumIndex % artistNames.length]
      const albumTitle = albumTitles[albumIndex % albumTitles.length]
      const genre = mockGenres[albumIndex % mockGenres.length]
      const variation = Math.floor(albumIndex / artistNames.length) + 1

      albums.push({
        id: `album_${albumIndex + 4}`,
        releaseGroupId: `rg_${albumIndex + 126}`,
        title: variation > 1 ? `${albumTitle} ${variation}` : albumTitle,
        primaryArtistId: `artist_${albumIndex + 4}`,
        artistCredit: artistName,
        label: ["Independent", "XL Recordings", "Warp Records", "4AD", "Domino", "Sub Pop", "Matador"][albumIndex % 7],
        releaseDate: date,
        regions: ["US", "UK"],
        genres: [genre],
        isReissue: Math.random() > 0.85,
        primaryType: Math.random() > 0.75 ? "EP" : "Album",
        coverUrl: `/placeholder.svg?height=300&width=300&query=${genre.toLowerCase().replace(" ", "-")}-album-cover-${artistName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${albumTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        weeklyScore: Math.round((Math.random() * 35 + 55) * 10) / 10, // Scores between 55-90
        badges: Math.random() > 0.7 ? [mockBadges[Math.floor(Math.random() * mockBadges.length)]] : [],
      })

      albumIndex++
    }
  })

  return albums
}

const additionalMockAlbums = generateMockAlbums(60)

export const mockAlbums: Album[] = [
  {
    id: "album_1",
    releaseGroupId: "rg_123",
    title: "The Record",
    primaryArtistId: "artist_1",
    artistCredit: "Boygenius",
    label: "Interscope Records",
    releaseDate: "2024-08-30", // Updated to recent Friday
    regions: ["US", "UK"],
    genres: ["Indie Rock", "Folk"],
    isReissue: false,
    primaryType: "Album",
    coverUrl: "/indie-rock-album-boygenius.png",
    weeklyScore: 87.4,
    badges: [mockBadges[0], mockBadges[2]],
  },
  {
    id: "album_2",
    releaseGroupId: "rg_124",
    title: "Antidawn",
    primaryArtistId: "artist_3",
    artistCredit: "Burial",
    label: "Hyperdub",
    releaseDate: "2024-08-23", // Updated to Friday
    regions: ["UK", "US"],
    genres: ["Electronic", "Ambient"],
    isReissue: false,
    primaryType: "EP",
    coverUrl: "/electronic-album-burial.png",
    weeklyScore: 82.1,
    badges: [mockBadges[1]],
  },
  {
    id: "album_3",
    releaseGroupId: "rg_125",
    title: "Punisher",
    primaryArtistId: "artist_2",
    artistCredit: "Phoebe Bridgers",
    label: "Dead Oceans",
    releaseDate: "2024-08-16", // Updated to Friday
    regions: ["US", "UK"],
    genres: ["Indie Rock", "Folk"],
    isReissue: true,
    primaryType: "Album",
    coverUrl: "/indie-folk-album-phoebe-bridgers.png",
    weeklyScore: 79.8,
    badges: [],
  },
  ...additionalMockAlbums,
]

export const mockReviews: Review[] = [
  {
    id: "review_1",
    albumId: "album_1",
    source: "Pitchfork",
    url: "https://pitchfork.com/reviews/albums/boygenius-the-record/",
    score100: 85,
    tag: "BNM",
    excerpt: "A stunning collaboration that showcases each member's strengths while creating something entirely new.",
    publishedAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "review_2",
    albumId: "album_2",
    source: "Resident Advisor",
    url: "https://ra.co/reviews/burial-antidawn",
    score100: 80,
    excerpt:
      "Burial continues to push the boundaries of electronic music with haunting textures and innovative sound design.",
    publishedAt: "2024-03-16T14:30:00Z",
  },
]

export const mockAlbumDetails: AlbumDetail[] = mockAlbums.map((album) => ({
  ...album,
  artist: mockArtists.find((a) => a.id === album.primaryArtistId) || mockArtists[0],
  streamingLinks: {
    spotify: {
      id: `spotify_${album.id}`,
      url: `https://open.spotify.com/album/${album.id}`,
    },
    appleMusic: {
      url: `https://music.apple.com/album/${album.id}`,
    },
    bandcamp: {
      url: `https://bandcamp.com/album/${album.id}`,
    },
  },
  purchaseLinks: {
    bandcamp: `https://bandcamp.com/album/${album.id}`,
    roughTrade: `https://roughtrade.com/album/${album.id}`,
    amazon: `https://amazon.com/dp/${album.id}`,
  },
  recommendationBlurb: `A ${album.genres[0].toLowerCase()} masterpiece that showcases innovative songwriting and production. Critics praise its emotional depth and sonic experimentation, making it essential listening for fans of contemporary music.`,
  reviews: mockReviews.filter((r) => r.albumId === album.id),
}))
