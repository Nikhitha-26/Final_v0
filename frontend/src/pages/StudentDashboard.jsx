
"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [showChatbot, setShowChatbot] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const chatbotModalRef = useRef(null)
  const chatbotHeaderRef = useRef(null)

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
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
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
              <h1 className="text-2xl font-bold text-reva-orange text-center">Student Dashboard</h1>
              <p className="text-sm text-reva-dark text-center">Welcome back, {user?.name}!</p>
            </div>
            {/* Right: Logo and Logout */}
            <div className="flex flex-col items-center ml-auto">
              <img src="/REVAUniversitylogo.png" alt="REVA University Logo" style={{ width: 64, marginBottom: 8 }} />
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
          <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '32px 16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px #ff73001a', padding: '24px', borderBottom: '2px solid #ffb366' }}>
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
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
            style={{
              position: 'fixed',
              bottom: 96,
              right: 24,
              zIndex: 50,
              width: 384,
              height: 384,
              maxWidth: '100%',
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'move',
              resize: 'both',
            }}
          >
            <div ref={chatbotHeaderRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#ff7300', borderTopLeftRadius: 24, borderTopRightRadius: 24, userSelect: 'none', cursor: 'move' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' style={{ width: 24, height: 24 }}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 12c0 4.556 4.694 8.25 10.25 8.25.97 0 1.91-.09 2.803-.26.37-.07.56-.53.34-.85a7.5 7.5 0 0 1-.693-1.32c-.13-.28.01-.62.32-.7A8.25 8.25 0 1 0 2.25 12Z' />
                  <circle cx='9' cy='10' r='1' fill='currentColor' />
                  <circle cx='15' cy='10' r='1' fill='currentColor' />
                </svg>
                AI Chatbot Help
              </span>
              <button onClick={() => setShowChatbot(false)} style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#2563eb')} onMouseOut={e => (e.currentTarget.style.color = '#fff')}>&times;</button>
            </div>
            <div style={{ padding: '16px 24px', background: '#f9fafb', flex: 1, overflowY: 'auto', minHeight: 120, maxHeight: 'calc(100% - 56px)' }}>
              <ChatBot initialScrollToTop={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleImprove}
          disabled={loading}
          style={{
            padding: '12px 32px',
            background: loading ? '#ffd8b0' : '#ff7300',
            color: '#fff',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 18,
            border: 'none',
            boxShadow: '0 2px 8px #ff73001a',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            transition: 'background 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#2563eb')}
          onMouseOut={e => (e.currentTarget.style.background = '#ff7300')}
        >
          {loading ? <LoadingSpinner size="sm" /> : "Get Improvements"}
        </motion.button>

        {improvement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow mt-6"
          >
            {/* Title and Description if present */}
            {improvement.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{improvement.title}</h3>
            )}
            {improvement.description && (
              <p className="text-gray-600 mb-4">{improvement.description}</p>
            )}
            {/* Difficulty and Estimated Time if present */}
            <div>
              {improvement.difficulty && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full mr-2">
                  {improvement.difficulty}
                </span>
              )}
              {improvement.estimated_time && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {improvement.estimated_time}
                </span>
              )}
            </div>
            {/* Technologies if present */}
            {improvement.technologies && improvement.technologies.length > 0 && (
              <div className="mt-2">
                <ul className="list-disc list-inside space-y-1">
                  {improvement.technologies.map((tech, i) => (
                    <li key={i} className="text-sm text-gray-600">{tech}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Improvements as paragraph or list */}
            {typeof improvement.improvements === "string" && improvement.improvements.trim() ? (
              <div className="mb-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Improvements:</h4>
                <p className="text-gray-700 whitespace-pre-line">{improvement.improvements}</p>
              </div>
            ) : null}
            {Array.isArray(improvement.improvements) && improvement.improvements.length > 0 ? (
              <div className="mb-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Improvements:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {improvement.improvements.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {/* Technical Suggestions */}
            {improvement.technical_suggestions && improvement.technical_suggestions.length > 0 && (
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
            {/* Feature Suggestions */}
            {improvement.feature_suggestions && improvement.feature_suggestions.length > 0 && (
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
            {/* Fallback: show nested object/array in a readable format, not raw JSON */}
            {!(typeof improvement.improvements === "string" && improvement.improvements.trim()) &&
              !(Array.isArray(improvement.improvements) && improvement.improvements.length > 0) &&
              !(improvement.technical_suggestions && improvement.technical_suggestions.length > 0) &&
              !(improvement.feature_suggestions && improvement.feature_suggestions.length > 0) && improvement && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">AI Suggestions:</h4>
                  {Object.entries(improvement).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}: </span>
                      {typeof value === 'string' ? (
                        <span className="text-gray-700">{value}</span>
                      ) : Array.isArray(value) ? (
                        <ul className="list-disc list-inside ml-4">
                          {value.map((item, idx) => (
                            <li key={idx} className="text-gray-700">{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                          ))}
                        </ul>
                      ) : typeof value === 'object' && value !== null ? (
                        <ul className="list-disc list-inside ml-4">
                          {Object.entries(value).map(([k, v]) => (
                            <li key={k} className="text-gray-700"><span className="font-semibold">{k.replace(/_/g, ' ')}:</span> {typeof v === 'string' ? v : JSON.stringify(v)}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-700">{String(value)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
