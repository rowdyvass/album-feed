# MusicBrainz API Integration

## Overview
This document outlines the integration of the MusicBrainz API into the SpinGrid application, providing real music data instead of mock data.

## Architecture

### 1. Service Layer (`lib/musicbrainz.ts`)
- **MusicBrainzService**: Main service class for interacting with MusicBrainz API
- **Cover Art Archive**: Integration for fetching album cover art
- **Rate Limiting**: Respects MusicBrainz's 1 request/second limit
- **Error Handling**: Comprehensive error handling and logging

### 2. API Routes
- **`/api/feed`**: Main album feed with curated Pitchfork releases
- **`/api/albums/[id]`**: Individual album details
- **`/api/search`**: Search functionality

### 3. Cover Art Service
- **Multi-Source Fallback**: Tries multiple APIs to find album artwork
- **Priority Order**: Cover Art Archive → Last.fm → iTunes → Spotify → Placeholder
- **Reliability**: Ensures every album has visual representation
- **Performance**: Caches results and handles failures gracefully

### 4. Frontend Integration
- **`useFeed` Hook**: Custom React hook for data fetching and pagination
- **Unified Feed**: Single curated feed from Pitchfork + MusicBrainz enrichment
- **Real-time Updates**: Automatic refresh when filters or sorting changes

## Feed Architecture

