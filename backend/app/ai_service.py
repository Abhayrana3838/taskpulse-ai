"""
AI-Powered Features Service
Uses OpenAI API for intelligent task management
"""
import os
import json
from typing import List, Dict, Optional
from datetime import datetime
from openai import AsyncOpenAI
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from . import models, models_extended

# Load environment variables from .env file
load_dotenv()

# Configure OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))


class AIService:
    """AI-powered features for TaskPulse"""
    
    def __init__(self):
        self.model = "gpt-4"
    
    async def analyze_task_duplicate(self, task_title: str, task_description: str, existing_tasks: List[dict]) -> Dict:
        """
        AI-powered duplicate task detection using OpenAI GPT-4o-mini
        """
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            return {"duplicates": [], "error": "OpenAI API key not configured"}
        
        try:
            system_prompt = """You are a task management AI that detects duplicate or similar tasks. 
            Analyze the similarity between a new task and existing tasks.
            Return ONLY a JSON object with this exact structure:
            {
                "duplicates": [
                    {
                        "task_id": "id of similar task",
                        "similarity_score": 0.85,
                        "reasoning": "brief explanation"
                    }
                ],
                "similarity_threshold": 0.7
            }"""
            
            user_prompt = f"""New Task:
            Title: {task_title}
            Description: {task_description}
            
            Existing Tasks:
            {json.dumps(existing_tasks, indent=2)}
            
            Analyze which existing tasks are similar to the new task. Return JSON only."""
            
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            # Extract JSON from response
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code block
                import re
                json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                    return result
                return {"duplicates": [], "error": "Could not parse AI response"}
            
        except Exception as e:
            print(f"OpenAI Error: {e}")
            return {"duplicates": [], "error": str(e)}
    
    async def estimate_task_time(self, task_title: str, task_description: str, 
                                  similar_tasks_history: List[dict]) -> Dict:
        """
        AI-powered time estimation
        Predicts hours needed based on task complexity and history
        """
        if not openai.api_key:
            return {"estimated_hours": 4, "confidence": 0.5, "error": "OpenAI API key not configured"}
        
        try:
            system_prompt = """You are a project management AI that estimates task duration.
            Consider: complexity, scope, description detail, similar past tasks.
            Return JSON with: estimated_hours, confidence_score (0-1), confidence_interval_low/high, 
            factors (what influenced the estimate)."""
            
            user_prompt = f"""Task to Estimate:
            Title: {task_title}
            Description: {task_description}
            
            Similar Completed Tasks History:
            {json.dumps(similar_tasks_history[:5], indent=2)}
            
            Estimate the hours needed to complete this task."""
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            return {"estimated_hours": 4, "confidence": 0.5, "error": str(e)}
    
    async def recommend_assignee(self, task_title: str, task_description: str, 
                                  team_members: List[dict], workload_data: dict) -> Dict:
        """
        Smart auto-assignment based on skills, workload, and past performance
        """
        if not openai.api_key:
            return {"recommendations": [], "error": "OpenAI API key not configured"}
        
        try:
            system_prompt = """You are a team management AI that recommends the best person for a task.
            Consider: skills match, current workload, past performance on similar tasks, availability.
            Return JSON with: recommended_user_id, match_score (0-1), reason, factors {skills: 0.x, workload: 0.x, performance: 0.x}."""
            
            user_prompt = f"""Task:
            Title: {task_title}
            Description: {task_description}
            
            Team Members:
            {json.dumps(team_members, indent=2)}
            
            Current Workload:
            {json.dumps(workload_data, indent=2)}
            
            Who should be assigned to this task and why?"""
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            return {"recommendations": [], "error": str(e)}
    
    async def analyze_sentiment(self, text: str) -> Dict:
        """
        Sentiment analysis for comments and descriptions
        """
        if not openai.api_key:
            return {"sentiment": "neutral", "score": 0, "urgency": "normal"}
        
        try:
            system_prompt = """Analyze the sentiment and urgency of text.
            Return JSON with: sentiment (positive/neutral/negative), score (-1 to 1), 
            urgency_level (low/normal/high/critical), team_mood_indicator."""
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Text: {text}"}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            return {"sentiment": "neutral", "score": 0, "urgency": "normal", "error": str(e)}
    
    async def generate_task_summary(self, task_title: str, description: str, 
                                   comments: List[dict], activities: List[dict]) -> str:
        """
        AI-generated task summary from all activity
        """
        if not openai.api_key:
            return "AI summary not available - OpenAI API key not configured"
        
        try:
            system_prompt = """Generate a concise, professional summary of a task's current state.
            Highlight: progress, blockers, recent activity, next steps. Max 3-4 sentences."""
            
            user_prompt = f"""Task: {task_title}
            Description: {description}
            
            Recent Comments:
            {json.dumps(comments[:5], indent=2)}
            
            Recent Activity:
            {json.dumps(activities[:5], indent=2)}
            
            Provide a summary of the current state."""
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,
                max_tokens=300
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Could not generate summary: {str(e)}"
    
    async def suggest_subtasks(self, task_title: str, description: str) -> List[Dict]:
        """
        AI suggests breaking down a large task into subtasks
        """
        if not openai.api_key:
            return []
        
        try:
            system_prompt = """Break down a large task into logical subtasks.
            Return JSON array with: title, estimated_hours, priority (high/medium/low)."""
            
            user_prompt = f"""Task: {task_title}
            Description: {description}
            
            Break this down into 3-7 subtasks."""
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.5,
                max_tokens=800
            )
            
            result = json.loads(response.choices[0].message.content)
            return result if isinstance(result, list) else []
            
        except Exception as e:
            return []
    
    async def parse_voice_command(self, transcription: str) -> Dict:
        """
        Parse natural language voice commands into structured actions
        """
        if not openai.api_key:
            return {"intent": "unknown", "entities": {}, "error": "OpenAI API key not configured"}
        
        try:
            system_prompt = """Parse voice commands for task management.
            Intents: create_task, update_task, assign_task, change_status, add_comment, list_tasks.
            Return JSON with: intent, confidence, entities {title, assignee, status, priority, due_date}."""
            
            user_prompt = f"Command: {transcription}"
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            return {"intent": "unknown", "entities": {}, "error": str(e)}
    
    async def predict_project_risks(self, project_data: dict, tasks: List[dict]) -> List[Dict]:
        """
        AI risk assessment for projects
        """
        if not openai.api_key:
            return []
        
        try:
            system_prompt = """Analyze project health and predict risks.
            Return JSON array with: risk_type, severity (high/medium/low), description, recommended_action."""
            
            user_prompt = f"""Project Data:
            {json.dumps(project_data, indent=2)}
            
            Tasks:
            {json.dumps(tasks[:20], indent=2)}
            
            Identify potential risks and issues."""
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.4,
                max_tokens=1000
            )
            
            result = json.loads(response.choices[0].message.content)
            return result if isinstance(result, list) else []
            
        except Exception as e:
            return []
    
    async def generate_project_insights(self, project_data: dict, tasks: List[dict], 
                                        team_members: List[dict]) -> List[Dict]:
        """
        Generate AI-powered insights for a project using OpenAI GPT-4
        """
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            return []
        
        try:
            system_prompt = """You are a project management AI expert. Analyze project data and generate actionable insights.
            Return ONLY a JSON array of insights with this exact structure:
            [
                {
                    "title": "Clear insight title",
                    "description": "Detailed description of the insight and recommended action",
                    "insight_type": "risk_assessment|assignment_recommendation|urgency_alert|time_estimate",
                    "confidence_score": 0.85,
                    "priority": "high|medium|low"
                }
            ]
            Generate 2-4 meaningful insights based on the data. Be specific and actionable."""
            
            # Prepare data summary
            def is_overdue(task):
                try:
                    due = task.get('due_date')
                    if not due or task.get('status') == 'done':
                        return False
                    # Handle various date formats
                    if isinstance(due, str):
                        due = due.replace('Z', '+00:00')
                        due_date = datetime.fromisoformat(due)
                    else:
                        return False
                    return due_date < datetime.now()
                except:
                    return False
            
            task_summary = {
                "total": len(tasks),
                "todo": len([t for t in tasks if t.get('status') == 'todo']),
                "in_progress": len([t for t in tasks if t.get('status') == 'in_progress']),
                "done": len([t for t in tasks if t.get('status') == 'done']),
                "overdue": len([t for t in tasks if is_overdue(t)]),
                "unassigned": len([t for t in tasks if not t.get('assignee_id')]),
                "high_priority": len([t for t in tasks if t.get('priority') == 'high' and t.get('status') != 'done']),
            }
            
            user_prompt = f"""Project: {project_data.get('name', 'Unknown')}
            Progress: {project_data.get('progress', 0)}%
            Status: {project_data.get('status', 'unknown')}
            
            Task Summary:
            {json.dumps(task_summary, indent=2)}
            
            Team Members: {len(team_members)}
            
            Recent Tasks (last 5):
            {json.dumps(tasks[:5], indent=2)}
            
            Analyze this data and generate actionable insights. Return JSON only."""
            
            print(f"🤖 Calling OpenAI API for project: {project_data.get('name')}")
            print(f"📊 Task summary: {task_summary}")
            
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.4,
                max_tokens=1500
            )
            
            print(f"✅ OpenAI response received")
            
            content = response.choices[0].message.content
            print(f"📝 Raw response: {content[:200]}...")
            
            # Extract JSON from response
            try:
                insights = json.loads(content)
                # Add IDs and timestamps
                for i, insight in enumerate(insights):
                    insight['id'] = f"ai_{datetime.now().timestamp()}_{i}"
                    insight['created_at'] = datetime.now().isoformat()
                    insight['is_read'] = False
                return insights
            except json.JSONDecodeError:
                # Try to extract JSON from markdown
                import re
                json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
                if json_match:
                    insights = json.loads(json_match.group(1))
                    for i, insight in enumerate(insights):
                        insight['id'] = f"ai_{datetime.now().timestamp()}_{i}"
                        insight['created_at'] = datetime.now().isoformat()
                        insight['is_read'] = False
                    return insights
                print(f"Could not parse AI response: {content}")
                return []
                
        except Exception as e:
            print(f"OpenAI Insights Error: {e}")
            return []

    async def analyze_sentiment(self, text: str) -> Dict:
        """
        Analyze sentiment of text using OpenAI
        """
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            return {"sentiment": "neutral", "score": 0.5}
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Analyze the sentiment of the text. Return JSON with 'sentiment' (positive/negative/neutral) and 'score' (0-1)."},
                    {"role": "user", "content": text}
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            content = response.choices[0].message.content
            try:
                return json.loads(content)
            except:
                return {"sentiment": "neutral", "score": 0.5}
        except Exception as e:
            print(f"Sentiment Analysis Error: {e}")
            return {"sentiment": "neutral", "score": 0.5}

            user_prompt = f"""User: {user_data.get('name')}
            
            Their Tasks:
            {json.dumps(tasks, indent=2)}
            
            Recent Activity:
            {json.dumps(activities[:10], indent=2)}
            
            Write a daily digest for them."""
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.6,
                max_tokens=600
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Could not generate digest: {str(e)}"


# Global AI service instance
ai_service = AIService()
