import { BaseAIProvider } from './providers/base'
import { GeminiProvider } from './providers/gemini'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { OllamaProvider } from './providers/ollama'
import { OpenRouterProvider } from './providers/openrouter'
import { CustomProvider } from './providers/custom'

export function getAIProvider(settings: {
  aiProvider: string
  aiModel: string
  aiApiKey: string
  aiCustomEndpoint?: string
}): BaseAIProvider {
  const config = {
    apiKey: settings.aiApiKey,
    model: settings.aiModel,
    customEndpoint: settings.aiCustomEndpoint
  }

  switch (settings.aiProvider) {
    case 'gemini':
      return new GeminiProvider(config)
    case 'openai':
      return new OpenAIProvider(config)
    case 'anthropic':
      return new AnthropicProvider(config)
    case 'ollama':
      return new OllamaProvider(config)
    case 'openrouter':
      return new OpenRouterProvider(config)
    case 'custom':
      return new CustomProvider(config)
    default:
      throw new Error(`Unsupported AI Provider: ${settings.aiProvider}`)
  }
}
