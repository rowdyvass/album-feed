---
product: SpinGrid
version: 1.0
status: planning
priority: high
team: music-discovery
tags: [music, discovery, curation, streaming]
---

# SpinGrid - Product Requirements Document

## Product Vision
An infinite, scrollable grid of album covers that updates continuously with the week's best releases across critics, record-store picks, and charts. A one-stop destination for music discovery that combines editorial curation with algorithmic ranking.

## User Stories

### Core User Journeys
- **As a music enthusiast**, I want to discover new albums through a visually appealing grid interface so I can find music I might have missed
- **As a busy music fan**, I want to see why an album is recommended in 30-45 words so I can quickly decide if it's worth my time
- **As a streaming user**, I want one-click access to add albums to my library so I can save discoveries for later
- **As a vinyl collector**, I want direct links to purchase physical copies so I can buy albums I discover

### Secondary Features
- **As a genre-focused listener**, I want to filter by genre so I can discover music in my preferred styles
- **As a completist**, I want to see an artist's previous releases and related projects so I can explore their catalog
- **As a tastemaker follower**, I want to see which albums have critical acclaim badges so I can trust the recommendations

## Requirements

### Functional Requirements

#### Core Feed Experience
- [ ] Infinite scrolling masonry grid of album covers
- [ ] Hover reveals album title and artist name
- [ ] Click opens detailed album drawer
- [ ] Filter by genre, week, region, format, label
- [ ] Sort by Weekly Score, Most Discussed, Highest Critic Score
- [ ] Exclude reissues option

#### Album Detail Drawer
- [ ] Streaming service links (Spotify, Apple Music, Tidal, Bandcamp)
- [ ] Physical purchase links (Bandcamp, Rough Trade, Amazon, Juno, Discogs)
- [ ] 30-45 word recommendation summary
- [ ] Badges (BNM, Year-End Lists, Store AOTM, Chart Top 10)
- [ ] Artist information with Wikipedia link and bio
- [ ] Previous releases and related projects

#### Data Integration
- [ ] Weekly release discovery from MusicBrainz
- [ ] Review aggregation from major music publications
- [ ] Chart data integration
- [ ] Record store pick aggregation
- [ ] Streaming service metadata enrichment

### Non-Functional Requirements
- [ ] Sub-second grid loading with virtualization
- [ ] Responsive design (mobile-first)
- [ ] 99.9% uptime for feed API
- [ ] Real-time updates for new releases
- [ ] GDPR/privacy compliance for user data

## Technical Architecture

### Data Model
\`\`\`typescript
interface Album {
  id: string;
  releaseGroupId: string;
  title: string;
  primaryArtistId: string;
  artistCredit: string;
  label: string;
  releaseDate: string;
  regions: string[];
  genres: string[];
  isReissue: boolean;
  primaryType: 'Album' | 'EP';
  coverUrl: string;
  weeklyScore: number;
}

interface Artist {
  id: string;
  name: string;
  wikidataId?: string;
  wikipediaUrl?: string;
  bioExcerpt: string;
  relatedArtistIds: string[];
}

interface Review {
  id: string;
  albumId: string;
  source: string;
  url: string;
  score100: number;
  tag?: 'BNM' | 'Editor';
  excerpt: string;
  publishedAt: string;
}
\`\`\`

### API Endpoints
- `GET /feed` - Paginated album grid with filters
- `GET /albums/:id` - Detailed album information
- `GET /search` - Search albums and artists
- `POST /albums/:id/add-to-library` - Add to streaming service

## Implementation Phases

### Phase 1: MVP Core (4-6 weeks)
**Goal**: Basic album discovery grid with static data

**Deliverables**:
- [ ] Album grid component with mock data
- [ ] Album detail drawer
- [ ] Basic filtering (genre, week)
- [ ] Responsive design
- [ ] Static streaming/purchase links

**Success Metrics**:
- Grid loads in <1 second
- Drawer opens smoothly
- Mobile experience is usable

### Phase 2: Data Integration (3-4 weeks) ✅ **COMPLETED**
**Goal**: Real music data and basic ranking

**Deliverables**:
- [x] MusicBrainz integration for releases
- [x] Cover art from Cover Art Archive
- [x] Pitchfork curated feed integration
- [x] Basic review aggregation (2-3 sources)
- [x] Simple weekly scoring algorithm
- [x] Database setup and API

**Success Metrics**:
- 100+ albums per week ingested
- Cover art success rate >90%
- API response time <200ms

### Phase 2.5: Enhanced Curation (1-2 weeks) ✅ **COMPLETED**
**Goal**: High-quality curated music feeds

**Deliverables**:
- [x] Pitchfork reviews integration
- [x] Unified feed system (Pitchfork curation + MusicBrainz enrichment)
- [x] Expert genre classification
- [x] Confirmed release dates
- [x] Simplified UI (no toggle needed)
- [x] Multi-source cover art service with fallbacks

**Success Metrics**:
- Curated feed loads in <15 seconds
- Genre accuracy from expert sources
- Release date precision 100%

### Phase 3: Enhanced Discovery (3-4 weeks)
**Goal**: Rich recommendations and user features

**Deliverables**:
- [ ] Review excerpt summarization
- [ ] Badge system implementation
- [ ] Artist information and relations
- [ ] Advanced filtering and sorting
- [ ] Search functionality

**Success Metrics**:
- Recommendation quality feedback >4/5
- Search results relevant
- Badge accuracy >95%

### Phase 4: Streaming Integration (2-3 weeks)
**Goal**: One-click music access

**Deliverables**:
- [ ] Spotify OAuth integration
- [ ] Apple Music deep linking
- [ ] "Add to Library" functionality
- [ ] Purchase link optimization
- [ ] User analytics

**Success Metrics**:
- OAuth success rate >95%
- Click-through rate to streaming >15%
- Add-to-library conversion >5%

## Success Metrics

### Primary KPIs
- **Weekly Active Users**: Target 10K by month 6
- **Albums Discovered**: Average 5 albums per user session
- **Streaming Conversion**: 15% of album views result in streaming clicks
- **Purchase Conversion**: 2% of album views result in purchase clicks

### Secondary KPIs
- **Session Duration**: Average 8+ minutes
- **Return Rate**: 40% weekly return rate
- **Genre Diversity**: Users discover across 3+ genres monthly
- **Mobile Usage**: 60%+ of traffic from mobile

## Risk Assessment

### Technical Risks
- **Data Source Reliability**: Music APIs may have rate limits or downtime
  - *Mitigation*: Multiple fallback sources, caching strategy
- **Streaming Service Changes**: OAuth flows or APIs may change
  - *Mitigation*: Graceful degradation, deep link fallbacks

### Product Risks
- **User Adoption**: Music discovery market is competitive
  - *Mitigation*: Focus on unique curation angle, superior UX
- **Content Quality**: Automated summarization may be poor
  - *Mitigation*: Human review process, user feedback loops

### Business Risks
- **Legal/Licensing**: Using album art and review excerpts
  - *Mitigation*: Fair use compliance, proper attribution
- **Monetization**: No clear revenue model in MVP
  - *Mitigation*: Focus on user growth, explore affiliate partnerships

## Next Steps
1. **Validate assumptions** with target users (music enthusiasts, vinyl collectors)
2. **Technical spike** on MusicBrainz API and review aggregation
3. **Design system** creation for album grid and drawer components
4. **Development environment** setup with mock data
5. **Phase 1 implementation** starting with core grid experience
