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
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
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

      {/* Tab Content */}
      {activeTab === "suggestions" && (
        <div>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{suggestion.title}</h3>
                  <p className="text-gray-600 mb-4">{suggestion.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          suggestion.difficulty === "beginner"
                            ? "bg-green-100 text-green-800"
                            : suggestion.difficulty === "intermediate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {suggestion.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Time:</span>
                      <span className="text-sm text-gray-600">{suggestion.estimated_time}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {suggestion.technologies &&
                        suggestion.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {activeTab === "websites" && (
        <div>
          <div className="mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetWebsites}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Find Relevant Websites"}
            </motion.button>
          </div>

          {websites.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
                      className="ml-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Visit
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
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
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
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
