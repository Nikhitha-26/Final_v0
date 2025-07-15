"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import LoadingSpinner from "../components/LoadingSpinner"

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { addToast } = useToast()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      addToast("Login successful!", "success")
    } catch (error) {
      addToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 8px 32px 0 rgba(244,124,32,0.12)',
          padding: 32,
          // border removed
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img src="/REVAUniversitylogo.png" alt="REVA University Logo" style={{ height: 56, marginBottom: 8 }} />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#ff7300',
              textAlign: 'center',
              textShadow: '0 1px 0 #fff8f1',
              margin: 0,
            }}
          >
            UniProject Hub
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            style={{
              marginTop: 4,
              textAlign: 'center',
              fontSize: 18,
              color: '#ff7300',
              fontWeight: 500,
            }}
          >
            University Project Marketplace
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: 8, textAlign: 'center', fontSize: 18, color: '#23272f' }}
          >
            Sign in to your account
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          onSubmit={handleSubmit}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 600, color: '#23272f', marginBottom: 6 }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #ffb366',
                  borderRadius: 8,
                  fontSize: 16,
                  outline: 'none',
                  marginBottom: 0,
                  background: '#f9fafb',
                  color: '#23272f',
                  boxSizing: 'border-box',
                }}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontWeight: 600, color: '#23272f', marginBottom: 6 }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #ffb366',
                  borderRadius: 8,
                  fontSize: 16,
                  outline: 'none',
                  marginBottom: 0,
                  background: '#f9fafb',
                  color: '#23272f',
                  boxSizing: 'border-box',
                }}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 0',
                background: loading ? '#ffd8b0' : '#ff7300',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 18,
                boxShadow: '0 2px 8px #ff73001a',
                border: 'none',
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#2563eb'; }}
              onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#ff7300'; }}
            >
              {loading ? <LoadingSpinner size="sm" /> : "Sign in"}
            </motion.button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Link
              to="/register"
              style={{
                fontWeight: 500,
                color: '#2563eb',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => (e.target.style.color = '#ff7300')}
              onMouseOut={e => (e.target.style.color = '#2563eb')}
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default LoginPage
