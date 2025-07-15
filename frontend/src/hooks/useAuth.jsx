"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("user_data")
      }
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)

      // Support both {access_token, user} and {user: {access_token, ...}}
      let token = response.access_token || (response.user && response.user.access_token)
      let userObj = response.user || response
      if (token) {
        localStorage.setItem("access_token", token)
      }
      if (userObj) {
        localStorage.setItem("user_data", JSON.stringify(userObj))
        setUser(userObj)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (name, email, password, role) => {
  try {
    const response = await authService.register(name, email, password, role)

    const token = response.access_token || (response.user && response.user.access_token)
    const userObj = response.user || response

    if (token) {
      localStorage.setItem("access_token", token)
    }
    if (userObj) {
      localStorage.setItem("user_data", JSON.stringify(userObj))
      setUser(userObj)
    }

    return response
  } catch (error) {
    throw error
  }
}

const logout = async () => {
  try {
    await authService.logout()
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }
}


  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
