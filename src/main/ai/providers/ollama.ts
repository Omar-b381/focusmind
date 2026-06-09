import { BaseAIProvider, AIMessage } from './base'

export class OllamaProvider extends BaseAIProvider {
  async sendMessage(messages: AIMessage[]): Promise<string> {
    const endpoint = this.config.customEndpoint || 'http://localhost:11434'
    const model = this.config.model || 'llama3'

    try {
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content
          })),
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
      }

      const data: any = await response.json()
      const content = data.message?.content
      if (!content) {
        throw new Error('Empty response from Ollama API.')
      }

      return content
    } catch (e: any) {
      console.error('Ollama Provider Error:', e)
      throw new Error(`Ollama Local API Error: ${e.message || e}`)
    }
  }
}
