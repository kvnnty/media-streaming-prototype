"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, type User, type AuthResponse } from "@/lib/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await api.login(email, password)
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("user_data", JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response: AuthResponse = await api.register(username, email, password)
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("user_data", JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
