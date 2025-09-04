"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlbumCard } from "@/components/album-card"
import type { Album, AlbumDetail } from "@/types"

interface AlbumDetailViewProps {
  album: Album | AlbumDetail
}

export function AlbumDetailView({ album }: AlbumDetailViewProps) {
  const [imageError, setImageError] = useState(false)
  const [criticalConsensus, setCriticalConsensus] = useState<string>("")
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoadingConsensus, setIsLoadingConsensus] = useState(true)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)

  // Check if this is an AlbumDetail with full data
  const isFullAlbumDetail = 'recommendationBlurb' in album
  const artist = 'artist' in album ? (album as AlbumDetail).artist : { bioExcerpt: '', wikipediaUrl: undefined }
  
  useEffect(() => {
    if (isFullAlbumDetail) {
      // Use the data from AlbumDetail API response
      const albumDetail = album as AlbumDetail
      setCriticalConsensus(albumDetail.recommendationBlurb || "")
      
      // Transform reviews to match expected format
      const transformedReviews = albumDetail.reviews?.map(review => ({
        publication: review.source,
        score: review.score100 ? review.score100 / 10 : null,
        maxScore: 10,
        link: review.url || "#",
        logo: getPublicationLogo(review.source),
        excerpt: review.excerpt,
        isGenerated: review.id?.startsWith('generated_') || review.id?.startsWith('fallback_')
      })) || []
      
      setReviews(transformedReviews)
      setIsLoadingConsensus(false)
      setIsLoadingReviews(false)
    } else {
      // Fetch data separately for basic Album
      fetchCriticalConsensus()
      fetchReviews()
    }
  }, [album, isFullAlbumDetail])

  const fetchCriticalConsensus = async () => {
    try {
      setIsLoadingConsensus(true)
      const response = await fetch(`/api/albums/${album.id}/consensus`)
      if (response.ok) {
        const data = await response.json()
        setCriticalConsensus(data.consensus || "")
      } else {
        // Fallback consensus
        setCriticalConsensus("A compelling musical release that showcases the artist's distinctive style and creative vision.")
      }
    } catch (error) {
      console.error('Error fetching critical consensus:', error)
      setCriticalConsensus("A compelling musical release that showcases the artist's distinctive style and creative vision.")
    } finally {
      setIsLoadingConsensus(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true)
      const response = await fetch(`/api/albums/${album.id}/reviews?generateMock=true`)
      if (response.ok) {
        const data = await response.json()
        const transformedReviews = data.reviews?.map((review: any) => ({
          publication: review.publication,
          score: review.score,
          maxScore: review.maxScore || 10,
          link: review.url || "#",
          logo: getPublicationLogo(review.publication),
          excerpt: review.excerpt,
          isGenerated: review.isGenerated
        })) || []
        setReviews(transformedReviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      // Keep empty reviews array as fallback
    } finally {
      setIsLoadingReviews(false)
    }
  }

  const getPublicationLogo = (publication: string): string => {
    const logoMap: { [key: string]: string } = {
      'Pitchfork': '/pitchfork-logo.png',
      'Rolling Stone': '/rolling-stone-logo.png',
      'AllMusic': '/allmusic-logo.png',
      'The Guardian': '/the-guardian-logo.png',
      'NME': '/nme-logo.png',
      'Consequence': '/consequence-logo.png',
      'SpinGrid': '/spingrid-logo.png'
    }
    return logoMap[publication] || '/placeholder-logo.png'
  }

  const badges = [
    "Rolling Stone's 500 Greatest Albums",
    "Pitchfork's Best Albums of 2023",
    "Grammy Nominated",
    "NME's Albums of the Year",
  ]


  const discography: Album[] = [
    {
      id: "1",
      title: "First Light",
      artistCredit: album.artistCredit,
      releaseDate: "2018-03-15",
      coverUrl: "/indie-album-cover.png",
      genres: ["Indie Rock"],
      weeklyScore: 7.8,
      badges: [],
      streamingServices: ["Spotify", "Apple Music"],
    },
    {
      id: "2",
      title: "Midnight Reflections",
      artistCredit: album.artistCredit,
      releaseDate: "2021-09-22",
      coverUrl: "/dark-album-cover.png",
      genres: ["Alternative"],
      weeklyScore: 8.2,
      badges: [],
      streamingServices: ["Spotify", "Apple Music", "YouTube Music"],
    },
    album, // Current album
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section with Album Cover */}
      <div className="relative">
        {/* Full-width album cover background */}
        <div className="relative h-screen w-full overflow-hidden">
          <Image
            src={imageError ? "/placeholder.svg?height=1080&width=1920&query=album cover background" : album.coverUrl}
            alt={`${album.title} background`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
          {/* Gradient overlay for text readability and blend effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-slate-900" />

          {/* Album info overlay */}
          <div className="absolute inset-0 flex items-end justify-start p-12">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-6">
                <div className="w-48 h-48 relative flex-shrink-0">
                  <Image
                    src={imageError ? "/placeholder.svg?height=192&width=192&query=album cover" : album.coverUrl}
                    alt={`${album.title} cover`}
                    fill
                    className="object-cover rounded-lg shadow-2xl"
                    onError={() => setImageError(true)}
                  />
                </div>
                <div className="space-y-2">
                  <h1 className="text-6xl font-bold text-white text-balance">{album.title}</h1>
                  <p className="text-3xl text-slate-200">{album.artistCredit}</p>
                  <p className="text-xl text-slate-300">{new Date(album.releaseDate).getFullYear()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back button */}
          <Link href="/" className="absolute top-6 left-6 z-20">
            <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Albums
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Critical Consensus & Reviews */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Critical Consensus */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-white mb-4">Critical Consensus</h2>
              {isLoadingConsensus ? (
                <div className="flex items-center gap-2 text-slate-400 mb-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating critical consensus...</span>
                </div>
              ) : (
                <p className="text-slate-300 leading-relaxed mb-6">{criticalConsensus}</p>
              )}

              {/* Recognition Badges */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Recognition</h3>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <Badge
                      key={badge}
                      className="bg-amber-600/20 text-amber-400 border border-amber-600/30 px-3 py-1 text-xs"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-white mb-4">Reviews</h2>
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
                {isLoadingReviews ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading reviews...</span>
                    </div>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="divide-y divide-slate-700/50">
                    {reviews.map((review, index) => (
                      <a
                        key={`${review.publication}-${index}`}
                        href={review.link}
                        className="flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors group"
                        title={review.excerpt || `${review.publication} review`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Image
                            src={review.logo || "/placeholder.svg"}
                            alt={`${review.publication} logo`}
                            width={60}
                            height={20}
                            className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          {review.isGenerated && (
                            <span className="text-xs text-amber-400/70 ml-1">AI</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-right">
                          <span className="text-sm font-bold text-white">
                            {review.score ? review.score.toFixed(1) : 'N/A'}
                          </span>
                          {review.maxScore && <span className="text-xs text-slate-400">/{review.maxScore}</span>}
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition-colors ml-1" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    No reviews available
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Links */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Learn More</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="#"
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-amber-600 transition-colors group flex items-center justify-between"
            >
              <div>
                <h3 className="text-white font-medium">Album on Wikipedia</h3>
                <p className="text-slate-400 text-sm">Detailed information and history</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-amber-400" />
            </a>
            <a
              href="#"
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-amber-600 transition-colors group flex items-center justify-between"
            >
              <div>
                <h3 className="text-white font-medium">Album on AllMusic</h3>
                <p className="text-slate-400 text-sm">Professional review and ratings</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-amber-400" />
            </a>
            <a
              href="#"
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-amber-600 transition-colors group flex items-center justify-between"
            >
              <div>
                <h3 className="text-white font-medium">Artist on Wikipedia</h3>
                <p className="text-slate-400 text-sm">Biography and discography</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-amber-400" />
            </a>
            <a
              href="#"
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-amber-600 transition-colors group flex items-center justify-between"
            >
              <div>
                <h3 className="text-white font-medium">Artist on AllMusic</h3>
                <p className="text-slate-400 text-sm">Complete artist profile</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-amber-400" />
            </a>
          </div>
        </section>

        {/* Artist Info */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Artist Information</h2>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-300 leading-relaxed mb-4">
              {artist.bioExcerpt}
            </p>
            {artist.wikipediaUrl && (
              <a
                href={artist.wikipediaUrl}
                className="text-amber-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read more on Wikipedia
              </a>
            )}
          </div>
        </section>

        {/* Discography */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6">Discography</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {discography.map((disc) => (
              <div
                key={disc.id}
                className={`flex-shrink-0 w-48 ${disc.id === album.id ? "ring-2 ring-amber-400 rounded-lg" : ""}`}
              >
                <AlbumCard album={disc} selectedService="" />
                {disc.id === album.id && (
                  <Badge className="bg-amber-600 text-white text-xs mt-2 ml-2">Current Album</Badge>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
