"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { apiService } from "../services/apiService"
import { useToast } from "../hooks/useToast"
import LoadingSpinner from "./LoadingSpinner"

function AISection() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [websites, setWebsites] = useState([])
  const [domainIdeas, setDomainIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("suggestions")
  const { addToast } = useToast()

  const handleGetSuggestions = async () => {
    if (!query.trim()) {
      addToast("Please enter a search query", "warning")
      return
    }

    setLoading(true)
    try {
      const response = await apiService.getProjectSuggestions(query)
      setSuggestions(response.suggestions)
      addToast("AI suggestions generated!", "success")
    } catch (error) {
      addToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleGetWebsites = async () => {
    if (!query.trim()) {
      addToast("Please enter a search query", "warning")
      return
    }

    setLoading(true)
    try {
      // This would call a real API endpoint
      const mockWebsites = [
        {
          name: "GitHub",
          url: "https://github.com",
          description: "Find open source projects and code examples",
          category: "Code Repository",
        },
        {
          name: "Stack Overflow",
          url: "https://stackoverflow.com",
          description: "Technical questions and solutions",
          category: "Q&A Platform",
        },
        {
          name: "Medium",
          url: "https://medium.com",
          description: "Technical articles and tutorials",
          category: "Learning Resource",
        },
      ]
      setWebsites(mockWebsites)
      addToast("Relevant websites found!", "success")
    } catch (error) {
      addToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleGetDomainIdeas = async (domain) => {
    setLoading(true)
    try {
      // This would call a real API endpoint
      const mockIdeas = [
        {
          title: `${domain} Analytics Dashboard`,
          description: `Real-time analytics platform for ${domain}`,
          key_features: ["Data visualization", "Real-time updates", "User management"],
        },
        {
          title: `${domain} Mobile App`,
          description: `Cross-platform mobile application for ${domain}`,
          key_features: ["Offline sync", "Push notifications", "User authentication"],
        },
      ]
      setDomainIdeas(mockIdeas)
      addToast("Domain ideas generated!", "success")
    } catch (error) {
      addToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "suggestions", label: "Project Suggestions" },
    { id: "websites", label: "Relevant Websites" },
    { id: "domain", label: "Domain Ideas" },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Features</h2>

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query for AI suggestions..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetSuggestions}
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
          {loading ? <LoadingSpinner size="sm" /> : "Get AI Suggestions"}
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Websites Tab Content */}
      {activeTab === "websites" && (
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetWebsites}
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
            onMouseOver={e => (e.currentTarget.style.background = '#2563eb')}
            onMouseOut={e => (e.currentTarget.style.background = '#ff7300')}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Find Relevant Websites"}
          </motion.button>
          {websites.map((website, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{website.name}</h3>
                  <p className="text-gray-600 mb-2">{website.description}</p>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {website.category}
                  </span>
                </div>
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
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
                    textDecoration: 'none',
                    marginLeft: 16,
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#2563eb')}
                  onMouseOut={e => (e.currentTarget.style.background = '#ff7300')}
                >
                  Visit
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "domain" && (
        <div>
          <div className="mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGetDomainIdeas(query || "web development")}
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
              onMouseOver={e => (e.currentTarget.style.background = '#2563eb')}
              onMouseOut={e => (e.currentTarget.style.background = '#ff7300')}
            >
              {loading ? <LoadingSpinner size="sm" /> : "Generate Domain Ideas"}
            </motion.button>
          </div>

          {domainIdeas.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {domainIdeas.map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
                  <p className="text-gray-600 mb-4">{idea.description}</p>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {idea.key_features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-600">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

export default AISection
