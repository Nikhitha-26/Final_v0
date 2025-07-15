from rapidfuzz import fuzz
from utils.supabase_client import get_supabase_client
from typing import List, Dict

async def search_projects(query: str, threshold: int = 60) -> List[Dict]:
    """Search projects using RapidFuzz with token_sort_ratio"""
    supabase = get_supabase_client()
    
    # Get all projects from database
    projects_response = supabase.table("project_data").select("*").execute()
    projects = projects_response.data
    
    # Perform fuzzy search
    matching_projects = []
    
    for project in projects:
        # Calculate similarity score using correct columns
        title_score = fuzz.token_sort_ratio(query.lower(), project.get('project_title', '').lower())
        abstract_score = fuzz.token_sort_ratio(query.lower(), project.get('abstract', '').lower())

        # Use the higher score
        max_score = max(title_score, abstract_score)

        if max_score >= threshold:
            project['similarity_score'] = max_score
            matching_projects.append(project)
    
    # Sort by similarity score (descending)
    matching_projects.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    return matching_projects

async def add_sample_projects():
    """Add sample projects to database for testing"""
    supabase = get_supabase_client()
    
    sample_projects = [
        {
            "title": "E-commerce Website with React",
            "description": "Full-stack e-commerce platform with user authentication, product catalog, and payment integration",
            "category": "Web Development",
            "difficulty": "intermediate",
            "technologies": ["React", "Node.js", "MongoDB", "Stripe"]
        },
        {
            "title": "Machine Learning Image Classifier",
            "description": "Deep learning model to classify images using TensorFlow and Python",
            "category": "Machine Learning",
            "difficulty": "advanced",
            "technologies": ["Python", "TensorFlow", "OpenCV", "Keras"]
        },
        {
            "title": "Mobile Task Management App",
            "description": "Cross-platform mobile app for task management with offline sync",
            "category": "Mobile Development",
            "difficulty": "intermediate",
            "technologies": ["React Native", "Firebase", "Redux"]
        },
        {
            "title": "IoT Home Automation System",
            "description": "Smart home system with sensor integration and mobile control",
            "category": "IoT",
            "difficulty": "advanced",
            "technologies": ["Arduino", "Raspberry Pi", "Python", "MQTT"]
        },
        {
            "title": "Blockchain Voting System",
            "description": "Secure voting platform using blockchain technology",
            "category": "Blockchain",
            "difficulty": "advanced",
            "technologies": ["Solidity", "Web3.js", "Ethereum", "React"]
        }
    ]
    
    try:
        supabase.table("projects").insert(sample_projects).execute()
        print("Sample projects added successfully")
    except Exception as e:
        print(f"Error adding sample projects: {e}")
