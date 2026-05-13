import { computed, ref } from 'vue'
import { api, readApiError } from '@/lib/api'
import type { UserProfile } from '@/lib/types'

const token = ref(localStorage.getItem('0gosha:token') || '')
const user = ref<UserProfile | null>(null)
const loading = ref(false)
const error = ref('')

export function useSession() {
  const isAuthenticated = computed(() => Boolean(token.value || user.value))

  async function loadProfile() {
    loading.value = true
    error.value = ''
    try {
      const response = await api.profile()
      user.value = response.data || null
    } catch (err) {
      error.value = readApiError(err)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const response = await api.login({ email, password })
      if (response.token) {
        token.value = response.token
        localStorage.setItem('0gosha:token', response.token)
      }
      await loadProfile()
      return response
    } catch (err) {
      error.value = readApiError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, email: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const response = await api.register({ name, email, password })
      if (response.token) {
        token.value = response.token
        localStorage.setItem('0gosha:token', response.token)
      }
      await loadProfile()
      return response
    } catch (err) {
      error.value = readApiError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.logout()
    } finally {
      token.value = ''
      user.value = null
      localStorage.removeItem('0gosha:token')
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    loadProfile,
    login,
    register,
    logout,
  }
}
