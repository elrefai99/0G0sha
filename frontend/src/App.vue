<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AccountPanel from '@/components/AccountPanel.vue'
import AuthPanel from '@/components/AuthPanel.vue'
import PromptWorkbench from '@/components/PromptWorkbench.vue'
import ResourcePanel from '@/components/ResourcePanel.vue'
import { useSession } from '@/composables/useSession'

type ViewKey = 'workbench' | 'resources' | 'account'

const session = useSession()
const activeView = ref<ViewKey>('workbench')

const views: Array<{ key: ViewKey; label: string }> = [
  { key: 'workbench', label: 'Workbench' },
  { key: 'resources', label: 'Resources' },
  { key: 'account', label: 'Account' },
]

const userLabel = computed(() => {
  const user = session.user.value
  return user?.fullname || user?.name || user?.username || user?.email || 'Guest'
})

onMounted(() => {
  if (session.token.value) {
    void session.loadProfile()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-ink-900">
    <header class="sticky top-0 z-20 border-b border-gray-200 bg-white/92 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="grid h-10 w-10 place-items-center rounded-lg bg-ink-900 text-sm font-900 text-white">0G</div>
          <div>
            <h1 class="text-lg font-900 leading-tight text-ink-900">0Gosha Console</h1>
            <p class="text-xs text-gray-500">Rule-based prompt optimization workspace</p>
          </div>
        </div>

        <nav class="flex flex-wrap items-center gap-2">
          <button
            v-for="view in views"
            :key="view.key"
            class="tab"
            :class="activeView === view.key ? 'tab-active' : ''"
            @click="activeView = view.key"
          >
            {{ view.label }}
          </button>
        </nav>

        <div class="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2">
          <span class="h-2.5 w-2.5 rounded-full" :class="session.isAuthenticated.value ? 'bg-signal-500' : 'bg-ember-400'" />
          <span class="max-w-48 truncate text-sm font-700 text-gray-700">{{ userLabel }}</span>
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-7xl gap-4 px-4 py-5">
      <section class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="panel-dark overflow-hidden p-5 text-white">
          <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
            <div>
              <p class="text-xs font-700 uppercase tracking-wide text-gray-400">Backend aware</p>
              <h2 class="mt-2 text-2xl font-900 leading-tight">Optimize, rate, and manage prompts from one focused console.</h2>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                Built against this repository's Express API: auth, profile, prompt optimization, templates, subscriptions, and notifications.
              </p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-lg border border-white/10 bg-white/5 p-3">
                <p class="text-xs text-gray-400">Routes</p>
                <p class="mt-1 text-2xl font-900">8</p>
              </div>
              <div class="rounded-lg border border-white/10 bg-white/5 p-3">
                <p class="text-xs text-gray-400">Models</p>
                <p class="mt-1 text-2xl font-900">3</p>
              </div>
              <div class="rounded-lg border border-white/10 bg-white/5 p-3">
                <p class="text-xs text-gray-400">Rules</p>
                <p class="mt-1 text-2xl font-900">7</p>
              </div>
              <div class="rounded-lg border border-white/10 bg-white/5 p-3">
                <p class="text-xs text-gray-400">Billing</p>
                <p class="mt-1 text-2xl font-900">Tokens</p>
              </div>
            </div>
          </div>
        </div>

        <AuthPanel @authenticated="activeView = 'workbench'" />
      </section>

      <PromptWorkbench v-if="activeView === 'workbench'" />
      <ResourcePanel v-else-if="activeView === 'resources'" />
      <AccountPanel v-else />
    </main>
  </div>
</template>
