"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { StreamCard } from "@/components/stream-card"
import { VideoCard } from "@/components/video-card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, type Stream, type Video } from "@/lib/api"
import { Search } from "lucide-react"

export default function BrowsePage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("filter") === "videos" ? "videos" : "streams"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allStreams, allVideos] = await Promise.all([api.getStreams(), api.getVideos(searchQuery || undefined)])
        setStreams(allStreams)
        setVideos(allVideos)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by the useEffect above
  }

  const liveStreams = streams.filter((stream) => stream.is_live)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading content...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Content</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search streams and videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="streams">Live Streams ({liveStreams.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="streams" className="mt-6">
            {liveStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {liveStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border border-dashed">
                <h3 className="text-lg font-semibold mb-2">No Live Streams</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "No streams match your search." : "No one is streaming right now."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border border-dashed">
                <h3 className="text-lg font-semibold mb-2">No Videos Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "No videos match your search." : "No videos have been uploaded yet."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
