import { Album } from '../types'

export interface AllMusicAlbumInfo {
  title: string
  artist: string
  label: string
  genres: string[]
  description: string
  reviewer: string
  isEditorsChoice: boolean
  releaseDate?: string
  coverUrl?: string
}

export interface EnhancedAlbum extends Album {
  allMusicInfo?: AllMusicAlbumInfo
}

// AllMusic album information from the page
export const allMusicAlbums2025: AllMusicAlbumInfo[] = [
  {
    title: 'Straight Line Was a Lie',
    artist: 'The Beths',
    label: 'Anti-',
    genres: ['Pop/Rock'],
    description: 'With Elizabeth Stokes turning to self-help writing practice to conquer creative blocks, the hooky indie rockers\' fourth LP is their most personal yet.',
    reviewer: 'Marcy Donelson',
    isEditorsChoice: true
  },
  {
    title: 'Essex Honey',
    artist: 'Blood Orange',
    label: 'RCA',
    genres: ['Pop/Rock', 'R&B'],
    description: 'Devonté Hynes breaks from film scores and classical compositions to deliver a soul-stirring fifth album under his main alias.',
    reviewer: 'Andy Kellman',
    isEditorsChoice: true
  },
  {
    title: 'The Hives Forever Forever the Hives',
    artist: 'The Hives',
    label: 'PIAS',
    genres: ['Pop/Rock'],
    description: 'The band\'s seventh album is a potent distillation of their sharp wit and steamrolling energy.',
    reviewer: 'Heather Phares',
    isEditorsChoice: true
  },
  {
    title: 'Ego Death at a Bachelorette Party',
    artist: 'Hayley Williams',
    label: 'Unknown',
    genres: ['Pop/Rock'],
    description: 'The Paramore singer lets go of the past and moves forward on her artful, introspective third solo album.',
    reviewer: 'Matt Collar',
    isEditorsChoice: false
  },
  {
    title: 'Once Upon a Time In California',
    artist: 'Belinda Carlisle',
    label: 'Edsel',
    genres: ['Pop/Rock'],
    description: 'The Go-Go\'s frontwoman turned pop chanteuse covers ten glossy pop nuggets of the \'60s and \'70s in sincere, skillful style.',
    reviewer: 'Mark Deming',
    isEditorsChoice: false
  },
  {
    title: 'Airline Highway',
    artist: 'Rodney Crowell',
    label: 'New West',
    genres: ['Pop/Rock', 'Country'],
    description: 'The great singer/songwriter rocks a bit and passes along plenty of wisdom on this LP produced by Tyler Bryant.',
    reviewer: 'Mark Deming',
    isEditorsChoice: false
  },
  {
    title: 'Rwanda Sings with Strings',
    artist: 'The Good Ones',
    label: 'Glitterbeat',
    genres: ['International'],
    description: 'The Rwandan folk duo are complemented by two string players on this poignant and spontaneous album.',
    reviewer: 'Timothy Monger',
    isEditorsChoice: true
  },
  {
    title: 'Time and Patience',
    artist: 'Tift Merritt',
    label: 'One Riot Records',
    genres: ['Country', 'Pop/Rock', 'Folk'],
    description: 'The gifted singer/songwriter gives fans a glimpse of her archives, including five acoustic demos of songs from Tambourine.',
    reviewer: 'Mark Deming',
    isEditorsChoice: false
  },
  {
    title: 'Pareidolia',
    artist: 'Eiko Ishibashi / Jim O\'Rourke',
    label: 'Drag City',
    genres: ['Avant-Garde', 'Electronic'],
    description: 'Bewildering collaboration pieced together from improvised sets during the pair\'s first tour outside of Japan.',
    reviewer: 'Paul Simpson',
    isEditorsChoice: true
  },
  {
    title: 'Joe Meek: A Curious Mind Outer Space! Horror! Death Discs! The Wild West! Demos!',
    artist: 'Various Artists',
    label: 'Cherry Red',
    genres: ['Pop/Rock'],
    description: 'More tea chest finds that joyfully show off some of Meek\'s obsessions while giving fans a full disc of I Hear a New World rarities.',
    reviewer: 'Tim Sendra',
    isEditorsChoice: false
  },
  {
    title: 'Aurora',
    artist: 'Lathe of Heaven',
    label: 'Sacred Bones',
    genres: ['Pop/Rock'],
    description: 'On their second album, the Brooklyn band let a little (just a little) melodic romanticism seep into their dingy, fervent post-punk.',
    reviewer: 'Marcy Donelson',
    isEditorsChoice: false
  },
  {
    title: 'Hotel Pupik',
    artist: 'Led Bib',
    label: 'Cuneiform Records',
    genres: ['Pop/Rock', 'Jazz'],
    description: 'After a six-year recording hiatus, the British ensemble returns to work their mysterious musical magic as a slimmed-down quartet.',
    reviewer: 'Thom Jurek',
    isEditorsChoice: true
  },
  {
    title: 'Wao',
    artist: 'Nicholas Krgovich / Joseph Shabason / Tenniscoats',
    label: 'Western Vinyl Records',
    genres: ['Pop/Rock'],
    description: 'A fascinating and moving collection of fragile songs that are the result of an improvised collaboration between Tenniscoats, Joseph Shabason, and Nicholas Krgovich.',
    reviewer: 'Tim Sendra',
    isEditorsChoice: true
  },
  {
    title: 'Mind Explosion',
    artist: 'Shakti',
    label: 'Abstract Logix',
    genres: ['International', 'Jazz'],
    description: 'This document drawn from the ensemble\'s 50th anniversary tour is also a memorial for Zakir Hussain, and the band\'s final chapter.',
    reviewer: 'Thom Jurek',
    isEditorsChoice: false
  },
  {
    title: 'Shostakovich: Preludes & Fugues Op. 87',
    artist: 'Yulianna Avdeeva',
    label: 'PentaTone Classics',
    genres: ['Classical'],
    description: 'Romantic, spontaneous-seeming Shostakovich preludes and fugues, with dramatic contrasts.',
    reviewer: 'James Manheim',
    isEditorsChoice: false
  },
  {
    title: 'György Kurtág: Kafka Fragments',
    artist: 'Susan Narucki / Curtis Macomber',
    label: 'Avie',
    genres: ['Classical'],
    description: 'Fine performance of Kurtág\'s little Kafka settings captures not only the compressed yet expressive language but the shifting relationship between the instruments.',
    reviewer: 'James Manheim',
    isEditorsChoice: false
  },
  {
    title: 'A Prayer for Deliverance',
    artist: 'Tenebrae / Nigel Short',
    label: 'Signum Classics',
    genres: ['Classical'],
    description: 'An unusually strong set of modern musical prayers, centered on Herbert Howells\' Requiem and the pandemic-inspired title piece.',
    reviewer: 'James Manheim',
    isEditorsChoice: false
  },
  {
    title: '26 Little Deaths',
    artist: 'Carla Kihlstedt / Present Music',
    label: 'Cantaloupe',
    genres: ['Vocal', 'Classical'],
    description: 'A varied musical palette serves a song cycle inspired by -- and expanding upon -- cartoonist Edward Gorey\'s book The Gashlycrumb Tinies.',
    reviewer: 'James Manheim',
    isEditorsChoice: false
  },
  {
    title: 'Ravels: Quatuor à cordes; Ma mère l\'oye; Les danses de Ravel',
    artist: 'Quatuor Debussy / Franck Tortiller',
    label: 'Harmonia Mundi',
    genres: ['Classical'],
    description: 'Multiple "Ravels" with greater or lesser distance from the original works.',
    reviewer: 'James Manheim',
    isEditorsChoice: false
  },
  {
    title: 'Silvestrov: Symphony No. 8; Violin Concerto',
    artist: 'Christopher Lyndon-Gee / Janusz Wawrowski',
    label: 'Naxos',
    genres: ['Classical'],
    description: 'World premiere recordings of important works by Silvestrov, seeming very much of the moment.',
    reviewer: 'James Manheim',
    isEditorsChoice: false
  }
]

