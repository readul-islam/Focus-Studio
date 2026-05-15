import json
from django.conf import settings
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_summary_and_action_items(transcript_text: str) -> dict:
    """
    Calls OpenAI to produce a meeting summary and extract action items.
    Returns: {'summary': str, 'action_items': [{'title': str, 'description': str}]}
    """
    prompt = f"""You are an expert meeting analyst. Given the following meeting transcript, provide:
1. A concise summary (3-5 sentences) of the key discussion points and decisions.
2. A list of action items extracted from the meeting. Each action item should have a title and a brief description.

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "...",
  "action_items": [
    {{"title": "...", "description": "..."}},
    ...
  ]
}}

Meeting Transcript:
{transcript_text}
"""

    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[{'role': 'user', 'content': prompt}],
        response_format={'type': 'json_object'},
        temperature=0.3,
    )

    return json.loads(response.choices[0].message.content)
