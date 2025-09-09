"use client";

import { Chat } from "@/components/chat";
import { Header } from "@/components/header";
import { StreamCard } from "@/components/stream-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video-player";
import { useAuth } from "@/hooks/use-auth";
import { api, type Stream } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Flag, Heart, Share2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StreamPage() {
  const params = useParams();
  const router = useRouter();
  const streamId = params.id as string;
  const [stream, setStream] = useState<Stream | null>(null);
  const [relatedStreams, setRelatedStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streamData, allStreams] = await Promise.all([api.getStream(streamId), api.getLiveStreams()]);

        setStream(streamData);
        // Filter out current stream and show related ones
        setRelatedStreams(allStreams.filter((s) => s.id !== Number.parseInt(streamId)).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch stream:", error);
      } finally {
        setLoading(false);
      }
    };

    if (streamId) {
      fetchData();
    }
  }, [streamId]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow API call
  };

  const handleEndStream = () => {
    api
      .endStream(stream?.stream_key!)
      .then(() => {
        toast.success("Stream ended!");
        router.push("/browse");
      })
      .catch(() => {
        toast.error("Failed to end stream.");
      });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream?.title,
        text: `Check out this live stream: ${stream?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading stream...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Stream Not Found</h1>
            <p className="text-muted-foreground">The stream you're looking for doesn't exist or has ended.</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock HLS stream URL - in production this would come from your streaming server
  const streamUrl = stream.is_live ? `${process.env.NEXT_PUBLIC_RTMP_HTTP}/hls/${stream.stream_key}.m3u8` : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video player */}
            <div className="aspect-video flex items-center justify-center bg-card text-muted-foreground text-xl font-semibold">
              {!stream.is_live && !stream.actual_start ? (
                <div className="text-center">
                  <p className="text-white">Stream has not started yet.</p>
                </div>
              ) : stream.actual_end && new Date(stream.actual_end).getTime() < Date.now() ? (
                <div className="text-center">
                  <p className="text-white font-bold animate-pulse">Stream ended {formatDistanceToNow(new Date(stream.actual_end), { addSuffix: true })}</p>
                </div>
              ) : (
                <VideoPlayer
                  src={streamUrl}
                  isLive={!stream.actual_end || new Date(stream.actual_end).getTime() > Date.now()}
                  poster={stream.thumbnail_url}
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Stream info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {stream.is_live && (
                      <Badge className="bg-red-600 hover:bg-red-600 text-white">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                        LIVE
                      </Badge>
                    )}
                    {user && user.id === stream.user_id && stream.is_live && (
                      <div>
                        <Button onClick={handleEndStream}>End stream</Button>
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-balance mb-2">{stream.title}</h1>
                  {stream.description && <p className="text-muted-foreground text-pretty">{stream.description}</p>}
                </div>
              </div>

              {/* Streamer info and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">{stream.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{stream.username}</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {stream.actual_start ? <>Started at {new Date(stream.actual_start).toLocaleString()}</> : "Not started yet"}
                    </p>
                  </div>
                </div>

                {user && user.id !== stream.user_id && (
                  <div className="flex items-center space-x-2">
                    <Button variant={isFollowing ? "secondary" : "default"} onClick={handleFollow}>
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat */}
            <div className="h-96 lg:h-[600px]">
              <Chat stream={stream} className="h-full" />
            </div>

            {/* Related streams */}
            {relatedStreams.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Other Live Streams</h3>
                <div className="space-y-4">
                  {relatedStreams.map((relatedStream) => (
                    <StreamCard key={relatedStream.id} stream={relatedStream} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
