<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useSession } from '@/composables/useSession'
import { readApiError } from '@/lib/api'

const emit = defineEmits<{ authenticated: [] }>()
const session = useSession()
const mode = ref<'login' | 'register'>('login')
const form = reactive({
  name: '',
  email: '',
  password: '',
})
const message = ref('')

async function submit() {
  message.value = ''
  try {
    if (mode.value === 'login') {
      await session.login(form.email, form.password)
      message.value = 'Signed in successfully'
    } else {
      await session.register(form.name, form.email, form.password)
      message.value = 'Account created successfully'
    }
    emit('authenticated')
  } catch (error) {
    message.value = readApiError(error)
  }
}
</script>

<template>
  <section class="panel p-5">
    <div class="flex flex-col gap-1">
      <p class="text-xs font-700 uppercase tracking-wide text-gray-500">Access</p>
      <h2 class="text-xl font-800 text-ink-900">API session</h2>
      <p class="text-sm text-gray-600">Use the backend auth endpoints. The access token is stored locally and sent as a Bearer token.</p>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
      <button class="btn" :class="mode === 'login' ? 'bg-white shadow-sm' : 'text-gray-600'" type="button" @click="mode = 'login'">
        Login
      </button>
      <button class="btn" :class="mode === 'register' ? 'bg-white shadow-sm' : 'text-gray-600'" type="button" @click="mode = 'register'">
        Register
      </button>
    </div>

    <form class="mt-5 space-y-3" @submit.prevent="submit">
      <label v-if="mode === 'register'" class="block">
        <span class="mb-1 block text-sm font-650 text-gray-700">Name</span>
        <input v-model="form.name" class="field" autocomplete="name" required />
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-650 text-gray-700">Email</span>
        <input v-model="form.email" class="field" type="email" autocomplete="email" required />
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-650 text-gray-700">Password</span>
        <input v-model="form.password" class="field" type="password" autocomplete="current-password" required />
      </label>
      <button class="btn-primary w-full" :disabled="session.loading.value" type="submit">
        {{ session.loading.value ? 'Working...' : mode === 'login' ? 'Login' : 'Create account' }}
      </button>
    </form>

    <p v-if="message || session.error.value" class="mt-4 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700">
      {{ session.error.value || message }}
    </p>
  </section>
</template>
