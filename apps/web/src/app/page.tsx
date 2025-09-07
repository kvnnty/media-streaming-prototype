"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { StreamCard } from "@/components/stream-card"
import { VideoCard } from "@/components/video-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api, type Stream, type Video } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Search, Zap, Users, VideoIcon } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [liveStreams, setLiveStreams] = useState<Stream[]>([])
  const [recentVideos, setRecentVideos] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streams, videos] = await Promise.all([api.getLiveStreams(), api.getVideos()])
        setLiveStreams(streams)
        setRecentVideos(videos.slice(0, 8)) // Show first 8 videos
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results or filter content
      console.log("Search for:", searchQuery)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading streams...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Welcome to <span className="text-primary">StreamHub</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Discover amazing live streams, connect with creators, and share your passion with the world.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
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

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Live Streams Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Live Now</h2>
              {liveStreams.length > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  {liveStreams.length} live
                </div>
              )}
            </div>
            {liveStreams.length > 4 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/browse?filter=live">View All</Link>
              </Button>
            )}
          </div>

          {liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveStreams.slice(0, 8).map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-dashed">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Live Streams</h3>
              <p className="text-muted-foreground mb-4">Be the first to go live today!</p>
              {user && (
                <Button asChild>
                  <Link href="/create-stream">Start Streaming</Link>
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Recent Videos Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <VideoIcon className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Recent Videos</h2>
            </div>
            {recentVideos.length > 8 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/browse?filter=videos">View All</Link>
              </Button>
            )}
          </div>

          {recentVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-dashed">
              <VideoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Videos Yet</h3>
              <p className="text-muted-foreground">Videos will appear here once creators start uploading content.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
