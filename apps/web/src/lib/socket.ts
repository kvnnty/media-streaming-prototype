"use client"

import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    })

    this.socket.on("connect", () => {
      console.log("[Socket] Connected to server")
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason)
    })

    this.socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[Socket] Max reconnection attempts reached")
        this.socket?.disconnect()
      }
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketManager = new SocketManager()
