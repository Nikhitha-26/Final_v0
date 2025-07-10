"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import SearchSection from "../components/SearchSection"
import AISection from "../components/AISection"
import ChatBot from "../components/ChatBot"
import FileUpload from "../components/FileUpload"

function TeacherDashboard() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const [activeSection, setActiveSection] = useState("search")

  const handleLogout = async () => {
    try {
      await logout()
      addToast("Logged out successfully", "success")
    } catch (error) {
      addToast("Logout failed", "error")
    }
  }

  const menuItems = [
    { id: "search", label: "Search Projects", icon: "🔍" },
    { id: "ai", label: "AI Suggestions", icon: "🤖" },
    { id: "upload", label: "Upload Project File", icon: "📁" },
    { id: "chat", label: "Chatbot Help", icon: "🆘" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.username}!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu</h2>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      activeSection === item.id
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeSection === "search" && <SearchSection />}
              {activeSection === "ai" && <AISection />}
              {activeSection === "upload" && <FileUpload />}
              {activeSection === "chat" && <ChatBot />}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
