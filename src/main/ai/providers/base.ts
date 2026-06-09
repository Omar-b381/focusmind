export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIProviderConfig {
  apiKey: string
  model: string
  customEndpoint?: string
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  abstract sendMessage(messages: AIMessage[]): Promise<string>
}
