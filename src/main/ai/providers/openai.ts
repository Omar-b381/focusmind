import OpenAI from 'openai'
import { BaseAIProvider, AIMessage } from './base'

export class OpenAIProvider extends BaseAIProvider {
  async sendMessage(messages: AIMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API Key is not configured.')
    }

    try {
      const openai = new OpenAI({ apiKey: this.config.apiKey })
      
      const response = await openai.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content
        }))
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty response from OpenAI API.')
      }
      return content
    } catch (e: any) {
      console.error('OpenAI Provider Error:', e)
      throw new Error(`OpenAI API Error: ${e.message || e}`)
    }
  }
}
