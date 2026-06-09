import OpenAI from 'openai'
import { BaseAIProvider, AIMessage } from './base'

export class OpenRouterProvider extends BaseAIProvider {
  async sendMessage(messages: AIMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API Key is not configured.')
    }

    try {
      const openai = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://github.com/Omar-b381/focusmind',
          'X-Title': 'FocusMind ADHD Manager'
        }
      })

      const response = await openai.chat.completions.create({
        model: this.config.model || 'meta-llama/llama-3-8b-instruct:free',
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content
        }))
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty response from OpenRouter API.')
      }
      return content
    } catch (e: any) {
      console.error('OpenRouter Provider Error:', e)
      throw new Error(`OpenRouter API Error: ${e.message || e}`)
    }
  }
}
