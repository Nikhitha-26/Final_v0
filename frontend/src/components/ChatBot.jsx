"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { apiService } from "../services/apiService"
import { useToast } from "../hooks/useToast"
import LoadingSpinner from "./LoadingSpinner"

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you with your project today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { addToast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setLoading(true)

    try {
      const response = await apiService.chatWithAI(inputMessage)

      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      addToast(error.message, "error")

      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[320px]" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ff7300" style={{ width: 28, height: 28, background: '#fff4e6', borderRadius: '50%', padding: 4, boxShadow: '0 2px 8px #ff73001a' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0 4.556 4.694 8.25 10.25 8.25.97 0 1.91-.09 2.803-.26.37-.07.56-.53.34-.85a7.5 7.5 0 0 1-.693-1.32c-.13-.28.01-.62.32-.7A8.25 8.25 0 1 0 2.25 12Z" />
          <circle cx="9" cy="10" r="1" fill="#ff7300" />
          <circle cx="15" cy="10" r="1" fill="#ff7300" />
        </svg>
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: '#ff7300', letterSpacing: '0.01em', textShadow: '0 1px 0 #fff8f1', margin: 0 }}
        >
          AI Chatbot Help
        </h2>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto border rounded-lg p-3 mb-2 custom-scrollbar"
        style={{
          minHeight: '120px',
          maxHeight: 'calc(100% - 56px)',
          background: '#fff8f1',
          borderColor: '#ffe0c2',
        }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm"
                style={
                  message.sender === 'user'
                    ? {
                        background: '#ff7300',
                        color: '#fff',
                        boxShadow: '0 2px 8px #ff73001a',
                      }
                    : {
                        background: '#fff',
                        color: '#23272f',
                        border: '1px solid #ffe0c2',
                      }
                }
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p
                  className="text-xs mt-1"
                  style={{ color: message.sender === 'user' ? '#ffd8b0' : '#888' }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-3"
          >
            <div
              style={{
                background: '#fff',
                color: '#23272f',
                border: '1px solid #ffe0c2',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
              }}
            >
              <LoadingSpinner size="sm" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex space-x-2 items-end mt-1">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg resize-none text-sm px-2 py-1"
          rows={1}
          disabled={loading}
          style={{
            minHeight: '32px',
            maxHeight: '64px',
            borderColor: '#ffb366',
            outline: 'none',
            boxShadow: '0 0 0 2px #ff730033',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={loading || !inputMessage.trim()}
          className="rounded-lg text-sm font-semibold"
          style={{
            background: loading || !inputMessage.trim() ? '#ffd8b0' : '#ff7300',
            color: '#fff',
            padding: '0.25rem 0.75rem',
            opacity: loading || !inputMessage.trim() ? 0.5 : 1,
            cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px #ff73001a',
          }}
        >
          Send
        </motion.button>
      </div>
    </div>
  )
}

export default ChatBot
