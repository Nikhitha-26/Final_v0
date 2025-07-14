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
    import re
    # Try to extract JSON from markdown or plain text
    match = re.search(r'```json([\s\S]*?)```', response)
    json_str = None
    if match:
        json_str = match.group(1).strip()
    else:
        # Try to find first [ ... ] or { ... }
        match = re.search(r'(\[.*\]|\{.*\})', response, re.DOTALL)
        if match:
            json_str = match.group(1)
    try:
        suggestions = json.loads(json_str if json_str else response)
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
    """Get 5 websites that sell projects and check if they sell the queried project"""
    prompt = (
        f"Check the following websites: https://projectbazaar.in/, https://www.buyprojectcode.in/, https://www.pantechsolutions.net/, https://takeoffprojects.com/, https://www.projectsforyou.com/, https://www.fiverr.com/, https://www.upwork.com/, https://github.com/ and other similar platforms where students can buy, sell, or find academic/engineering projects. "
        f"For the query '{query}', search each website and indicate if they are selling or offering this particular project or something very similar. "
        f"For each, return: name, url (as a hyperlink if possible), description, category, and a field 'sells_project' (true/false), and a short note on match/finding. "
        f"If you cannot find the project on a site, say so in the note. Format your response as a JSON array as described."
    )
    system_prompt = "You are a helpful assistant. Always return only valid JSON as described."
    response = await call_gemini(prompt, system_prompt)
    import re
    # Try to extract JSON from markdown or plain text
    match = re.search(r'```json([\s\S]*?)```', response)
    json_str = None
    if match:
        json_str = match.group(1).strip()
    else:
        # Try to find first [ ... ] or { ... }
        match = re.search(r'(\[.*\]|\{.*\})', response, re.DOTALL)
        if match:
            json_str = match.group(1)
    try:
        data = json.loads(json_str if json_str else response)
        # Always return as array
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return [data]
        else:
            return [{"name": "AI Response", "description": str(data)}]
    except Exception:
        return [{"name": "AI Response", "description": response}]

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
    import re
    match = re.search(r'```json([\s\S]*?)```', response)
    json_str = None
    if match:
        json_str = match.group(1).strip()
    else:
        match = re.search(r'(\{.*\})', response, re.DOTALL)
        if match:
            json_str = match.group(1)
    def flatten_any_improvement(data):
        # Recursively flatten any nested 'improvement' key
        while isinstance(data, dict) and "improvement" in data and isinstance(data["improvement"], dict):
            data = data["improvement"]
        return data
    try:
        data = json.loads(json_str if json_str else response)
        data = flatten_any_improvement(data)
        return {
            "original_idea": data.get("original_idea", idea),
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
