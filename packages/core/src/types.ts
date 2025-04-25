export type Provider = 'postgresql' | 'mongodb'

export interface DatabaseConfig {
  provider: Provider
  url: string
  realtime?: boolean
  realtimePort?: number
  realtimeOrigins?: string[] 
  debug?: boolean
  options?: Record<string, unknown>
}

