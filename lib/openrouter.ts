import OpenAI from 'openai'

interface OpenRouterConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CodeCompletionRequest {
  code: string
  language: string
  cursor?: {
    line: number
    column: number
  }
}

interface CodeGenerationRequest {
  prompt: string
  language?: string
  context?: string
}

class OpenRouterService {
  private openai: OpenAI
  private config: OpenRouterConfig

  constructor(config: OpenRouterConfig) {
    this.config = {
      model: config.model || process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1:free',
      temperature: 0.1,
      maxTokens: 4000,
      ...config
    }

    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      dangerouslyGetBrowser: true,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://webstudio.aiappsy.com',
        'X-Title': 'AiAppsy WebStudio',
      }
    })
  }

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenRouter chat completion error:', error)
      throw error
    }
  }

  async codeCompletion(request: CodeCompletionRequest): Promise<string> {
    const prompt = `You are a code completion AI. Complete the following code at the cursor position.

Language: ${request.language}
Code up to cursor:
\`\`\`${request.language}
${request.code}
\`\`\`

Cursor position: Line ${request.cursor?.line || 1}, Column ${request.cursor?.column || 1}

Provide only the completion code, no explanations:`

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful code completion assistant. Provide concise, accurate code completions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenRouter code completion error:', error)
      return ''
    }
  }

  async generateCode(request: CodeGenerationRequest): Promise<string> {
    const prompt = `Generate code based on the following request:

${request.prompt}
${request.context ? `Context:\n${request.context}` : ''}

Language: ${request.language || 'JavaScript'}

Provide only the code, no explanations:`

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful code generation assistant. Generate clean, functional code based on requirements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenRouter code generation error:', error)
      return ''
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    const prompt = `Explain the following code:

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Provide a clear explanation of what this code does:`

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful code explanation assistant. Provide clear, educational explanations of code.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenRouter code explanation error:', error)
      return ''
    }
  }

  async debugCode(code: string, language: string, error: string): Promise<string> {
    const prompt = `Debug the following code:

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Error: ${error}

Identify the issue and provide the corrected code:`

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful debugging assistant. Identify code issues and provide solutions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2500,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenRouter debugging error:', error)
      return ''
    }
  }
}

export default OpenRouterService
export type {
  OpenRouterConfig,
  ChatMessage,
  CodeCompletionRequest,
  CodeGenerationRequest
}