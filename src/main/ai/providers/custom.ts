import OpenAI from 'openai'
import { BaseAIProvider, AIMessage } from './base'

export class CustomProvider extends BaseAIProvider {
  async sendMessage(messages: AIMessage[]): Promise<string> {
    if (!this.config.customEndpoint) {
      throw new Error('Custom OpenAI-compatible Endpoint is not configured.')
    }

    try {
      const openai = new OpenAI({
        apiKey: this.config.apiKey || 'dummy-key',
        baseURL: this.config.customEndpoint
      })

      const response = await openai.chat.completions.create({
        model: this.config.model || 'custom-model',
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content
        }))
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty response from Custom OpenAI-compatible API.')
      }
      return content
    } catch (e: any) {
      console.error('Custom Provider Error:', e)
      throw new Error(`Custom API Error: ${e.message || e}`)
    }
  }
}
