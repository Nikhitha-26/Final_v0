"use client"
import { motion } from "framer-motion"

function LoadingSpinner({ size = "md", color = "indigo" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  const colorClasses = {
    indigo: "border-indigo-600",
    purple: "border-purple-600",
    blue: "border-blue-600",
    green: "border-green-600",
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
      />
    </div>
  )
}

export default LoadingSpinner