### Primary Source: Pitchfork Reviews
- **Source**: Scrapes recent album releases from [Pitchfork Reviews](https://pitchfork.com/reviews/albums/)
- **Data Quality**: Uses Pitchfork's expert genre classification and confirmed release dates
- **Curated Selection**: Only albums reviewed by Pitchfork's music critics are included
- **Release Dates**: Confirmed publication dates from review publication

### Data Enrichment: MusicBrainz + Cover Art Service
- **Metadata**: Fetches additional album information from MusicBrainz
- **Cover Art**: Multi-source cover art retrieval with fallbacks
- **Labels & Artists**: Gets detailed label and artist information
- **Release Types**: Identifies albums vs. EPs, reissues, etc.

## Key Features

### Genre Population
- **MusicBrainz**: Extracts genres from release tags and release-group tags
- **Pitchfork**: Uses expert genre classification from music critics
- **Fallback**: Graceful degradation when genre data is unavailable

### Date Handling
- **MusicBrainz**: Handles various date formats (full dates, year-only, null dates)
- **Pitchfork**: Provides confirmed release dates from review publication
- **Filtering**: Smart date range filtering with fallback strategies

### Cover Art
- **Multi-Source System**: Tries multiple APIs to find album artwork
- **Primary**: Cover Art Archive (MusicBrainz)
- **Fallback 1**: Last.fm API (free tier, good coverage)
- **Fallback 2**: iTunes/Apple Music API (free, high quality)
- **Fallback 3**: Spotify API (if credentials configured)
- **Final Fallback**: Custom placeholder with album info
- **Reliability**: 100% cover art coverage for all albums

## API Endpoints

### `/api/feed`
```typescript
// Query Parameters
{
  limit?: number,           // Number of albums to return
  week?: string,           // Target week (YYYY-MM-DD)
  genres?: string[],       // Filter by genres
  regions?: string[],      // Filter by regions
  format?: ('Album' | 'EP')[], // Filter by format
  excludeReissues?: boolean // Exclude reissues
}
```



## Data Flow

### Unified Pitchfork + MusicBrainz Flow
1. **Release Discovery**: Scrape recent album releases from Pitchfork reviews
2. **Data Enrichment**: Search each Pitchfork release in MusicBrainz for metadata
3. **Data Combination**: Merge Pitchfork's expert curation with MusicBrainz's comprehensive data
4. **Cover Art**: Multi-source cover art retrieval with automatic fallbacks
5. **Filtering & Sorting**: Apply user filters and sort by weekly score
6. **Response**: Return curated album list with enriched metadata and guaranteed cover art

## Rate Limiting Strategy

### MusicBrainz API
- **Limit**: 1 request per second
- **Implementation**: Built-in delay between requests
- **Batching**: Process multiple releases in single requests when possible

### Cover Art Archive
- **Limit**: No strict limit, but network timeouts handled
- **Implementation**: Concurrent requests with error handling

### Multi-Source Cover Art
- **Priority System**: Tries sources in order of reliability and quality
- **Rate Limiting**: Respects individual API limits for each source
- **Error Handling**: Graceful fallback to next source on failure
- **Performance**: Parallel requests where possible, sequential fallbacks
- **Fallback**: Graceful degradation when cover art unavailable

## Error Handling

### Network Errors
- **Timeout Handling**: 30-second timeout for API requests
- **Retry Logic**: Automatic retry for transient failures
- **Fallback Data**: Use available data when some sources fail

### Data Validation
- **Null Checks**: Comprehensive null/undefined handling
- **Type Safety**: TypeScript interfaces for data validation
- **Default Values**: Sensible defaults for missing data

## Performance Optimizations

### Caching Strategy
- **Request Batching**: Group multiple API calls when possible
- **Concurrent Processing**: Process releases in parallel where safe
- **Rate Limiting**: Respect API limits while maximizing throughput

### Memory Management
- **Pagination**: Load albums in chunks to manage memory
- **Cleanup**: Proper cleanup of resources and event listeners
- **Efficient Rendering**: React optimization for large album lists

## Search API Details

### MusicBrainz Search Endpoint
- **URL**: `https://musicbrainz.org/ws/2/release`
- **Method**: GET with query parameters
- **Response Format**: JSON
- **Rate Limit**: 1 request per second

### Query Syntax
```typescript
// Basic search
query: `title:"${title}" AND artist:"${artist}"`

// Date range search
query: `date:[${startDate} TO ${endDate}]`

// Include additional data
inc: 'artist-credits+labels+release-groups+media+tags'
```

### Date Search Behavior
- **Partial Matching**: `date:2025-08-29` can return releases with `date:2025` or `date:2025-08`
- **Range Queries**: `date:[2025-08-22 TO 2025-08-29]` returns releases in date range
- **Filtering**: Post-query filtering for exact date matches

## Implementation Success

### Genre Population Fixed ✅
- **Issue**: Genres not appearing on album hover
- **Root Cause**: Missing `tags` in `inc` parameter and overly restrictive filtering
- **Solution**: 
  1. Added `inc: 'artist-credits+labels+release-groups+media+tags'`
  2. Check both `release.tags` and `release['release-group'].tags`
  3. Relaxed tag count filter from `count > 1` to `count >= 1`
  4. Include releases with `date:2025` (often have tags)

### Date Precision Improved ✅
- **Issue**: Missing releases from specific dates (e.g., 2025-08-29)
- **Root Cause**: MusicBrainz's partial date matching behavior
- **Solution**: Hybrid approach with date range search + in-code filtering

### Cover Art Integration ✅
- **Cover Art Archive**: Successfully fetching album artwork
- **Fallback Handling**: Graceful degradation when cover art unavailable
- **Performance**: Concurrent requests with proper error handling

## Future Enhancements

### Phase 3: Enhanced Curation
- **Multiple Sources**: Integrate additional music review sites
- **User Preferences**: Allow users to customize feed sources
- **Smart Filtering**: AI-powered genre and mood classification

### Phase 4: Streaming Integration
- **Platform APIs**: Direct integration with Spotify, Apple Music
- **Availability**: Show which platforms have each album
- **Deep Linking**: Direct links to streaming platforms

### Phase 5: Community Features
- **User Reviews**: Allow users to rate and review albums
- **Recommendations**: Personalized album suggestions
- **Social Features**: Share and discover music with friends

## Troubleshooting

### Common Issues

#### No Albums Found
- **Check**: MusicBrainz API status and rate limiting
- **Verify**: Date range and search parameters
- **Debug**: Check server logs for API errors

#### Missing Genres
- **Check**: `inc` parameter includes `tags`
- **Verify**: Tag count filtering not too restrictive
- **Debug**: Log tag data in `convertToAlbum`

#### Cover Art Errors
- **Check**: Cover Art Archive availability
- **Verify**: Network connectivity and timeouts
- **Debug**: Error handling in `getCoverArt`

### Debug Commands
```bash
# Test MusicBrainz API directly
curl -H "User-Agent: SpinGrid/1.0" "https://musicbrainz.org/ws/2/release?query=title:\"Album Title\"&fmt=json"

# Test curated feed
curl "http://localhost:3000/api/curated-feed?limit=5"

# Test main feed with curation
curl "http://localhost:3000/api/feed?curated=true&limit=5"
```

## Conclusion

The Pitchfork + MusicBrainz integration successfully provides:
- **Expert Curation**: Pitchfork's professional music critics determine which albums to feature
- **Rich Metadata**: MusicBrainz enriches each album with comprehensive information
- **Quality Assurance**: Only reviewed, high-quality releases are included
- **Performance**: Efficient API usage with proper rate limiting
- **Reliability**: Robust error handling and fallback strategies

The system now provides a curated, high-quality music discovery experience that combines the best of both worlds: Pitchfork's expert curation and MusicBrainz's comprehensive metadata.

