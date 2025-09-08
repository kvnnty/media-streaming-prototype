"use client"

import { useEffect, useState, useRef } from "react"
import type { Socket } from "socket.io-client"
import { socketManager } from "@/lib/socket"
import { useAuth } from "@/hooks/use-auth"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("auth_token")
      const socketInstance = socketManager.connect(token || undefined)

      setSocket(socketInstance)

      const handleConnect = () => {
        setIsConnected(true)
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
      }

      const handleDisconnect = () => {
        setIsConnected(false)
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (user && !socketManager.isConnected()) {
            const newSocket = socketManager.connect(token || undefined)
            setSocket(newSocket)
          }
        }, 3000)
      }

      socketInstance.on("connect", handleConnect)
      socketInstance.on("disconnect", handleDisconnect)

      return () => {
        socketInstance.off("connect", handleConnect)
        socketInstance.off("disconnect", handleDisconnect)
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
      }
    } else {
      // Disconnect when user logs out
      socketManager.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [user])

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return { socket, isConnected }
}
