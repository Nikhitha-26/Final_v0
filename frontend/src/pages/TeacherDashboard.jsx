"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
    { id: "upload", label: "Upload Project File", icon: "📁" },
    // Removed Chatbot Help from menu
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
        style={{ background: '#fff', boxShadow: '0 2px 8px #ff73001a', borderBottom: '2px solid #ffb366' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', position: 'relative' }}>
            {/* Centered Title */}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ff7300', textAlign: 'center', margin: 0 }}>Teacher Dashboard</h1>
              <p style={{ fontSize: 15, color: '#23272f', textAlign: 'center', margin: 0 }}>Welcome back, {user?.name}!</p>
            </div>
            {/* Right: Logo and Logout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 'auto' }}>
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

      {/* Sidebar and Main Content Layout */}
      <div style={{ position: 'relative', minHeight: 'calc(100vh - 80px)' }}>
        {/* Compact Hamburger Menu Button - fixed to left edge */}
        {!sidebarOpen && (
          <button
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
              border: '2px solid #ffb366',
              boxShadow: '0 2px 8px #ff73001a',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'background 0.2s',
              outline: 'none',
            }}
            onMouseEnter={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ display: 'block', width: 24, height: 2, background: '#ff7300', borderRadius: 4 }}></span>
              <span style={{ display: 'block', width: 24, height: 2, background: '#ff7300', borderRadius: 4 }}></span>
              <span style={{ display: 'block', width: 24, height: 2, background: '#ff7300', borderRadius: 4 }}></span>
            </span>
          </button>
        )}
        {/* Dynamic Sidebar - overlays content, but leaves hamburger visible */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100%',
            zIndex: 50,
            minHeight: '100vh',
            overflow: 'visible',
            width: sidebarOpen ? 256 : 0,
            transition: 'width 0.3s',
          }}
          onMouseLeave={() => setSidebarOpen(false)}
        >
          {sidebarOpen && (
            <div style={{ background: '#fff', height: '100%', boxShadow: '0 2px 8px #ff73001a', padding: 8, borderRadius: '0 12px 12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute', top: 0, left: 0, width: 256 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
                <img src="/REVAUniversitylogo.png" alt="REVA University Logo" style={{ width: 40, marginBottom: 16, opacity: 1, transition: 'all 0.3s' }} />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2563eb', marginBottom: 16, opacity: 1, transition: 'all 0.3s' }}>Menu</h2>
              </div>
              <nav style={{ marginTop: 16, width: '100%' }}>
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(item.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontWeight: 500,
                      fontSize: 16,
                      color: activeSection === item.id ? '#ff7300' : '#23272f',
                      background: activeSection === item.id ? '#fff3e6' : 'transparent',
                      border: activeSection === item.id ? '1.5px solid #ffb366' : 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      if (activeSection !== item.id) e.currentTarget.style.background = '#e6f0ff';
                    }}
                    onMouseOut={e => {
                      if (activeSection !== item.id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: 22, opacity: 1 }}>{item.icon}</span>
                    <span style={{ opacity: 1 }}>{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          )}
        </div>
        {/* Main Content with left margin for sidebar/hamburger */}
        <div style={{ transition: 'margin-left 0.3s', marginLeft: sidebarOpen ? 256 : 48 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #ff73001a', padding: 24 }}>
              {activeSection === "search" && <SearchSection />}
              {activeSection === "ai" && <AISection />}
              {activeSection === "upload" && <FileUpload />}
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

export default TeacherDashboard
