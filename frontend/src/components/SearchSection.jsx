"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { apiService } from "../services/apiService"
import { useToast } from "../hooks/useToast"
import LoadingSpinner from "./LoadingSpinner"

function SearchSection() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) {
      addToast("Please enter a search query", "warning")
      return
    }

    setLoading(true)
    try {
      const response = await apiService.searchProjects(query)
      setResults(response.results)
      addToast(`Found ${response.results.length} projects`, "success")
    } catch (error) {
      addToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Project Ideas</h2>

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for project ideas..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : "Search"}
        </motion.button>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
          <div className="grid gap-4">
            {results.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                  <span className="text-sm text-indigo-600 font-medium">{project.similarity_score}% match</span>
                </div>
                <p className="text-gray-600 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.technologies &&
                    project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tech}
                      </span>
                    ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Category: {project.category}</span>
                  <span>Difficulty: {project.difficulty}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try searching with different keywords</p>
        </div>
      )}
    </div>
  )
}

export default SearchSection
