import { authService } from "./authService"

const API_BASE_URL = "http://localhost:5000/api"

class ApiService {
  // General POST request wrapper
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
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || "Request failed")
    }

    return response.json()
  }

  // ---------- AI Endpoints ----------
  async getRelevantWebsites(query) {
    return this.makeRequest("/ai/websites", {
      method: "POST",
      body: JSON.stringify({ query }),
    })
  }

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

  // ---------- Search Endpoint ----------
  async searchProjects(query) {
    return this.makeRequest("/search/projects", {
      method: "POST",
      body: JSON.stringify({ query }),
    })
  }

  // ---------- File Upload ----------
  async uploadFile(file, title, description, student_name, student_id, abstract) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("description", description)
    formData.append("student_name", student_name)
    formData.append("student_id", student_id)
    formData.append("abstract", abstract)

    const token = localStorage.getItem("access_token")
    if (!token) {
      throw new Error("Not authenticated: Please log in again.")
    }

    console.log("Token used for upload:", token)

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type for FormData; the browser does it
      },
      body: formData,
    })

    if (response.status === 401) {
      // Remove invalid token if unauthorized
      localStorage.removeItem("access_token")
      localStorage.removeItem("user_data")
      throw new Error("Session expired or unauthorized. Please log in again.")
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || "File upload failed")
    }

    return response.json()
  }

  // ---------- Get all submissions ----------
  async getSubmissions() {
    return this.makeRequest("/files/submissions")
  }

  // ---------- Download file by ID or file_url ----------
  async downloadFile(fileKey) {
    const token = localStorage.getItem("access_token")
    if (!token) throw new Error("Not authenticated. Please log in again.")

    console.log("Token used for download:", token)

    const response = await fetch(`${API_BASE_URL}/files/download/${fileKey}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 404) {
      throw new Error("File not found")
    }

    if (response.status === 401) {
      throw new Error("Unauthorized. Please re-login.")
    }

    if (!response.ok) {
      throw new Error("Download failed")
    }

    return response.blob()
  }
}

export const apiService = new ApiService()
