"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { VideoUpload } from "@/components/video-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { VideoIcon } from "lucide-react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if (!title.trim()) {
      throw new Error("Please enter a title for your video");
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      const video = await api.uploadVideo(formData);

      toast({
        title: "Upload successful!",
        description: "Your video has been uploaded and is being processed.",
      });

      router.push(`/video/${video.id}`);
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground">You need to sign in to upload videos.</p>
          </div>
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
            <VideoIcon className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Upload Video</h1>
          </div>

          <div className="space-y-6">
            {/* Video details form */}
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
                <CardDescription>Add information about your video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="Enter video title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
                  <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your video (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
                </div>
              </CardContent>
            </Card>

            {/* File upload */}
            <VideoUpload onUpload={handleUpload} />

            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium mb-2">Upload Guidelines:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Maximum file size: 500MB</li>
                <li>Supported formats: MP4, MOV, AVI</li>
                <li>Recommended resolution: 1080p or higher</li>
                <li>Videos will be processed after upload</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
