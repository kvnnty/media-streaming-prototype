"use client";

import { useEffect, useState, useRef } from "react";

interface BroadcastProps {
  streamKey?: string; // optional, no WebRTC needed
}

export default function Broadcast({ streamKey }: BroadcastProps) {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>();
  const [selectedAudio, setSelectedAudio] = useState<string>();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function initDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
        setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        console.error("Error accessing camera/microphone:", err);
      }
    }
    initDevices();
  }, []);

  useEffect(() => {
    async function startPreview() {
      if (!selectedVideo && !selectedAudio) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideo ? { deviceId: { exact: selectedVideo } } : false,
          audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error starting preview:", err);
      }
    }
    startPreview();
  }, [selectedVideo, selectedAudio]);

  return (
    <div>
      <h3>Select Devices</h3>

      <div>
        <label>Camera: </label>
        <select onChange={(e) => setSelectedVideo(e.target.value)} value={selectedVideo}>
          <option value="">-- Select Camera --</option>
          {videoDevices.map((dev) => (
            <option key={dev.deviceId} value={dev.deviceId}>
              {dev.label || "Camera"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Microphone: </label>
        <select onChange={(e) => setSelectedAudio(e.target.value)} value={selectedAudio}>
          <option value="">-- Select Microphone --</option>
          {audioDevices.map((dev) => (
            <option key={dev.deviceId} value={dev.deviceId}>
              {dev.label || "Mic"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: "400px", marginTop: 20 }} />
      </div>
    </div>
  );
}
