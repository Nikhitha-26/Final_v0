import { Link } from "react-router-dom"

 export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="w-full bg-[#faf9f6] py-12">
        <div className="flex items-center justify-between px-6">
          <div className="w-32"></div>
          <div className="flex justify-center absolute left-1/2 transform -translate-x-1/2">
            <img
              src="/REVAUniversitylogo.png"
              alt="REVA University Logo"
              className="h-24 w-auto"
            />
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <button className="px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#e87722] leading-tight">
            University Project <br />
            Marketplace Platform
          </h1>
          <p className="text-lg md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Centralized platform for universities to store, manage, and review all student major projects with advanced analytics and AI-powered assistance.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#e87722] mb-4">Powerful Features</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Everything you need to manage university projects effectively
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard title="Advanced Search" desc="Find projects with intelligent search and plagiarism detection" icon="🔍" />
          <FeatureCard title="Secure Platform" desc="Enterprise-level security with encrypted storage and access control" icon="🔒" />
          <FeatureCard title="Analytics & Reports" desc="Comprehensive insights and exportable reports for guides" icon="📊" />
          <FeatureCard title="AI Assistant" desc="Get project guidance and suggestions from our AI chatbot" icon="🤖" />
        </div>
      </section>

      {/* Roles Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#e87722] mb-4">Built for Everyone</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Tailored experiences for students, guides, and examiners
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RoleCard title="Students" icon="🎓" desc="Submit, manage, and track your major projects with ease" features={["Project submission", "Progress tracking", "AI guidance", "Collaboration tools"]} />
          <RoleCard title="Guides/Teachers" icon="👩‍🏫" desc="Guide students and monitor project progress effectively" features={["Student monitoring", "Progress reports", "Analytics dashboard", "Feedback tools"]} />
          <RoleCard title="Examiners" icon="🧑‍💼" desc="Evaluate and grade projects with comprehensive tools" features={["Project evaluation", "Grading system", "Report generation", "Quality assurance"]} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center bg-[#e87722] rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white max-w-2xl mx-auto mb-8">
            Join thousands of students, guides, and examiners already using UniProject Hub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="px-8 py-3 rounded-lg bg-white text-[#e87722] text-lg font-semibold hover:bg-[#f7f7f7] transition">Create Account</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-[#e87722]/20">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <img src="/REVAUniversitylogo.png" alt="REVA University Logo" className="h-12 w-auto" />
          </div>
          <p className="text-gray-600">© 2025 REVA University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center space-y-4 hover:shadow-lg transition">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-xl font-semibold text-[#e87722]">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{desc}</p>
    </div>
  )
}

function RoleCard({ title, icon, desc, features }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 space-y-6 hover:shadow-lg transition">
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <h3 className="text-2xl font-semibold text-[#e87722]">{title}</h3>
        </div>
      </div>
      <p className="text-gray-700 leading-relaxed">{desc}</p>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#e87722] rounded-full" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
