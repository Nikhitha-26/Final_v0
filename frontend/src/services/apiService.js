import { authService } from "./authService"

const API_BASE_URL = "http://localhost:5000/api"

class ApiService {
  async getRelevantWebsites(query) {
    return this.makeRequest("/ai/websites", {
      method: "POST",
      body: JSON.stringify({ query }),
    })
  }
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...authService.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Request failed")
    }

    return response.json()
  }

  // Search endpoints
  async searchProjects(query) {
    return this.makeRequest("/search/projects", {
      method: "POST",
      body: JSON.stringify({ query }),
    })
  }

  // AI endpoints
  async getProjectSuggestions(query) {
    return this.makeRequest("/ai/suggestions", {
      method: "POST",
      body: JSON.stringify({ query }),
    })
  }

  async improveIdea(idea) {
    return this.makeRequest("/ai/improve", {
      method: "POST",
      body: JSON.stringify({ idea }),
    })
  }

  async chatWithAI(message) {
    return this.makeRequest("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    })
  }

  // File endpoints
  async uploadFile(file, title, description) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("description", description)

    return this.makeRequest("/files/upload", {
      method: "POST",
      headers: {
        ...authService.getAuthHeaders(),
      },
      body: formData,
    })
  }

  async getSubmissions() {
    return this.makeRequest("/files/submissions")
  }

  async downloadFile(fileId) {
    const token = localStorage.getItem("access_token")
    const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Download failed")
    }

    return response.blob()
  }
}

export const apiService = new ApiService()
