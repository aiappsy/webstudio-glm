/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Additional global type declarations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      PORT?: string
      HOSTNAME?: string
      DATABASE_URL: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
      OPENROUTER_API_KEY: string
      OPENROUTER_BASE_URL: string
      OPENROUTER_MODEL: string
      OPENROUTER_DEFAULT_MODEL: string
      OPENROUTER_MODEL_FAST: string
      OPENROUTER_MODEL_SMART: string
      OPENROUTER_MODEL_LOGIC: string
    }
  }
}