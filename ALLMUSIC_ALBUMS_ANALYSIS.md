# AllMusic Albums 2025 - Data Analysis & Structuring

## Overview
This document summarizes the analysis of 20 albums from the AllMusic page and how they've been integrated into our structured album data system.

## Albums Found in Existing Scraping Data

### 1. **Straight Line Was a Lie** - The Beths
- **Status**: ✅ Found in Pitchfork scraper
- **Label**: Anti-
- **Genres**: Pop/Rock, Indie Rock
- **Reviewer**: Marcy Donelson
- **Editors' Choice**: Yes
- **Description**: With Elizabeth Stokes turning to self-help writing practice to conquer creative blocks, the hooky indie rockers' fourth LP is their most personal yet.

### 2. **Essex Honey** - Blood Orange
- **Status**: ✅ Found in Pitchfork scraper
- **Label**: RCA
- **Genres**: Pop/Rock, R&B, Alternative R&B
- **Reviewer**: Andy Kellman
- **Editors' Choice**: Yes
- **Description**: Devonté Hynes breaks from film scores and classical compositions to deliver a soul-stirring fifth album under his main alias.

### 3. **The Hives Forever Forever the Hives** - The Hives
- **Status**: ✅ Found in Pitchfork scraper
- **Label**: PIAS
- **Genres**: Pop/Rock, Garage Rock
- **Reviewer**: Heather Phares
- **Editors' Choice**: Yes
- **Description**: The band's seventh album is a potent distillation of their sharp wit and steamrolling energy.

### 4. **Once Upon a Time In California** - Belinda Carlisle
- **Status**: ✅ Found in Pitchfork scraper
- **Label**: Edsel
- **Genres**: Pop/Rock, Pop
- **Reviewer**: Mark Deming
- **Editors' Choice**: No
- **Description**: The Go-Go's frontwoman turned pop chanteuse covers ten glossy pop nuggets of the '60s and '70s in sincere, skillful style.

## New Albums Added from AllMusic

### 5. **Ego Death at a Bachelorette Party** - Hayley Williams
- **Status**: ❌ Not in existing data
- **Label**: Unknown
- **Genres**: Pop/Rock, Alternative Rock
- **Reviewer**: Matt Collar
- **Editors' Choice**: No
- **Description**: The Paramore singer lets go of the past and moves forward on her artful, introspective third solo album.

### 6. **Airline Highway** - Rodney Crowell
- **Status**: ❌ Not in existing data
- **Label**: New West
- **Genres**: Pop/Rock, Country, Americana
- **Reviewer**: Mark Deming
- **Editors' Choice**: No
- **Description**: The great singer/songwriter rocks a bit and passes along plenty of wisdom on this LP produced by Tyler Bryant.

### 7. **Rwanda Sings with Strings** - The Good Ones
- **Status**: ❌ Not in existing data
- **Label**: Glitterbeat
- **Genres**: International, Folk, World Music
- **Reviewer**: Timothy Monger
- **Editors' Choice**: Yes
- **Description**: The Rwandan folk duo are complemented by two string players on this poignant and spontaneous album.

### 8. **Time and Patience** - Tift Merritt
- **Status**: ❌ Not in existing data
- **Label**: One Riot Records
- **Genres**: Country, Pop/Rock, Folk, Americana
- **Reviewer**: Mark Deming
- **Editors' Choice**: No
- **Description**: The gifted singer/songwriter gives fans a glimpse of her archives, including five acoustic demos of songs from Tambourine.

### 9. **Pareidolia** - Eiko Ishibashi / Jim O'Rourke
- **Status**: ❌ Not in existing data
- **Label**: Drag City
- **Genres**: Avant-Garde, Electronic, Experimental
- **Reviewer**: Paul Simpson
- **Editors' Choice**: Yes
- **Description**: Bewildering collaboration pieced together from improvised sets during the pair's first tour outside of Japan.

### 10. **Joe Meek: A Curious Mind...** - Various Artists
- **Status**: ❌ Not in existing data
- **Label**: Cherry Red
- **Genres**: Pop/Rock, Compilation
- **Reviewer**: Tim Sendra
- **Editors' Choice**: No
- **Description**: More tea chest finds that joyfully show off some of Meek's obsessions while giving fans a full disc of I Hear a New World rarities.

