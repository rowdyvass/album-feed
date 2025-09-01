# MusicBrainz API Reference

## Overview
The MusicBrainz API is an interface to the MusicBrainz Database, aimed at developers of media players, CD rippers, taggers, and other applications requiring music metadata. The API's architecture follows REST design principles.

## Key Information
- **API Root URL**: `https://musicbrainz.org/ws/2/`
- **Rate Limiting**: **ONE call per second maximum**
- **User-Agent**: Required and must be meaningful
- **Formats**: XML (default) and JSON (`fmt=json`)

## Core Resources
The API provides 13 core entity resources:
- area, artist, event, genre, instrument, label, place, recording, release, release-group, series, work, url

## Request Types

### 1. Lookup
`/<ENTITY_TYPE>/<MBID>?inc=<INC>`
- Get detailed information about a specific entity by its MBID
- Example: `/release/12345678-1234-1234-1234-123456789012?inc=artist-credits+labels`

### 2. Browse
`/<RESULT_ENTITY_TYPE>?<BROWSING_ENTITY_TYPE>=<MBID>&limit=<LIMIT>&offset=<OFFSET>&inc=<INC>`
- Find entities connected to a particular entity
- Example: `/release?artist=12345678-1234-1234-1234-123456789012&limit=25`

### 3. Search
`/<ENTITY_TYPE>?query=<QUERY>&limit=<LIMIT>&offset=<OFFSET>`
- Search for entities matching a specific query
- **Note**: Only search is available without an MBID

## Important Notes
- **Browse and search are NOT implemented for genre entities**
- **Only search requests are available without an MBID**
- **For date-based queries, you need to use browse with release-group or other date-enabled entities**

## Release Resource
For getting weekly releases, we need to understand:
- Releases are linked to release-groups
- Release-groups have dates and can be browsed
- We can use the browse functionality to get releases by date ranges

## Rate Limiting Rules
- **Maximum**: 1 request per second
- **User-Agent**: Must be set to identify your application
- **Consequences**: Exceeding limits may result in IP blocking

## Example Queries
```bash
# Get releases by artist
GET /release?artist=12345678-1234-1234-1234-123456789012&limit=25

# Search for releases
GET /release?query=artist:Radiohead&limit=25

# Get release details with includes
GET /release/12345678-1234-1234-1234-123456789012?inc=artist-credits+labels+release-groups+media+tags
```

## Best Practices
1. Always set a meaningful User-Agent header
2. Respect the 1 request/second rate limit
3. Use browse functionality for related entity queries
4. Use search only when you don't have specific MBIDs
5. Implement proper error handling and retry logic

## Search API Details

### Search Parameters
- **type**: Selects the entity index to be searched (annotation, area, artist, cdstub, event, instrument, label, place, recording, release, release-group, series, tag, work, url)
- **fmt**: Results format (xml or json, defaults to xml)
- **query**: **Mandatory** Lucene search query
- **limit**: Number of entries to return (1-100, defaults to 25)
- **offset**: Starting offset for paging through results
- **dismax**: If "true", switches to dismax query parser for easier syntax (defaults to "false")
- **version**: MMD version (defaults to 2)

### Release Search Fields
Based on the [MusicBrainz API Search documentation](https://wiki.musicbrainz.org/MusicBrainz_API/Search), the release resource supports these search fields:

- **arid**: Artist MBID
- **artist**: Artist name
- **asin**: Amazon ASIN
- **barcode**: Barcode
- **catno**: Catalog number
- **comment**: Disambiguation comment
- **country**: Release country
- **creditname**: Artist credit name
- **date**: Release date
- **discids**: Number of disc IDs
- **discidsmedium**: Number of medium disc IDs
- **format**: Release format
- **laid**: Label MBID
- **label**: Label name
- **lang**: Language
- **mediums**: Number of mediums
- **primarytype**: Primary release type
- **puid**: PUID
- **quality**: Release quality
- **reid**: Release MBID
- **release**: Release title
- **releaseaccent**: Release title with diacritics
- **rgid**: Release group MBID
- **script**: Script
- **secondarytype**: Secondary release type
- **status**: Release status
- **tag**: Tag
- **tracks**: Number of tracks
- **tracksmedium**: Number of tracks per medium
- **type**: Release type

### Example Queries
```bash
# Search for releases by artist name
GET /release?query=artist:Radiohead&limit=25

# Search for releases with specific date
GET /release?query=date:2025-08-08&limit=25

# Search for releases by label
GET /release?query=label:XL+Recordings&limit=25

# Search for releases with specific format
GET /release?query=format:CD&limit=25

# Search for releases with tags
GET /release?query=tag:rock&limit=25

# Complex query combining multiple fields
GET /release?query=artist:Radiohead+AND+date:2025&limit=25
```

## Documentation Links
- [Main API Documentation](https://musicbrainz.org/doc/MusicBrainz_API)
- [Search API Documentation](https://wiki.musicbrainz.org/MusicBrainz_API/Search)
- [Rate Limiting Details](https://musicbrainz.org/doc/XML_Web_Service/Rate_Limiting)
- [API Examples](https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/Examples)
