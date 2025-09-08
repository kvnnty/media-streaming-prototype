import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Stream } from "@/lib/api"
import { Users } from "lucide-react"

interface StreamCardProps {
  stream: Stream
}

export function StreamCard({ stream }: StreamCardProps) {
  const thumbnailUrl = stream.thumbnail_url || `/placeholder.svg?height=200&width=350&query=live stream ${stream.title}`

  return (
    <Link href={`/stream/${stream.id}`}>
      <Card className="group overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-200 cursor-pointer">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {stream.is_live && (
            <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-600 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
              LIVE
            </Badge>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {/* {Math.floor(Math.random() * 1000) + 50} */}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {stream.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 text-balance group-hover:text-primary transition-colors">
                {stream.title}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">{stream.username}</p>
              {stream.description && (
                <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{stream.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