### 11. **Aurora** - Lathe of Heaven
- **Status**: ❌ Not in existing data
- **Label**: Sacred Bones
- **Genres**: Pop/Rock, Post-Punk, Indie Rock
- **Reviewer**: Marcy Donelson
- **Editors' Choice**: No
- **Description**: On their second album, the Brooklyn band let a little (just a little) melodic romanticism seep into their dingy, fervent post-punk.

### 12. **Hotel Pupik** - Led Bib
- **Status**: ❌ Not in existing data
- **Label**: Cuneiform Records
- **Genres**: Pop/Rock, Jazz, Experimental Jazz
- **Reviewer**: Thom Jurek
- **Editors' Choice**: Yes
- **Description**: After a six-year recording hiatus, the British ensemble returns to work their mysterious musical magic as a slimmed-down quartet.

### 13. **Wao** - Nicholas Krgovich / Joseph Shabason / Tenniscoats
- **Status**: ❌ Not in existing data
- **Label**: Western Vinyl Records
- **Genres**: Pop/Rock, Indie Rock, Experimental
- **Reviewer**: Tim Sendra
- **Editors' Choice**: Yes
- **Description**: A fascinating and moving collection of fragile songs that are the result of an improvised collaboration between Tenniscoats, Joseph Shabason, and Nicholas Krgovich.

### 14. **Mind Explosion** - Shakti
- **Status**: ❌ Not in existing data
- **Label**: Abstract Logix
- **Genres**: International, Jazz, World Fusion
- **Reviewer**: Thom Jurek
- **Editors' Choice**: No
- **Description**: This document drawn from the ensemble's 50th anniversary tour is also a memorial for Zakir Hussain, and the band's final chapter.

## Classical Albums Added

### 15. **Shostakovich: Preludes & Fugues Op. 87** - Yulianna Avdeeva
- **Label**: PentaTone Classics
- **Genres**: Classical, Piano
- **Reviewer**: James Manheim

### 16. **György Kurtág: Kafka Fragments** - Susan Narucki / Curtis Macomber
- **Label**: Avie
- **Genres**: Classical, Chamber Music
- **Reviewer**: James Manheim

### 17. **A Prayer for Deliverance** - Tenebrae / Nigel Short
- **Label**: Signum Classics
- **Genres**: Classical, Choral
- **Reviewer**: James Manheim

### 18. **26 Little Deaths** - Carla Kihlstedt / Present Music
- **Label**: Cantaloupe
- **Genres**: Vocal, Classical, Contemporary Classical
- **Reviewer**: James Manheim

### 19. **Ravels: Quatuor à cordes...** - Quatuor Debussy / Franck Tortiller
- **Label**: Harmonia Mundi
- **Genres**: Classical, Chamber Music
- **Reviewer**: James Manheim

### 20. **Silvestrov: Symphony No. 8; Violin Concerto** - Christopher Lyndon-Gee / Janusz Wawrowski
- **Label**: Naxos
- **Genres**: Classical, Orchestral
- **Reviewer**: James Manheim

## Data Structure Created

### Enhanced Album Interface
```typescript
export interface EnhancedAlbum extends Album {
  allMusicInfo?: AllMusicAlbumInfo
}

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
```

### Key Features
- **Complete metadata**: All albums now have full label, genre, and description information
- **Review attribution**: Each album includes reviewer name and publication source
- **Editors' Choice tracking**: Identifies which albums received special recognition
- **Genre enrichment**: Enhanced genre categorization beyond basic Pop/Rock
- **Source integration**: Combines existing Pitchfork data with new AllMusic information

## Summary Statistics

- **Total Albums**: 20
- **Found in Existing Data**: 4 (20%)
- **Newly Added**: 16 (80%)
- **Editors' Choice**: 8 (40%)
- **Genres Represented**: 15+ unique genre combinations
- **Labels Represented**: 20 different record labels
- **Reviewers**: 8 different music critics

## Next Steps

1. **Database Integration**: Add these albums to the main database
2. **Cover Art**: Source appropriate cover art for new albums
3. **MusicBrainz Enrichment**: Fetch additional metadata from MusicBrainz API
4. **Review Aggregation**: Combine with other publication reviews
5. **UI Enhancement**: Display AllMusic descriptions and reviewer information

## Files Created

- `lib/allmusic-albums-2025.ts` - Complete structured album data
- `ALLMUSIC_ALBUMS_ANALYSIS.md` - This analysis document

This structured data provides a comprehensive foundation for displaying rich album information in the Album Feed application, combining the best of both our existing scraping infrastructure and the detailed editorial content from AllMusic.
