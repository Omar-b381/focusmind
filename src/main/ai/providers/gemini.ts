import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseAIProvider, AIMessage } from './base'

export class GeminiProvider extends BaseAIProvider {
  async sendMessage(messages: AIMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Google Gemini API Key is not configured.')
    }

    try {
      const genAI = new GoogleGenerativeAI(this.config.apiKey)
      
      const systemMessage = messages.find((m) => m.role === 'system')
      const chatMessages = messages.filter((m) => m.role !== 'system')

      // Gemini expects contents with 'user' or 'model' role
      const contents = chatMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))

      const modelInstance = genAI.getGenerativeModel({
        model: this.config.model || 'gemini-1.5-flash',
        ...(systemMessage ? { systemInstruction: systemMessage.content } : {})
      })

      const result = await modelInstance.generateContent({
        contents
      })

      const responseText = result.response.text()
      if (!responseText) {
        throw new Error('Empty response received from Gemini API.')
      }

      return responseText
    } catch (e: any) {
      console.error('Gemini Provider Error:', e)
      throw new Error(`Gemini API Error: ${e.message || e}`)
    }
  }
}
