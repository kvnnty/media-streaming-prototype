"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { VideoPlayer } from "@/components/video-player"
import { VideoCard } from "@/components/video-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api, type Video } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Calendar, Eye, Share2, Flag, ThumbsUp, ThumbsDown } from "lucide-react"

export default function VideoPage() {
  const params = useParams()
  const videoId = params.id as string
  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoData, allVideos] = await Promise.all([api.getVideo(videoId), api.getVideos()])

        setVideo(videoData)
        // Filter out current video and show related ones
        setRelatedVideos(allVideos.filter((v) => v.id !== Number.parseInt(videoId)).slice(0, 6))
      } catch (error) {
        console.error("Failed to fetch video:", error)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchData()
    }
  }, [videoId])

  const handleLike = () => {
    setIsLiked(!isLiked)
    if (isDisliked) setIsDisliked(false)
    // TODO: Implement like API call
  }

  const handleDislike = () => {
    setIsDisliked(!isDisliked)
    if (isLiked) setIsLiked(false)
    // TODO: Implement dislike API call
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: `Check out this video: ${video?.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
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
              <p className="text-muted-foreground">Loading video...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
            <p className="text-muted-foreground">The video you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  // Mock video stream URL - in production this would serve the actual video file
  const videoUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/videos/${video.id}/stream`

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video player */}
            <div className="aspect-video">
              <VideoPlayer src={videoUrl} isLive={false} poster={video.thumbnail_url} className="w-full h-full" />
            </div>

            {/* Video info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-balance mb-2">{video.title}</h1>
                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {video.view_count.toLocaleString()} views
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Creator info and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {video.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{video.username}</h3>
                    <p className="text-sm text-muted-foreground">Content Creator</p>
                  </div>
                </div>

                {user && (
                  <div className="flex items-center space-x-2">
                    <Button variant={isLiked ? "default" : "outline"} size="sm" onClick={handleLike}>
                      <ThumbsUp className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      {Math.floor(Math.random() * 500) + 10}
                    </Button>
                    <Button variant={isDisliked ? "default" : "outline"} size="sm" onClick={handleDislike}>
                      <ThumbsDown className={`w-4 h-4 ${isDisliked ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Description */}
              {video.description && (
                <div className="bg-card p-4 rounded-lg">
                  <p className="text-pretty">{video.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Related videos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Related Videos</h3>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
