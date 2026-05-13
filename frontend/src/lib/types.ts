export type TargetModel = 'general' | 'gpt' | 'claude'
export type PromptCategory = 'coding' | 'writing' | 'analysis' | 'marketing' | 'general'
export type BillingCycle = 'monthly' | 'yearly'
export type PaymentProvider = 'stripe' | 'paymob'
export type PaymentMethod = 'card' | 'wallet'

export interface ApiEnvelope<T = unknown> {
  success?: boolean
  code?: number
  status?: string
  message?: string
  token?: string
  data?: T
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  usage?: TokenUsage
}

export interface UserProfile {
  _id: string
  name?: string
  fullname?: string
  username?: string
  email: string
  avatar?: string
  picture?: string
  plan?: string
  tokens?: {
    used: number
    limit: number
    lastResetAt?: string
  }
}

export interface PromptAnalysis {
  category: PromptCategory
  complexity: string
  gaps?: Array<{ element: string; severity: string }>
  rulesApplied?: string[]
  learnedFromPast?: boolean
}

export interface OptimizeResult {
  promptId?: string
  _id?: string
  original?: string
  originalText?: string
  optimized?: string
  optimizedText?: string
  score?: number
  suggestions?: string[]
  analysis?: PromptAnalysis
  targetModel?: TargetModel
  category?: PromptCategory
  userScore?: number
  createdAt?: string
}

export interface TokenUsage {
  tokensUsed?: number
  tokensRemaining?: number
  dailyLimit?: number
  resetsAt?: string
  used?: number
  limit?: number
  remaining?: number
}

export interface TemplateItem {
  _id: string
  name: string
  category: PromptCategory
  description?: string
  systemPrompt?: string
  exampleInput?: string
  exampleOutput?: string
}

export interface PlanItem {
  _id: string
  name: string
  displayName?: string
  price?: {
    monthly?: number
    yearly?: number
  }
  tokensPerDay?: number
  features?: string[]
  limits?: {
    historyRetention?: number | string
    rateLimit?: number
    targetModels?: TargetModel[]
    customTemplates?: boolean
  }
}

export interface NotificationItem {
  _id?: string
  id?: string
  type: string
  title: string
  message: string
  seen?: boolean
  createdAt?: string
}

export interface RequestState {
  loading: boolean
  error: string
  ok: string
}
