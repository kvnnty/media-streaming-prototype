"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Key, Zap } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

export default function CreateStreamPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, description, thumbnail });

    if (!title.trim() || !description.trim() || !thumbnail) {
      toast({
        title: "Missing information",
        description: "Please provide a title, description and thumbnail.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("thumbnail", thumbnail);

      // Make sure your API function accepts FormData
      await api.createStream(formData);

      toast({
        title: "Stream created!",
        description: "Your stream has been scheduled successfully.",
      });

      router.push(`/dashboard?tab=streams`);
    } catch (error) {
      toast({
        title: "Failed to create stream",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground">You need to sign in to create streams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-2 mb-6">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Create Stream</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stream Details</CardTitle>
                <CardDescription>Set up your live stream</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Stream Title *</Label>
                  <Input id="title" placeholder="Enter stream title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
                  <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your stream (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail *</Label>
                  <ImageUpload onUpload={(file: File) => setThumbnail(file)} />
                  {thumbnail && <p className="text-sm text-muted-foreground">{thumbnail.name}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Streaming Setup</span>
                </CardTitle>
                <CardDescription>After creating your stream, you'll receive streaming credentials</CardDescription>
              </CardHeader>
              <CardContent>
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-1">
                      {step}
                    </Badge>
                    <div>
                      {step === 1 && (
                        <>
                          <h4 className="font-medium">Get Stream Key</h4>
                          <p className="text-sm text-muted-foreground">You'll receive a unique stream key after creating the stream</p>
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <h4 className="font-medium">Configure Streaming Software</h4>
                          <p className="text-sm text-muted-foreground">Use OBS, Streamlabs, or similar software with your stream key</p>
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <h4 className="font-medium">Start Broadcasting</h4>
                          <p className="text-sm text-muted-foreground">Begin streaming at your scheduled time</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Stream"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
