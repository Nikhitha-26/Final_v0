"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import { apiService } from "../services/apiService"
import ChatBot from "../components/ChatBot"
import LoadingSpinner from "../components/LoadingSpinner"

function ExaminerDashboard() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const [activeSection, setActiveSection] = useState("submissions")
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeSection === "submissions") {
      fetchSubmissions()
    }
  }, [activeSection])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const response = await apiService.getSubmissions()
      setSubmissions(response.files)
    } catch (error) {
      addToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId, filename) => {
    try {
      const blob = await apiService.downloadFile(fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      addToast("File downloaded successfully", "success")
    } catch (error) {
      addToast(error.message, "error")
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      addToast("Logged out successfully", "success")
    } catch (error) {
      addToast("Logout failed", "error")
    }
  }

  const menuItems = [
    { id: "submissions", label: "View Submissions", icon: "📋" },
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
              <h1 className="text-2xl font-bold text-gray-900">Examiner Dashboard</h1>
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
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
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
              {activeSection === "submissions" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Project Submissions</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchSubmissions}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : "Refresh"}
                    </motion.button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : submissions.length > 0 ? (
                    <div className="space-y-4">
                      {submissions.map((submission, index) => (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{submission.title}</h3>
                              <p className="text-gray-600 mb-3">{submission.description}</p>

                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                <div>
                                  <span className="font-medium">Filename:</span> {submission.filename}
                                </div>
                                <div>
                                  <span className="font-medium">Size:</span> {Math.round(submission.file_size / 1024)}{" "}
                                  KB
                                </div>
                                <div>
                                  <span className="font-medium">Uploaded by:</span> {submission.profiles?.username}
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span>{" "}
                                  {new Date(submission.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDownload(submission.id, submission.filename)}
                              className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Download
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                      <p className="text-gray-600">Project submissions will appear here when teachers upload files.</p>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "chat" && <ChatBot />}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ExaminerDashboard
