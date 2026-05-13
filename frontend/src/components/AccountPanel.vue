<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { useSession } from '@/composables/useSession'
import { api, readApiError } from '@/lib/api'
import type { TokenUsage } from '@/lib/types'

const session = useSession()
const usage = ref<TokenUsage | null>(null)
const selectedFile = ref<File | null>(null)
const form = reactive({ fullname: '', username: '' })
const loading = reactive({ profile: false, usage: false })
const message = ref('')
const error = ref('')

const displayName = computed(() => session.user.value?.fullname || session.user.value?.name || session.user.value?.username || '0Gosha user')
const avatar = computed(() => session.user.value?.avatar || session.user.value?.picture || '')
const used = computed(() => usage.value?.used ?? usage.value?.tokensUsed ?? session.user.value?.tokens?.used ?? 0)
const limit = computed(() => usage.value?.limit ?? usage.value?.dailyLimit ?? session.user.value?.tokens?.limit ?? 0)
const percent = computed(() => {
  if (!limit.value) return 0
  return Math.min(100, Math.round((used.value / limit.value) * 100))
})

watchEffect(() => {
  form.fullname = session.user.value?.fullname || session.user.value?.name || ''
  form.username = session.user.value?.username || ''
})

async function refreshProfile() {
  error.value = ''
  await session.loadProfile()
}

async function loadUsage() {
  loading.usage = true
  error.value = ''
  try {
    const response = await api.usage()
    usage.value = response.data || null
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.usage = false
  }
}

async function saveProfile() {
  if (!session.user.value?._id) return
  loading.profile = true
  error.value = ''
  message.value = ''
  try {
    const response = await api.updateProfile(session.user.value._id, {
      fullname: form.fullname,
      username: form.username,
      avatar: selectedFile.value,
    })
    session.user.value = response.data || session.user.value
    message.value = 'Profile updated.'
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.profile = false
  }
}
</script>

<template>
  <section class="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
    <aside class="panel p-5">
      <div class="flex items-center gap-3">
        <img v-if="avatar" :src="avatar" alt="" class="h-14 w-14 rounded-full object-cover" />
        <div v-else class="grid h-14 w-14 place-items-center rounded-full bg-ink-900 text-xl font-850 text-white">
          {{ displayName.slice(0, 1).toUpperCase() }}
        </div>
        <div>
          <h2 class="text-lg font-850 text-ink-900">{{ displayName }}</h2>
          <p class="text-sm text-gray-500">{{ session.user.value?.email || 'Not signed in' }}</p>
        </div>
      </div>

      <div class="mt-5 rounded-lg bg-gray-50 p-4">
        <div class="flex items-center justify-between text-sm">
          <span class="font-700 text-gray-700">Daily usage</span>
          <span class="text-gray-500">{{ used }} / {{ limit || 'unknown' }}</span>
        </div>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
          <div class="h-full rounded-full bg-signal-500" :style="{ width: `${percent}%` }" />
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <button class="btn-soft" @click="refreshProfile">Profile</button>
        <button class="btn-soft" :disabled="loading.usage" @click="loadUsage">Usage</button>
      </div>
    </aside>

    <div class="panel p-5">
      <div>
        <p class="text-xs font-700 uppercase tracking-wide text-gray-500">Account</p>
        <h2 class="text-xl font-800 text-ink-900">Profile settings</h2>
      </div>

      <form class="mt-5 grid gap-4 md:grid-cols-2" @submit.prevent="saveProfile">
        <label>
          <span class="mb-1 block text-sm font-650 text-gray-700">Full name</span>
          <input v-model="form.fullname" class="field" />
        </label>
        <label>
          <span class="mb-1 block text-sm font-650 text-gray-700">Username</span>
          <input v-model="form.username" class="field" />
        </label>
        <label class="md:col-span-2">
          <span class="mb-1 block text-sm font-650 text-gray-700">Avatar</span>
          <input class="field" type="file" accept="image/*" @change="selectedFile = ($event.target as HTMLInputElement).files?.[0] || null" />
        </label>
        <div class="flex flex-wrap gap-2 md:col-span-2">
          <button class="btn-primary" :disabled="loading.profile || !session.user.value" type="submit">
            {{ loading.profile ? 'Saving...' : 'Save changes' }}
          </button>
          <button class="btn-ghost" type="button" @click="session.logout()">Logout</button>
        </div>
      </form>

      <p v-if="message" class="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{{ message }}</p>
      <p v-if="error || session.error.value" class="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ error || session.error.value }}
      </p>
    </div>
  </section>
</template>
