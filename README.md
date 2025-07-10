# Project Marketplace

A complete, production-ready Project Marketplace website built with modern technologies including React, FastAPI, Supabase, and AI integration.

## 🚀 Features

### Authentication & Authorization
- Role-based authentication (Student, Teacher, Examiner)
- Secure JWT token management
- Supabase Auth integration

### Student Dashboard
- **Search Project Ideas**: Flexible keyword search using RapidFuzz
- **AI-Powered Features**: 
  - Get 5 project suggestions based on query
  - Get 5 relevant websites/platforms
  - Get 10 new ideas based on selected domain
- **Improve My Idea**: AI-powered project improvement suggestions
- **Message Teacher**: Direct messaging (placeholder)
- **Chatbot Help**: Animated chat UI powered by Ollama

### Teacher Dashboard
- All student features plus:
- **Upload Project Files**: Upload PDF/DOC/TXT files with metadata
- File storage in Supabase with secure access

### Examiner Dashboard
- **View Submissions**: List all uploaded files with submitter info
- **Download Files**: Secure file download with proper permissions
- **Chatbot Help**: AI assistance for examination tasks

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Supabase**: Backend-as-a-Service (Auth, Database, Storage)
- **Ollama**: Local AI model integration
- **RapidFuzz**: Fuzzy string matching for search
- **Python**: Core backend language

### Frontend
- **React.js**: Modern UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animations and transitions
- **React Router**: Client-side routing

### Database & Storage
- **Supabase PostgreSQL**: Primary database
- **Supabase Storage**: File storage and management
- **Row Level Security**: Database-level security

## 📁 Project Structure

\`\`\`
project_marketplace/
├── backend/                  # FastAPI backend
│   ├── main.py              # Main FastAPI application
│   ├── auth.py              # Authentication logic
│   ├── ai_ollama.py         # AI integration with Ollama
│   ├── search.py            # Search functionality
│   ├── utils/               # Utility functions
│   │   ├── db.py           # Database utilities
│   │   └── file_handler.py # File handling
│   ├── requirements.txt     # Python dependencies
│   └── .env                # Environment variables
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── App.jsx         # Main App component
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind configuration
└── README.md               # This file
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Supabase account
- Ollama installed locally

### Backend Setup

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd project_marketplace/backend
\`\`\`

2. **Create virtual environment**
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

3. **Install dependencies**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. **Environment Configuration**
Create a `.env` file in the backend directory:
\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SECRET_KEY=your_secret_key
OLLAMA_HOST=http://localhost:11434
\`\`\`

5. **Set up Supabase Database**
- Create a new Supabase project
- Run the SQL schema from `utils/db.py`
- Set up Row Level Security policies
- Create storage bucket named "project-files"

6. **Start the backend server**
\`\`\`bash
python main.py
\`\`\`
The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
\`\`\`bash
cd ../frontend
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Start the development server**
\`\`\`bash
npm start
\`\`\`
The frontend will run on `http://localhost:3000`

### Ollama Setup

1. **Install Ollama**
\`\`\`bash
# On macOS
brew install ollama

# On Linux
curl -fsSL https://ollama.ai/install.sh | sh
\`\`\`

2. **Pull a model**
\`\`\`bash
ollama pull llama2
\`\`\`

3. **Start Ollama service**
\`\`\`bash
ollama serve
\`\`\`

## 🗄️ Database Schema

### Tables
- **profiles**: User profiles with role information
- **projects**: Project ideas and metadata
- **files**: Uploaded file metadata
- **messages**: User messaging system

### Storage
- **project-files**: Bucket for uploaded project files

## 🔐 Security Features

- JWT token authentication
- Role-based access control
- Row Level Security (RLS) in Supabase
- Secure file upload and download
- CORS protection
- Input validation and sanitization

## 🎨 UI/UX Features

- Responsive design for all devices
- Smooth animations with Framer Motion
- Loading states and error handling
- Toast notifications
- Drag-and-drop file upload
- Real-time chat interface
- Accessible design patterns

## 🚀 Deployment

### Backend Deployment
1. Set up a cloud server (AWS, DigitalOcean, etc.)
2. Install Python and dependencies
3. Configure environment variables
4. Set up reverse proxy (Nginx)
5. Use process manager (PM2, systemd)

### Frontend Deployment
1. Build the production bundle:
\`\`\`bash
npm run build
\`\`\`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Configure environment variables for production API

### Database
- Supabase handles hosting and scaling automatically
- Configure production environment variables
- Set up proper backup strategies

## 🧪 Testing

### Backend Testing
\`\`\`bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
\`\`\`

### Frontend Testing
\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
\`\`\`

## 📈 Performance Optimization

- **Backend**: Async/await patterns, database indexing, caching
- **Frontend**: Code splitting, lazy loading, image optimization
- **Database**: Query optimization, proper indexing
- **Files**: Compression, CDN integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔮 Future Enhancements

- Real-time messaging with WebSockets
- Advanced AI features
- Mobile app development
- Integration with more AI models
- Advanced analytics dashboard
- Collaborative features
- API rate limiting
- Advanced search filters
- Email notifications
- Social features

---

Built with ❤️ using modern web technologies
