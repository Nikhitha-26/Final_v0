"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [showChatbot, setShowChatbot] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const chatbotModalRef = useRef(null)
  const chatbotHeaderRef = useRef(null)

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

  const handleDownload = async (fileId, filename, fileUrl) => {
    try {
      // Try by id first
      let blob = null
      try {
        blob = await apiService.downloadFile(fileId)
      } catch (err) {
        // If 404, try by file_url
        if (fileUrl) {
          try {
            blob = await apiService.downloadFile(fileUrl)
          } catch (err2) {
            addToast("Download failed by both id and file_url", "error")
            return
          }
        } else {
          addToast("Download failed: file not found", "error")
          return
        }
      }
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
    // Add more menu items here if needed
  ]

  useEffect(() => {
    if (!showChatbot) return
    const modal = chatbotModalRef.current
    const header = chatbotHeaderRef.current
    if (!modal || !header) return
    let isDragging = false, startX, startY, startLeft, startTop
    const onMouseDown = (e) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      const rect = modal.getBoundingClientRect()
      startLeft = rect.left
      startTop = rect.top
      document.body.style.userSelect = 'none'
    }
    const onMouseMove = (e) => {
      if (!isDragging) return
      let newLeft = startLeft + (e.clientX - startX)
      let newTop = startTop + (e.clientY - startY)
      modal.style.left = newLeft + 'px'
      modal.style.top = newTop + 'px'
      modal.style.right = ''
      modal.style.bottom = ''
      modal.style.position = 'fixed'
    }
    const onMouseUp = () => {
      isDragging = false
      document.body.style.userSelect = ''
    }
    header.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      header.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [showChatbot])

  return (
    <div className="min-h-screen bg-reva-gray">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 relative">
            {/* Centered Title */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
              <h1 className="text-2xl font-bold text-reva-orange text-center">Examiner Dashboard</h1>
              <p className="text-sm text-reva-dark text-center">Welcome back, {user?.name}!</p>
            </div>
            {/* Right: Logo and Logout */}
            <div className="flex flex-col items-center ml-auto">
              <img src="/REVAUniversitylogo.png" alt="REVA University Logo" className="w-16 mb-2" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                style={{
                  padding: '8px 24px',
                  background: '#ff7300',
                  color: '#fff',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  border: 'none',
                  boxShadow: '0 2px 8px #ff73001a',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  marginTop: 4,
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#2563eb')}
                onMouseOut={e => (e.currentTarget.style.background = '#ff7300')}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Sidebar and Main Content Layout */}
      <div className="relative min-h-[calc(100vh-80px)]">
        {/* Compact Hamburger Menu Button - fixed to left edge */}
        {!sidebarOpen && (
          <button
            onMouseEnter={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{
              position: 'fixed',
              top: '50%',
              left: 0,
              zIndex: 60,
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              background: '#fff',
              border: '2px solid #ff7300',
              boxShadow: '0 2px 8px #ff73001a',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background 0.2s',
              outline: 'none',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#fff4e6')}
            onMouseOut={e => (e.currentTarget.style.background = '#fff')}
          >
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ display: 'block', width: 24, height: 3, background: '#ff7300', borderRadius: 4, marginBottom: 3 }}></span>
              <span style={{ display: 'block', width: 24, height: 3, background: '#ff7300', borderRadius: 4, marginBottom: 3 }}></span>
              <span style={{ display: 'block', width: 24, height: 3, background: '#ff7300', borderRadius: 4 }}></span>
            </span>
          </button>
        )}
        {/* Dynamic Sidebar - overlays content, but leaves hamburger visible */}
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} group`}
          onMouseLeave={() => setSidebarOpen(false)}
          style={{ minHeight: '100vh', overflow: 'visible' }}
        >
          {sidebarOpen && (
            <div className={`bg-white h-full shadow-sm p-2 rounded-r-lg flex flex-col items-center absolute top-0 left-0 w-64`}>
              <div className="flex flex-col items-center mt-8">
                <img src="/REVAUniversitylogo.png" alt="REVA University Logo" className="w-10 mb-4 transition-all duration-300 opacity-100" />
                <h2 className="text-lg font-semibold text-reva-blue mb-4 transition-all duration-300 opacity-100">Menu</h2>
              </div>
              <nav className="space-y-2 mt-4 w-full">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      activeSection === item.id
                        ? "bg-reva-orange/10 text-reva-orange border border-reva-orange"
                        : "text-reva-dark hover:bg-reva-blue/10"
                    }`}
                  >
                    <span className="text-xl opacity-100">{item.icon}</span>
                    <span className="font-medium opacity-100">{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          )}
        </div>
        {/* Main Content with left margin for sidebar/hamburger */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-12'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    style={{
                      padding: '8px 24px',
                      background: loading ? '#ffd8b0' : '#ff7300',
                      color: '#fff',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 16,
                      border: 'none',
                      boxShadow: '0 2px 8px #ff73001a',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1,
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}
                    onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#ff7300'; }}
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
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{submission.project_title}</h3>
                              <p className="text-gray-600 mb-3"><span className="font-medium">Abstract:</span> {submission.abstract}</p>

                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                <div>
                                  <span className="font-medium">Filename:</span> {submission.file_url ? submission.file_url : "-"}
                                </div>
                                <div>
                                  <span className="font-medium">Student Name:</span> {submission.student_name}
                                </div>
                                <div>
                                  <span className="font-medium">Student ID:</span> {submission.student_id}
                                </div>
                                <div>
                                  <span className="font-medium">Uploaded by:</span> {submission.uploaded_by}
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span> {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : "-"}
                                </div>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (!submission.id) {
                                  console.error('Download error: submission.id is undefined', submission)
                                  addToast('Download failed: file ID is missing', 'error')
                                  return
                                }
                                handleDownload(submission.id, submission.file_url || "file", submission.file_url)
                              }}
                              style={{
                                marginLeft: 16,
                                padding: '8px 24px',
                                background: '#2563eb',
                                color: '#fff',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 16,
                                border: 'none',
                                boxShadow: '0 2px 8px #2563eb1a',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                              }}
                              onMouseOver={e => (e.currentTarget.style.background = '#ff7300')}
                              onMouseOut={e => (e.currentTarget.style.background = '#2563eb')}
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
            </div>
          </div>
        </div>
      </div>
      {/* Floating Chatbot Icon */}
      <button
        onClick={() => setShowChatbot((v) => !v)}
        aria-label="Open Chatbot"
        className="animate-bounce-smooth"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 50,
          background: '#ff7300',
          color: '#fff',
          borderRadius: '50%',
          boxShadow: '0 8px 32px 0 rgba(244,124,32,0.25)',
          width: 56,
          height: 56,
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#2563eb')}
        onMouseOut={e => (e.currentTarget.style.background = '#ff7300')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" style={{ width: 32, height: 32, display: 'block' }}>
          <circle cx="24" cy="24" r="22" fill="#fff" stroke="#ff7300" strokeWidth="3" />
          <ellipse cx="24" cy="28" rx="10" ry="6" fill="#fff4e6" />
          <ellipse cx="24" cy="20" rx="12" ry="10" fill="#fff" stroke="#ff7300" strokeWidth="2" />
          <circle cx="19" cy="20" r="2" fill="#ff7300" />
          <circle cx="29" cy="20" r="2" fill="#ff7300" />
          <rect x="20" y="25" width="8" height="2" rx="1" fill="#ff7300" opacity="0.5" />
        </svg>
      </button>
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            ref={chatbotModalRef}
            initial={{ scale: 1, opacity: 1, y: 0, x: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
            exit={{ scale: 0.3, opacity: 0, y: 120, x: 120, transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] } }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-96 max-w-full bg-white rounded-3xl shadow-2xl border border-gray-200 animate-fade-in overflow-hidden flex flex-col cursor-move resize"
            style={{ boxShadow: '0 8px 32px 0 rgba(244,124,32,0.18)', minWidth: '320px', minHeight: '320px', resize: 'both' }}
          >
            <div ref={chatbotHeaderRef} className="flex items-center justify-between px-6 py-3 bg-reva-orange rounded-t-3xl select-none cursor-move">
              <span className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 12c0 4.556 4.694 8.25 10.25 8.25.97 0 1.91-.09 2.803-.26.37-.07.56-.53.34-.85a7.5 7.5 0 0 1-.693-1.32c-.13-.28.01-.62.32-.7A8.25 8.25 0 1 0 2.25 12Z' />
                  <circle cx='9' cy='10' r='1' fill='currentColor' />
                  <circle cx='15' cy='10' r='1' fill='currentColor' />
                </svg>
                AI Chatbot Help
              </span>
              <button onClick={() => setShowChatbot(false)} className="text-white hover:text-reva-blue text-2xl font-bold transition-colors">&times;</button>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex-1 overflow-y-auto custom-scrollbar" style={{ minHeight: '120px', maxHeight: 'calc(100% - 56px)' }}>
              <ChatBot initialScrollToTop={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        @keyframes bounce-smooth {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-smooth {
          animation: bounce-smooth 2.2s infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f47c20;
          border-radius: 8px;
        }
        .resize {
          resize: both !important;
          overflow: auto !important;
        }
      `}</style>
    </div>
  )
}

export default ExaminerDashboard
