import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getApiUrl } from "../utils/api";

interface User {
  id: number
  firstname: string
  lastname: string
  username: string
  role: string
  password?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  refetchUser: () => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
        const API_URL = await getApiUrl();
      setIsLoading(true)
      console.log("[AUTH] Fetching user from:", `${API_URL}/me`)
      
      const response = await axios.get(`${API_URL}/me`, { 
        withCredentials: true,
        timeout: 5000
      })
      
      if (response.data) {
        console.log("[AUTH] User fetched successfully:", response.data)
        setUser(response.data)
      } else {
        console.log("[AUTH] No user data in response")
        setUser(null)
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log("[AUTH] Not authenticated (401)")
      } else {
        console.log("[AUTH] Error fetching user:", error.message)
      }
      setUser(null)
    } finally {
      setIsLoading(false)
      console.log("[AUTH] Loading complete")
    }
  }

  // ✅ Fetch user on mount
  useEffect(() => {
    console.log("[AUTH] AuthProvider mounted, fetching user...")
    fetchUser()
  }, [])

  const logout = async () => {
    try {
        const API_URL = await getApiUrl();
      console.log("[AUTH] Logging out...")
      await axios.post(`${API_URL}/logout`, {}, { 
        withCredentials: true,
        timeout: 3000
      })
      console.log("[AUTH] Logout successful")
    } catch (error: any) {
      console.error("[AUTH] Logout error:", error.message)
    } finally {
      setUser(null)
      console.log("[AUTH] User cleared")
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      refetchUser: fetchUser, 
      logout,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ✅ Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}