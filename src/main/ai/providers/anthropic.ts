import Anthropic from '@anthropic-ai/sdk'
import { BaseAIProvider, AIMessage } from './base'

export class AnthropicProvider extends BaseAIProvider {
  async sendMessage(messages: AIMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API Key is not configured.')
    }

    try {
      const anthropic = new Anthropic({ apiKey: this.config.apiKey })
      
      const systemMessage = messages.find((m) => m.role === 'system')
      const chatMessages = messages.filter((m) => m.role !== 'system')

      const response = await anthropic.messages.create({
        model: this.config.model || 'claude-3-5-sonnet-20240620',
        max_tokens: 1500,
        ...(systemMessage ? { system: systemMessage.content } : {}),
        messages: chatMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })

      const firstBlock = response.content[0]
      if (firstBlock && firstBlock.type === 'text') {
        return firstBlock.text
      }
      throw new Error('No text content block found in Anthropic response.')
    } catch (e: any) {
      console.error('Anthropic Provider Error:', e)
      throw new Error(`Anthropic API Error: ${e.message || e}`)
    }
  }
}
