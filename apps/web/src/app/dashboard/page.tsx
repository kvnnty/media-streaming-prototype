"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { StreamCard } from "@/components/stream-card";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { api, type Stream, type Video } from "@/lib/api";
import { Plus, VideoIcon, Zap, Eye, Calendar, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [allStreams, allVideos] = await Promise.all([api.getStreams(), api.getVideos()]);

        // Filter to show only user's content
        setStreams(allStreams.filter((stream) => stream.username === user.username));
        setVideos(allVideos.filter((video) => video.username === user.username));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const copyStreamKey = (streamKey: string) => {
    navigator.clipboard.writeText(streamKey);
  };

  const liveStreams = streams.filter((stream) => stream.is_live);
  const upcomingStreams = streams.filter((stream) => !stream.is_live && new Date(stream.actual_start!) > new Date());
  const pastStreams = streams.filter((stream) => !stream.is_live && new Date(stream.actual_end!) <= new Date());

  const totalViews = videos.reduce((sum, video) => sum + video.view_count, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground">You need to sign in to access your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.username}!</p>
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/create-stream">
                <Zap className="w-4 h-4 mr-2" />
                Create Stream
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/upload">
                <Plus className="w-4 h-4 mr-2" />
                Upload Video
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="streams">Streams ({streams.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{liveStreams.length}</p>
                      <p className="text-sm text-muted-foreground">Live Now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{upcomingStreams.length}</p>
                      <p className="text-sm text-muted-foreground">Upcoming</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <VideoIcon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{videos.length}</p>
                      <p className="text-sm text-muted-foreground">Videos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Videos</CardTitle>
                  <CardDescription>Your latest uploaded content</CardDescription>
                </CardHeader>
                <CardContent>
                  {videos.length > 0 ? (
                    <div className="space-y-4">
                      {videos.slice(0, 3).map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <VideoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No videos uploaded yet</p>
                      <Button className="mt-4" asChild>
                        <Link href="/upload">Upload Your First Video</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Streams</CardTitle>
                  <CardDescription>Your scheduled live streams</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingStreams.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingStreams.slice(0, 3).map((stream) => (
                        <div key={stream.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <h4 className="font-medium">{stream.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stream.actual_start ? new Date(stream.actual_start).toLocaleString() : "Not started yet"}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/stream/${stream.id}`}>
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming streams</p>
                      <Button className="mt-4" asChild>
                        <Link href="/create-stream">Schedule a Stream</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="streams" className="mt-6">
            <div className="space-y-6">
              {/* Live streams */}
              {liveStreams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                    Live Now
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveStreams.map((stream) => (
                      <div key={stream.id} className="space-y-2">
                        <StreamCard stream={stream} />
                        <Card className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Stream Key:</span>
                            <Button size="sm" variant="outline" onClick={() => copyStreamKey(stream.stream_key)}>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <code className="text-xs bg-muted p-1 rounded mt-1 block truncate">{stream.stream_key}</code>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming streams */}
              {upcomingStreams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upcoming Streams</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingStreams.map((stream) => (
                      <StreamCard key={stream.id} stream={stream} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past streams */}
              {pastStreams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Past Streams</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastStreams.map((stream) => (
                      <StreamCard key={stream.id} stream={stream} />
                    ))}
                  </div>
                </div>
              )}

              {streams.length === 0 && (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Streams Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first stream to get started</p>
                  <Button asChild>
                    <Link href="/create-stream">Create Stream</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <VideoIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Videos Yet</h3>
                <p className="text-muted-foreground mb-4">Upload your first video to get started</p>
                <Button asChild>
                  <Link href="/upload">Upload Video</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
