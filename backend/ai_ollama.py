import subprocess
import json
import asyncio
from typing import List, Dict

async def call_ollama(prompt: str, model: str = "llama2") -> str:
    """Call Ollama API via subprocess"""
    try:
        cmd = ["ollama", "run", model, prompt]
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            return stdout.decode().strip()
        else:
            raise Exception(f"Ollama error: {stderr.decode()}")
    except Exception as e:
        return f"AI service temporarily unavailable: {str(e)}"

async def get_project_suggestions(query: str) -> List[Dict]:
    """Get 5 project suggestions based on query"""
    prompt = f"""
    Based on the query "{query}", suggest 5 innovative project ideas. 
    Format your response as a JSON array with objects containing:
    - title: Project title
    - description: Brief description
    - difficulty: beginner/intermediate/advanced
    - technologies: Array of suggested technologies
    - estimated_time: Time to complete
    
    Example format:
    [
        {{
            "title": "Smart Home Automation System",
            "description": "IoT-based home automation with mobile app control",
            "difficulty": "intermediate",
            "technologies": ["Python", "Raspberry Pi", "React Native"],
            "estimated_time": "4-6 weeks"
        }}
    ]
    """
    
    response = await call_ollama(prompt)
    
    try:
        # Try to parse JSON response
        suggestions = json.loads(response)
        return suggestions
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return [
            {
                "title": f"Project Idea for {query}",
                "description": response[:200] + "...",
                "difficulty": "intermediate",
                "technologies": ["Python", "JavaScript"],
                "estimated_time": "2-4 weeks"
            }
        ]

async def get_relevant_websites(query: str) -> List[Dict]:
    """Get 5 relevant websites/platforms for the search query"""
    prompt = f"""
    For the query "{query}", suggest 5 real websites or platforms that would be relevant.
    Format as JSON array with:
    - name: Website/platform name
    - url: Website URL
    - description: Why it's relevant
    - category: Type of resource
    """
    
    response = await call_ollama(prompt)
    
    # Fallback data
    return [
        {
            "name": "GitHub",
            "url": "https://github.com",
            "description": "Find open source projects and code examples",
            "category": "Code Repository"
        },
        {
            "name": "Stack Overflow",
            "url": "https://stackoverflow.com",
            "description": "Technical questions and solutions",
            "category": "Q&A Platform"
        }
    ]

async def get_domain_ideas(domain: str) -> List[Dict]:
    """Get 10 new ideas based on selected domain"""
    prompt = f"""
    Generate 10 creative project ideas for the domain "{domain}".
    Focus on innovative, practical projects that students can build.
    Format as JSON array with title, description, and key_features.
    """
    
    response = await call_ollama(prompt)
    
    # Fallback ideas
    return [
        {
            "title": f"{domain} Analytics Dashboard",
            "description": f"Real-time analytics platform for {domain}",
            "key_features": ["Data visualization", "Real-time updates", "User management"]
        }
    ]

async def improve_idea(idea: str) -> Dict:
    """Suggest improvements for a project idea"""
    prompt = f"""
    Analyze this project idea and suggest improvements:
    "{idea}"
    
    Provide suggestions for:
    - Technical enhancements
    - Feature additions
    - Best practices
    - Potential challenges and solutions
    
    Format as JSON with improvement categories.
    """
    
    response = await call_ollama(prompt)
    
    return {
        "original_idea": idea,
        "improvements": response,
        "technical_suggestions": [
            "Consider using microservices architecture",
            "Implement proper error handling",
            "Add comprehensive testing"
        ],
        "feature_suggestions": [
            "Add user authentication",
            "Implement real-time notifications",
            "Create mobile-responsive design"
        ]
    }

async def chat_with_ollama(message: str) -> str:
    """Chat with Ollama for general help"""
    prompt = f"""
    You are a helpful assistant for a project marketplace platform.
    User message: "{message}"
    
    Provide a helpful, concise response related to project development,
    programming, or academic guidance.
    """
    
    response = await call_ollama(prompt)
    return response
