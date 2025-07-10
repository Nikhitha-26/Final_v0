"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import { apiService } from "../services/apiService"
import SearchSection from "../components/SearchSection"
import AISection from "../components/AISection"
import ChatBot from "../components/ChatBot"
import LoadingSpinner from "../components/LoadingSpinner"

function StudentDashboard() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const [activeSection, setActiveSection] = useState("search")
  const [loading, setLoading] = useState(false)

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
    { id: "improve", label: "Improve My Idea", icon: "💡" },
    { id: "message", label: "Message Teacher", icon: "💬" },
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
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
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
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
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
              {loading && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {!loading && (
                <>
                  {activeSection === "search" && <SearchSection />}
                  {activeSection === "ai" && <AISection />}
                  {activeSection === "improve" && <ImprovementSection />}
                  {activeSection === "message" && <MessageSection />}
                  {activeSection === "chat" && <ChatBot />}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Improvement Section Component
function ImprovementSection() {
  const [idea, setIdea] = useState("")
  const [improvement, setImprovement] = useState(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleImprove = async () => {
    if (!idea.trim()) {
      addToast("Please enter your project idea", "warning")
      return
    }

    setLoading(true)
    try {
      const response = await apiService.improveIdea(idea)
      setImprovement(response)
      addToast("Improvement suggestions generated!", "success")
    } catch (error) {
      addToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Improve My Idea</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Project Idea</label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your project idea here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleImprove}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : "Get Improvements"}
        </motion.button>

        {improvement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-gray-50 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Suggestions</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{improvement.improvements}</p>

              {improvement.technical_suggestions && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900">Technical Suggestions:</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {improvement.technical_suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-700">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {improvement.feature_suggestions && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900">Feature Suggestions:</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {improvement.feature_suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-700">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Message Section Component
function MessageSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Message Teacher</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">Direct messaging with teachers will be available in the next update.</p>
      </div>
    </div>
  )
}

export default StudentDashboard
