import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { AlbumDetailView } from "@/components/album-detail-view"
import type { Album } from "@/types"

interface AlbumPageProps {
  params: Promise<{ id: string }>
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { id } = await params
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  
  try {
    // Fetch album data from API
    const response = await fetch(`${protocol}://${host}/api/albums/${id}`)
    
    if (!response.ok) {
      notFound()
    }
    
    const album: Album = await response.json()
    
    return <AlbumDetailView album={album} />
  } catch (error) {
    console.error('Failed to fetch album:', error)
    notFound()
  }
}
