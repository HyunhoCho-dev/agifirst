import Groq from 'groq-sdk';

export class GroqAIService {
  constructor(apiKey) {
    this.groq = new Groq({ apiKey });
    this.conversationHistory = [];
  }

  async chat(userMessage, systemPrompt = null) {
    const messages = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Add conversation history
    messages.push(...this.conversationHistory);

    // Add new user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      const completion = await this.groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile', // Using available Groq model
        temperature: 0.7,
        max_tokens: 8000,
      });

      const assistantMessage = completion.choices[0].message.content;

      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Keep history manageable (last 10 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return assistantMessage;
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to get AI response: ' + error.message);
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}
