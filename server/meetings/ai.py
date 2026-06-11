import json
from django.conf import settings
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_summary_and_action_items(transcript_text: str) -> dict:
    """
    Calls OpenAI to produce a meeting summary and extract structured notes.
    Returns:
      {
        'summary': str,
        'decisions': [str],
        'risks': [str],
        'action_items': [{'title': str, 'description': str}]
      }
    """
    prompt = f"""You are an expert meeting analyst for interior design and construction studios.
Given the following transcript, provide:
1. A concise summary (3-5 sentences) of the key discussion points.
2. A list of decisions made.
3. A list of risks or blockers mentioned.
4. A list of action items. Each action item should have a title and a brief description.

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "...",
  "decisions": ["..."],
  "risks": ["..."],
  "action_items": [
    {{"title": "...", "description": "..."}}
  ]
}}

Transcript:
{transcript_text}
"""

    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[{'role': 'user', 'content': prompt}],
        response_format={'type': 'json_object'},
        temperature=0.3,
    )

    result = json.loads(response.choices[0].message.content)
    return {
        'summary': result.get('summary', ''),
        'decisions': result.get('decisions', []) or [],
        'risks': result.get('risks', []) or [],
        'action_items': result.get('action_items', []) or [],
    }
