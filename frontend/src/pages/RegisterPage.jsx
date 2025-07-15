import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import LoadingSpinner from "../components/LoadingSpinner"

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  })
  const [loading, setLoading] = useState(false)

  const { register,login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", "error")
      return
    }
    setLoading(true)
    try {
      try {
  await register(formData.fullName, formData.email, formData.password, formData.role)
  await login(formData.email, formData.password)
  addToast("Registered and logged in successfully!", "success")
  navigate("/dashboard") // or wherever your post-login page is
} catch (error) {
  addToast(error.message || "Something went wrong", "error")
}
    } catch (error) {
      addToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] py-12 px-4">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-10 ">
        <div className="flex flex-col items-center mb-8">
  <img
    src="/REVAUniversitylogo.png"
    alt="REVA University Logo"
    className="h-14 mb-2 mx-auto"
  />
  <h1 className="text-2xl font-semibold text-[#e87722] text-center">Join UniProject Hub</h1>
</div>

        <h2 className="text-2xl font-bold text-[#e87722] text-center mb-6">Create Account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-center">
            <RoleCard
              label="Student"
              value="student"
              active={formData.role === "student"}
              onClick={() => setFormData({ ...formData, role: "student" })}
              icon="🎓"
            />
            <RoleCard
              label="Guide/Teacher"
              value="teacher"
              active={formData.role === "teacher"}
              onClick={() => setFormData({ ...formData, role: "teacher" })}
              icon="👩‍🏫"
            />
            <RoleCard
              label="Examiner"
              value="examiner"
              active={formData.role === "examiner"}
              onClick={() => setFormData({ ...formData, role: "examiner" })}
              icon="🧑‍💼"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#e87722] focus:ring-2 focus:ring-[#e87722]/30 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#e87722] focus:ring-2 focus:ring-[#e87722]/30 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#e87722] focus:ring-2 focus:ring-[#e87722]/30 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#e87722] focus:ring-2 focus:ring-[#e87722]/30 bg-gray-50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#e87722] text-white font-semibold text-lg hover:bg-[#d96a1c] transition disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size={20} /> : "Create Account"}
          </button>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-[#e87722] hover:underline font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoleCard({ label, value, active, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-6 py-4 rounded-xl border border-1 transition-all duration-150 font-semibold text-lg shadow-sm hover:shadow-lg focus:outline-none ${
        active ? "border-#fadbc3 bg-[#faeade] text-[#e87722]" : "border-gray-300 bg-white text-gray-700"
      }`}
    >
      <span className="text-3xl mb-2">{icon}</span>
      {label}
    </button>
  )
}

export default RegisterPage