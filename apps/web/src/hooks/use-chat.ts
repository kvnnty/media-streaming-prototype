"use client"

import { useState, useEffect, useCallback } from "react"
import { useSocket } from "@/hooks/use-socket"
import { useAuth } from "@/hooks/use-auth"

export interface ChatMessage {
  id: string
  stream_id: number
  user_id: number
  username: string
  message: string
  timestamp: Date
}

export function useChat(streamId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [viewerCount, setViewerCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { socket, isConnected } = useSocket()
  const { user } = useAuth()

  // Join stream room when socket connects
  useEffect(() => {
    if (socket && isConnected && streamId) {
      console.log(`[Chat] Joining stream ${streamId}`)
      socket.emit("join-stream", streamId)
      setIsLoading(false)

      return () => {
        console.log(`[Chat] Leaving stream ${streamId}`)
        socket.emit("leave-stream", streamId)
      }
    }
  }, [socket, isConnected, streamId])

  // Listen for new messages
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: ChatMessage) => {
      console.log("[Chat] New message received:", message)
      setMessages((prev) => [
        ...prev.slice(-49),
        {
          ...message,
          timestamp: new Date(message.timestamp),
        },
      ])
    }

    const handleViewerUpdate = (data: { streamId: string; count: number }) => {
      if (data.streamId === streamId) {
        setViewerCount(data.count)
      }
    }

    const handleChatHistory = (history: ChatMessage[]) => {
      console.log("[Chat] Received chat history:", history.length, "messages")
      setMessages(
        history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      )
    }

    socket.on("new-message", handleNewMessage)
    socket.on("viewer-count-update", handleViewerUpdate)
    socket.on("chat-history", handleChatHistory)

    return () => {
      socket.off("new-message", handleNewMessage)
      socket.off("viewer-count-update", handleViewerUpdate)
      socket.off("chat-history", handleChatHistory)
    }
  }, [socket, streamId])

  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || !user || !message.trim()) return

      const messageData = {
        streamId: Number.parseInt(streamId),
        userId: user.id,
        username: user.username,
        message: message.trim(),
      }

      console.log("[Chat] Sending message:", messageData)
      socket.emit("send-message", messageData)
    },
    [socket, user, streamId],
  )

  return {
    messages,
    viewerCount,
    isLoading,
    isConnected,
    sendMessage,
  }
}
