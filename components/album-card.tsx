"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Plus, ExternalLink, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { spotifyService } from "@/lib/spotify-service"
import type { Album } from "@/types"

interface AlbumCardProps {
  album: Album
  selectedService?: string
}

export function AlbumCard({ album, selectedService }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [addingToService, setAddingToService] = useState<string | null>(null)
  const [criticalConsensus, setCriticalConsensus] = useState<string>("")
  const [isLoadingConsensus, setIsLoadingConsensus] = useState(false)

  const rating = (album.weeklyScore / 100) * 5

  const getRecommendationBlurb = (album: Album) => {
    const blurbs = [
      "Essential listening. This one's been spinning non-stop in the shop.",
      "Pure sonic bliss. Trust us on this one.",
      "The kind of album that changes everything. Don't sleep on it.",
      "Been waiting for something like this all year. Absolute fire.",
      "This is what we've been telling everyone about. Get it now.",
      "Instant classic vibes. Your collection needs this.",
      "The hype is real. This album delivers on every level.",
      "Been selling out faster than we can restock. There's a reason.",
    ]
    return blurbs[Math.abs(album.id.split("_")[1] ? Number.parseInt(album.id.split("_")[1]) : 0) % blurbs.length]
  }

  const streamingServices = ["Spotify", "Apple Music", "YouTube Music", "Pandora", "Deezer", "Tidal"]

  const fetchCriticalConsensus = async () => {
    try {
      setIsLoadingConsensus(true)
      const response = await fetch(`/api/albums/${album.id}/consensus`)
      if (response.ok) {
        const data = await response.json()
        const oneLine = (data.consensus || "").replace(/\s+/g, " ").trim()
        setCriticalConsensus(oneLine.length > 120 ? oneLine.slice(0, 117) + "..." : oneLine)
      } else {
        setCriticalConsensus(getRecommendationBlurb(album))
      }
    } catch (error) {
      console.error("[AlbumCard] Error fetching consensus:", error)
      setCriticalConsensus(getRecommendationBlurb(album))
    } finally {
      setIsLoadingConsensus(false)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (!criticalConsensus && !isLoadingConsensus) {
      fetchCriticalConsensus()
    }
  }

  const handleAddAlbum = async (service?: string) => {
    if (selectedService && selectedService !== "Any streaming service") {
      await addToService(selectedService)
    } else if (service) {
      await addToService(service)
      setShowServiceModal(false)
    } else {
      setShowServiceModal(true)
    }
  }

  const addToService = async (service: string) => {
    setAddingToService(service)
    
    try {
      if (service === "Spotify") {
        // Try to open direct album page, fallback to search
        await spotifyService.openAlbumPage(album.title, album.artistCredit)
        console.log(`[AlbumCard] Opened Spotify for "${album.title}" by ${album.artistCredit}`)
      } else {
        console.log(`[AlbumCard] Adding "${album.title}" to ${service}`)
      }
    } catch (error) {
      console.error(`[AlbumCard] Error adding to ${service}:`, error)
    } finally {
      setAddingToService(null)
    }
  }

  return (
    <>
      <div
        className="group cursor-pointer transition-all duration-300 hover:scale-105"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-800 border border-slate-700 shadow-lg album-card-hover group">
          <Image
            src={imageError ? "/placeholder.svg?height=300&width=300&query=album cover" : album.coverUrl}
            alt={`${album.title} by ${album.artistCredit}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />

          <div className={`absolute inset-0 bg-black/80 flex flex-col transition-all duration-300 hover-overlay rounded-lg ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="flex justify-between items-start p-3">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border-0 p-2 h-8 w-8 min-w-8 hover-button"
                onClick={() => handleAddAlbum()}
                disabled={!!addingToService}
              >
                {addingToService ? (
                  <div className="loading-spinner rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
              <div className="flex flex-col gap-1 items-end">
                <Badge className="bg-accent/90 text-white text-xs px-2 py-1 max-w-[120px] truncate genre-badge" title={album.genres[0]}>
                  {album.genres[0]}
                </Badge>
                {album.sourceTags && album.sourceTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {album.sourceTags.slice(0, 2).map((source, index) => (
                      <Badge key={index} variant="outline" className="bg-white/10 text-white text-xs px-1 py-0.5 border-white/20">
                        {source}
                      </Badge>
                    ))}
                    {album.sourceCount > 2 && (
                      <Badge variant="outline" className="bg-white/10 text-white text-xs px-1 py-0.5 border-white/20">
                        +{album.sourceCount - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4">
              <p className="text-white text-sm text-center leading-relaxed font-medium italic line-clamp-1">
                "{criticalConsensus || (isLoadingConsensus ? 'Loading critical buzz...' : getRecommendationBlurb(album))}"
              </p>
            </div>

            <div className="flex items-end justify-between p-3">
              <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                <h3 className="text-white font-medium text-xs leading-tight line-clamp-2">{album.title}</h3>
                <p className="text-slate-300 text-xs">{album.artistCredit}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-accent text-accent" />
                    <span className="text-white text-xs font-medium">{rating.toFixed(1)}</span>
                  </div>
                  {album.sourceCount > 1 && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-300 text-xs">•</span>
                      <span className="text-slate-300 text-xs">{album.sourceCount} sources</span>
                    </div>
                  )}
                </div>
              </div>

              <Link href={`/album/${album.id}`}>
                <Button size="sm" className="bg-accent hover:bg-accent/80 text-white border-0 p-2 h-8 w-8 min-w-8 flex-shrink-0 hover-button">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showServiceModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowServiceModal(false)}
        >
          <div
            className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Add to Streaming Service</h3>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white p-1 h-auto"
                onClick={() => setShowServiceModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-slate-300 text-sm mb-4">
                Add "{album.title}" by {album.artistCredit} to:
              </p>
              {streamingServices.map((service) => (
                <Button
                  key={service}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-slate-700 border border-slate-600"
                  onClick={() => handleAddAlbum(service)}
                >
                  {service}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