// Albums that exist in our scraping data with enhanced information
export const enhancedScrapingAlbums: EnhancedAlbum[] = [
  {
    id: 'the-beths-straight-line-was-a-lie',
    releaseGroupId: 'rg_the_beths_2025',
    title: 'Straight Line Was a Lie',
    primaryArtistId: 'artist_the_beths',
    artistCredit: 'The Beths',
    label: 'Anti-',
    releaseDate: '2025-08-29',
    regions: ['US'],
    genres: ['Pop/Rock', 'Indie Rock'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/indie-rock-album-cover.png',
    weeklyScore: 85.0,
    sourceTags: ['Pitchfork', 'AllMusic'],
    sourceCount: 2,
    badges: [],
    allMusicInfo: allMusicAlbums2025[0]
  },
  {
    id: 'blood-orange-essex-honey',
    releaseGroupId: 'rg_blood_orange_2025',
    title: 'Essex Honey',
    primaryArtistId: 'artist_blood_orange',
    artistCredit: 'Blood Orange',
    label: 'RCA',
    releaseDate: '2025-08-29',
    regions: ['US', 'UK'],
    genres: ['Pop/Rock', 'R&B', 'Alternative R&B'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/pop-album-cover.png',
    weeklyScore: 87.5,
    sourceTags: ['Pitchfork', 'AllMusic'],
    sourceCount: 2,
    badges: [],
    allMusicInfo: allMusicAlbums2025[1]
  },
  {
    id: 'the-hives-forever-forever-the-hives',
    releaseGroupId: 'rg_the_hives_2025',
    title: 'The Hives Forever Forever the Hives',
    primaryArtistId: 'artist_the_hives',
    artistCredit: 'The Hives',
    label: 'PIAS',
    releaseDate: '2025-08-29',
    regions: ['SE', 'US', 'UK'],
    genres: ['Pop/Rock', 'Garage Rock'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/garage-rock-album-cover.png',
    weeklyScore: 83.0,
    sourceTags: ['Pitchfork', 'AllMusic'],
    sourceCount: 2,
    badges: [],
    allMusicInfo: allMusicAlbums2025[2]
  },
  {
    id: 'belinda-carlisle-once-upon-a-time-in-california',
    releaseGroupId: 'rg_belinda_carlisle_2025',
    title: 'Once Upon a Time In California',
    primaryArtistId: 'artist_belinda_carlisle',
    artistCredit: 'Belinda Carlisle',
    label: 'Edsel',
    releaseDate: '2025-08-29',
    regions: ['US', 'UK'],
    genres: ['Pop/Rock', 'Pop'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/pop-album-cover.png',
    weeklyScore: 78.0,
    sourceTags: ['Pitchfork', 'AllMusic'],
    sourceCount: 2,
    badges: [],
    allMusicInfo: allMusicAlbums2025[4]
  }
]

// Albums that don't exist in our scraping data but are from AllMusic
export const newAllMusicAlbums: EnhancedAlbum[] = [
  {
    id: 'hayley-williams-ego-death-bachelorette',
    releaseGroupId: 'rg_hayley_williams_2025',
    title: 'Ego Death at a Bachelorette Party',
    primaryArtistId: 'artist_hayley_williams',
    artistCredit: 'Hayley Williams',
    label: 'Unknown',
    releaseDate: '2025-08-29',
    regions: ['US'],
    genres: ['Pop/Rock', 'Alternative Rock'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/indie-rock-album-cover.png',
    weeklyScore: 82.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[3]
  },
  {
    id: 'rodney-crowell-airline-highway',
    releaseGroupId: 'rg_rodney_crowell_2025',
    title: 'Airline Highway',
    primaryArtistId: 'artist_rodney_crowell',
    artistCredit: 'Rodney Crowell',
    label: 'New West',
    releaseDate: '2025-08-29',
    regions: ['US'],
    genres: ['Pop/Rock', 'Country', 'Americana'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/folk-album-cover.png',
    weeklyScore: 79.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[5]
  },
  {
    id: 'the-good-ones-rwanda-sings-strings',
    releaseGroupId: 'rg_the_good_ones_2025',
    title: 'Rwanda Sings with Strings',
    primaryArtistId: 'artist_the_good_ones',
    artistCredit: 'The Good Ones',
    label: 'Glitterbeat',
    releaseDate: '2025-08-29',
    regions: ['RW', 'DE'],
    genres: ['International', 'Folk', 'World Music'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/international-album-cover.png',
    weeklyScore: 86.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[6]
  },
  {
    id: 'tift-merritt-time-and-patience',
    releaseGroupId: 'rg_tift_merritt_2025',
    title: 'Time and Patience',
    primaryArtistId: 'artist_tift_merritt',
    artistCredit: 'Tift Merritt',
    label: 'One Riot Records',
    releaseDate: '2025-08-29',
    regions: ['US'],
    genres: ['Country', 'Pop/Rock', 'Folk', 'Americana'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/folk-album-cover.png',
    weeklyScore: 80.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[7]
  },
  {
    id: 'eiko-ishibashi-jim-orourke-pareidolia',
    releaseGroupId: 'rg_eiko_ishibashi_jim_orourke_2025',
    title: 'Pareidolia',
    primaryArtistId: 'artist_eiko_ishibashi_jim_orourke',
    artistCredit: 'Eiko Ishibashi / Jim O\'Rourke',
    label: 'Drag City',
    releaseDate: '2025-08-29',
    regions: ['JP', 'US'],
    genres: ['Avant-Garde', 'Electronic', 'Experimental'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/experimental-album-cover.png',
    weeklyScore: 88.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[8]
  },
  {
    id: 'various-artists-joe-meek-curious-mind',
    releaseGroupId: 'rg_various_artists_joe_meek_2025',
    title: 'Joe Meek: A Curious Mind Outer Space! Horror! Death Discs! The Wild West! Demos!',
    primaryArtistId: 'artist_various_artists',
    artistCredit: 'Various Artists',
    label: 'Cherry Red',
    releaseDate: '2025-08-29',
    regions: ['UK'],
    genres: ['Pop/Rock', 'Compilation'],
    isReissue: true,
    primaryType: 'Album',
    coverUrl: '/placeholder.svg',
    weeklyScore: 75.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[9]
  },
  {
    id: 'lathe-of-heaven-aurora',
    releaseGroupId: 'rg_lathe_of_heaven_2025',
    title: 'Aurora',
    primaryArtistId: 'artist_lathe_of_heaven',
    artistCredit: 'Lathe of Heaven',
    label: 'Sacred Bones',
    releaseDate: '2025-08-29',
    regions: ['US'],
    genres: ['Pop/Rock', 'Post-Punk', 'Indie Rock'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/post-punk-album-cover.png',
    weeklyScore: 81.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[10]
  },
  {
    id: 'led-bib-hotel-pupik',
    releaseGroupId: 'rg_led_bib_2025',
    title: 'Hotel Pupik',
    primaryArtistId: 'artist_led_bib',
    artistCredit: 'Led Bib',
    label: 'Cuneiform Records',
    releaseDate: '2025-08-29',
    regions: ['UK'],
    genres: ['Pop/Rock', 'Jazz', 'Experimental Jazz'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/jazz-album-cover.png',
    weeklyScore: 84.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[11]
  },
  {
    id: 'nicholas-krgovich-joseph-shabason-tenniscoats-wao',
    releaseGroupId: 'rg_nicholas_krgovich_joseph_shabason_tenniscoats_2025',
    title: 'Wao',
    primaryArtistId: 'artist_nicholas_krgovich_joseph_shabason_tenniscoats',
    artistCredit: 'Nicholas Krgovich / Joseph Shabason / Tenniscoats',
    label: 'Western Vinyl Records',
    releaseDate: '2025-08-29',
    regions: ['US', 'JP'],
    genres: ['Pop/Rock', 'Indie Rock', 'Experimental'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/indie-rock-album-cover.png',
    weeklyScore: 85.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[12]
  },
  {
    id: 'shakti-mind-explosion',
    releaseGroupId: 'rg_shakti_2025',
    title: 'Mind Explosion',
    primaryArtistId: 'artist_shakti',
    artistCredit: 'Shakti',
    label: 'Abstract Logix',
    releaseDate: '2025-08-29',
    regions: ['IN', 'US'],
    genres: ['International', 'Jazz', 'World Fusion'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/jazz-album-cover.png',
    weeklyScore: 83.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[13]
  }
]

// Classical albums (separated for easier management)
export const classicalAlbums: EnhancedAlbum[] = [
  {
    id: 'yulianna-avdeeva-shostakovich-preludes-fugues',
    releaseGroupId: 'rg_yulianna_avdeeva_2025',
    title: 'Shostakovich: Preludes & Fugues Op. 87',
    primaryArtistId: 'artist_yulianna_avdeeva',
    artistCredit: 'Yulianna Avdeeva',
    label: 'PentaTone Classics',
    releaseDate: '2025-08-29',
    regions: ['RU', 'NL'],
    genres: ['Classical', 'Piano'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/classical-album-cover.png',
    weeklyScore: 82.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[14]
  },
  {
    id: 'susan-narucki-curtis-macomber-kurtag-kafka-fragments',
    releaseGroupId: 'rg_susan_narucki_curtis_macomber_2025',
    title: 'György Kurtág: Kafka Fragments',
    primaryArtistId: 'artist_susan_narucki_curtis_macomber',
    artistCredit: 'Susan Narucki / Curtis Macomber',
    label: 'Avie',
    releaseDate: '2025-08-29',
    regions: ['US'],
    genres: ['Classical', 'Chamber Music'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/classical-album-cover.png',
    weeklyScore: 80.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[15]
  },
  {
    id: 'tenebrae-nigel-short-prayer-deliverance',
    releaseGroupId: 'rg_tenebrae_nigel_short_2025',
    title: 'A Prayer for Deliverance',
    primaryArtistId: 'artist_tenebrae_nigel_short',
    artistCredit: 'Tenebrae / Nigel Short',
    label: 'Signum Classics',
    releaseDate: '2025-08-29',
    regions: ['UK'],
    genres: ['Classical', 'Choral'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/classical-album-cover.png',
    weeklyScore: 79.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[16]
  },
  {
    id: 'carla-kihlstedt-present-music-26-little-deaths',
    releaseGroupId: 'rg_carla_kihlstedt_present_music_2025',
    title: '26 Little Deaths',
    primaryArtistId: 'artist_carla_kihlstedt_present_music',
    artistCredit: 'Carla Kihlstedt / Present Music',
    label: 'Cantaloupe',
    releaseDate: '2025-08-29',
    regions: ['US'],
    genres: ['Vocal', 'Classical', 'Contemporary Classical'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/classical-album-cover.png',
    weeklyScore: 81.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[17]
  },
  {
    id: 'quatuor-debussy-franck-tortiller-ravels',
    releaseGroupId: 'rg_quatuor_debussy_franck_tortiller_2025',
    title: 'Ravels: Quatuor à cordes; Ma mère l\'oye; Les danses de Ravel',
    primaryArtistId: 'artist_quatuor_debussy_franck_tortiller',
    artistCredit: 'Quatuor Debussy / Franck Tortiller',
    label: 'Harmonia Mundi',
    releaseDate: '2025-08-29',
    regions: ['FR'],
    genres: ['Classical', 'Chamber Music'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/classical-album-cover.png',
    weeklyScore: 78.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[18]
  },
  {
    id: 'christopher-lyndon-gee-janusz-wawrowski-silvestrov',
    releaseGroupId: 'rg_christopher_lyndon_gee_janusz_wawrowski_2025',
    title: 'Silvestrov: Symphony No. 8; Violin Concerto',
    primaryArtistId: 'artist_christopher_lyndon_gee_janusz_wawrowski',
    artistCredit: 'Christopher Lyndon-Gee / Janusz Wawrowski',
    label: 'Naxos',
    releaseDate: '2025-08-29',
    regions: ['PL', 'GB'],
    genres: ['Classical', 'Orchestral'],
    isReissue: false,
    primaryType: 'Album',
    coverUrl: '/classical-album-cover.png',
    weeklyScore: 77.0,
    sourceTags: ['AllMusic'],
    sourceCount: 1,
    badges: [],
    allMusicInfo: allMusicAlbums2025[19]
  }
]

// Combine all albums
export const allAllMusicAlbums2025: EnhancedAlbum[] = [
  ...enhancedScrapingAlbums,
  ...newAllMusicAlbums,
  ...classicalAlbums
]

// Helper function to find album by title and artist
export function findAlbumByTitleAndArtist(title: string, artist: string): EnhancedAlbum | undefined {
  return allAllMusicAlbums2025.find(album => 
    album.title.toLowerCase() === title.toLowerCase() && 
    album.artistCredit.toLowerCase() === artist.toLowerCase()
  )
}

// Helper function to get all albums with AllMusic information
export function getAlbumsWithAllMusicInfo(): EnhancedAlbum[] {
  return allAllMusicAlbums2025.filter(album => album.allMusicInfo)
}

// Helper function to get editors choice albums
export function getEditorsChoiceAlbums(): EnhancedAlbum[] {
  return allAllMusicAlbums2025.filter(album => album.allMusicInfo?.isEditorsChoice)
}
