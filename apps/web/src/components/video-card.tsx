import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Video } from "@/lib/api"
import { Eye, Clock } from "lucide-react"

interface VideoCardProps {
  video: Video
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function VideoCard({ video }: VideoCardProps) {
  const thumbnailUrl = video.thumbnail_url || `/placeholder.svg?height=200&width=350&query=video ${video.title}`

  return (
    <Link href={`/video/${video.id}`}>
      <Card className="group overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-200 cursor-pointer">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {video.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 text-balance group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">{video.username}</p>
              <div className="flex items-center text-muted-foreground text-xs mt-1 space-x-2">
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {formatViewCount(video.view_count)} views
                </div>
                <span>•</span>
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
