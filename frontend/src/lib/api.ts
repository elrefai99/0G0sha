import type {
  ApiEnvelope,
  BillingCycle,
  NotificationItem,
  OptimizeResult,
  PaymentMethod,
  PaymentProvider,
  PlanItem,
  PromptCategory,
  TargetModel,
  TemplateItem,
  TokenUsage,
  UserProfile,
} from './types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const API_VERSION = `${API_BASE_URL}/v1`

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const body = init.body

  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = localStorage.getItem('0gosha:token')
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_VERSION}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload
      ? String((payload as { message: unknown }).message)
      : response.statusText
    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}

export const api = {
  register(input: { name: string; email: string; password: string }) {
    return request<ApiEnvelope>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  login(input: { email: string; password: string }) {
    return request<ApiEnvelope>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  logout() {
    return request<ApiEnvelope>('/auth/logout', { method: 'POST' })
  },

  profile() {
    return request<ApiEnvelope<UserProfile>>('/users/profile')
  },

  updateProfile(id: string, input: { fullname?: string; username?: string; avatar?: File | null }) {
    const form = new FormData()
    if (input.fullname) form.set('fullname', input.fullname)
    if (input.username) form.set('username', input.username)
    if (input.avatar) form.set('avatar', input.avatar)

    return request<ApiEnvelope<UserProfile>>(`/users/profile/${id}`, {
      method: 'PUT',
      body: form,
    })
  },

  optimize(input: { text: string; targetModel: TargetModel }) {
    return request<ApiEnvelope<OptimizeResult>>('/prompts/optimize', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  analyze(input: { text: string; targetModel?: TargetModel }) {
    return request<ApiEnvelope>('/agent/analyze', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  history(input: { page?: number; limit?: number; category?: PromptCategory }) {
    const params = new URLSearchParams()
    if (input.page) params.set('page', String(input.page))
    if (input.limit) params.set('limit', String(input.limit))
    if (input.category) params.set('category', input.category)
    return request<ApiEnvelope<OptimizeResult[]>>(`/prompts/history?${params}`)
  },

  ratePrompt(id: string, score: number) {
    return request<ApiEnvelope>(`/prompts/${id}/rate`, {
      method: 'PATCH',
      body: JSON.stringify({ score }),
    })
  },

  templates(category?: PromptCategory) {
    const params = category ? `?category=${category}` : ''
    return request<ApiEnvelope<TemplateItem[]>>(`/templates${params}`)
  },

  plans() {
    return request<ApiEnvelope<PlanItem[]>>('/subscriptions/plans')
  },

  usage() {
    return request<ApiEnvelope<TokenUsage>>('/subscriptions/usage')
  },

  upgrade(input: { planId: string; billing: BillingCycle; provider: PaymentProvider; method?: PaymentMethod }) {
    return request<ApiEnvelope>('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  cancel(reason?: string) {
    return request<ApiEnvelope>('/subscriptions/cancel', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  },

  notifications(input: { page?: number; limit?: number; seen?: 'true' | 'false' } = {}) {
    const params = new URLSearchParams()
    if (input.page) params.set('page', String(input.page))
    if (input.limit) params.set('limit', String(input.limit))
    if (input.seen) params.set('seen', input.seen)
    return request<ApiEnvelope<NotificationItem[]>>(`/notifications?${params}`)
  },

  markNotificationSeen(id: string) {
    return request<ApiEnvelope>(`/notifications/${id}/seen`, { method: 'PATCH' })
  },

  markAllNotificationsSeen() {
    return request<ApiEnvelope>('/notifications/seen-all', { method: 'PATCH' })
  },
}

export function readApiError(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}
