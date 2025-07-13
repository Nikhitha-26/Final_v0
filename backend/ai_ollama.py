# Gemini API call function
async def call_gemini(prompt: str, system_prompt: str = None) -> str:
    """Call Google Gemini Pro API (v1 endpoint)"""
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {
        "Content-Type": "application/json"
    }
    # Gemini v1 expects a single user prompt in 'parts'
    parts = []
    if system_prompt:
        parts.append({"text": system_prompt})
    parts.append({"text": prompt})
    payload = {
        "contents": [
            {
                "parts": parts
            }
        ]
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=payload) as resp:
            data = await resp.json()
            if resp.status == 200 and "candidates" in data:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                return f"AI Agni error: {data.get('error', {}).get('message', 'Unknown error')}"
import json
import os
import aiohttp
from typing import List, Dict

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct"

async def call_openrouter(prompt: str, system_prompt: str = None) -> str:
    """Call OpenRouter API with Google: Gemma 3n 2B"""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.7
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=payload) as resp:
            data = await resp.json()
            if resp.status == 200 and "choices" in data:
                return data["choices"][0]["message"]["content"]
            else:
                return f"AI Agni error: {data.get('error', {}).get('message', 'Unknown error')}"

async def get_project_suggestions(query: str) -> List[Dict]:
    """Get 5 project suggestions based on query"""
    prompt = f"Based on the query '{query}', suggest 5 innovative project ideas. Format your response as a JSON array with objects containing: title, description, difficulty (beginner/intermediate/advanced), technologies (array), estimated_time."
    system_prompt = "You are an expert project mentor. Always return only valid JSON as described."
    response = await call_gemini(prompt, system_prompt)
    try:
        suggestions = json.loads(response)
        return suggestions
    except Exception:
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
    prompt = f"For the query '{query}', suggest 5 real websites or platforms that would be relevant. Format as JSON array with: name, url, description, category."
    system_prompt = "You are a helpful assistant. Always return only valid JSON as described."
    response = await call_gemini(prompt, system_prompt)
    try:
        return json.loads(response)
    except Exception:
        return []

async def get_domain_ideas(domain: str) -> List[Dict]:
    """Get 10 new ideas based on selected domain"""
    prompt = f"Generate 10 creative project ideas for the domain '{domain}'. Focus on innovative, practical projects that students can build. Format as JSON array with title, description, and key_features."
    system_prompt = "You are an expert project mentor. Always return only valid JSON as described."
    response = await call_gemini(prompt, system_prompt)
    try:
        return json.loads(response)
    except Exception:
        return []

async def improve_idea(idea: str) -> Dict:
    """Suggest improvements for a project idea"""
    prompt = f"Analyze this project idea and suggest improvements: '{idea}'. Provide suggestions for: technical enhancements, feature additions, best practices, potential challenges and solutions. Format as JSON with keys: improvements, technical_suggestions (array), feature_suggestions (array)."
    system_prompt = "You are an expert project reviewer. Always return only valid JSON as described."
    response = await call_gemini(prompt, system_prompt)
    try:
        data = json.loads(response)
        return {
            "original_idea": idea,
            "improvements": data.get("improvements", ""),
            "technical_suggestions": data.get("technical_suggestions", []),
            "feature_suggestions": data.get("feature_suggestions", [])
        }
    except Exception:
        return {
            "original_idea": idea,
            "improvements": response,
            "technical_suggestions": [],
            "feature_suggestions": []
        }

async def chat_with_ollama(message: str) -> str:
    """Chat with Ollama for general help"""
    prompt = f"User message: '{message}'. Provide a helpful, concise response related to project development, programming, or academic guidance."
    system_prompt = "You are a helpful assistant for a project marketplace platform."
    response = await call_gemini(prompt, system_prompt)
    return response
