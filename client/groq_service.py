from groq import Groq
import logging

logger = logging.getLogger(__name__)

class GroqAIService:
    def __init__(self, api_key):
        self.groq = Groq(api_key=api_key)
        self.conversation_history = []

    def chat(self, user_message, system_prompt=None):
        """Send a chat message to Groq API and get response"""
        messages = []

        if system_prompt:
            messages.append({
                'role': 'system',
                'content': system_prompt
            })

        # Add conversation history
        messages.extend(self.conversation_history)

        # Add new user message
        messages.append({
            'role': 'user',
            'content': user_message
        })

        try:
            completion = self.groq.chat.completions.create(
                messages=messages,
                model='llama-3.3-70b-versatile',
                temperature=0.7,
                max_tokens=8000,
            )

            assistant_message = completion.choices[0].message.content

            # Update conversation history
            self.conversation_history.append({
                'role': 'user',
                'content': user_message
            })
            self.conversation_history.append({
                'role': 'assistant',
                'content': assistant_message
            })

            # Keep history manageable (last 20 messages)
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]

            return assistant_message
        except Exception as e:
            logger.error(f'Groq API error: {e}')
            raise Exception(f'Failed to get AI response: {str(e)}')

    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
