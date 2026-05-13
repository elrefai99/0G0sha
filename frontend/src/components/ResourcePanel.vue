<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { api, readApiError } from '@/lib/api'
import type { NotificationItem, PlanItem, PromptCategory, TemplateItem } from '@/lib/types'

const categories: Array<PromptCategory | 'all'> = ['all', 'coding', 'writing', 'analysis', 'marketing', 'general']
const category = ref<PromptCategory | 'all'>('all')
const templates = ref<TemplateItem[]>([])
const plans = ref<PlanItem[]>([])
const notifications = ref<NotificationItem[]>([])
const loading = reactive({ templates: false, plans: false, notifications: false })
const error = ref('')

async function loadTemplates() {
  loading.templates = true
  error.value = ''
  try {
    const response = await api.templates(category.value === 'all' ? undefined : category.value)
    templates.value = response.data || []
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.templates = false
  }
}

async function loadPlans() {
  loading.plans = true
  error.value = ''
  try {
    const response = await api.plans()
    plans.value = response.data || []
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.plans = false
  }
}

async function loadNotifications() {
  loading.notifications = true
  error.value = ''
  try {
    const response = await api.notifications({ page: 1, limit: 10 })
    notifications.value = response.data || []
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.notifications = false
  }
}

async function markAllSeen() {
  await api.markAllNotificationsSeen()
  await loadNotifications()
}

onMounted(() => {
  void loadTemplates()
  void loadPlans()
})
</script>

<template>
  <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
    <div class="panel p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-700 uppercase tracking-wide text-gray-500">Library</p>
          <h2 class="text-xl font-800 text-ink-900">Templates</h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in categories"
            :key="item"
            class="btn"
            :class="category === item ? 'bg-ink-900 text-white' : 'bg-gray-100 text-gray-700'"
            @click="category = item; loadTemplates()"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <article v-for="template in templates" :key="template._id" class="rounded-lg border border-gray-200 p-4">
          <div class="flex items-center justify-between gap-2">
            <h3 class="font-800 text-ink-900">{{ template.name }}</h3>
            <span class="rounded-md bg-gray-100 px-2 py-1 text-xs font-700 text-gray-700">{{ template.category }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-600">{{ template.description || 'Reusable prompt structure.' }}</p>
          <div v-if="template.exampleInput || template.exampleOutput" class="mt-3 rounded-md bg-gray-50 p-3 text-xs leading-5 text-gray-600">
            <p v-if="template.exampleInput"><strong>Input:</strong> {{ template.exampleInput }}</p>
            <p v-if="template.exampleOutput" class="mt-1"><strong>Output:</strong> {{ template.exampleOutput }}</p>
          </div>
        </article>
        <p v-if="!templates.length" class="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-500 md:col-span-2">
          {{ loading.templates ? 'Loading templates...' : 'No templates returned yet.' }}
        </p>
      </div>
    </div>

    <aside class="space-y-4">
      <div class="panel p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-700 uppercase tracking-wide text-gray-500">Billing</p>
            <h2 class="text-xl font-800 text-ink-900">Plans</h2>
          </div>
          <button class="btn-soft" :disabled="loading.plans" @click="loadPlans">Refresh</button>
        </div>

        <div class="mt-4 space-y-3">
          <article v-for="plan in plans" :key="plan._id" class="rounded-lg border border-gray-200 p-4">
            <h3 class="font-800 text-ink-900">{{ plan.displayName || plan.name }}</h3>
            <p class="mt-1 text-sm text-gray-600">{{ plan.tokensPerDay ?? 0 }} tokens/day</p>
            <p class="mt-2 text-lg font-850 text-ink-900">
              ${{ ((plan.price?.monthly || 0) / 100).toFixed(0) }}<span class="text-sm font-500 text-gray-500">/mo</span>
            </p>
          </article>
          <p v-if="!plans.length" class="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            {{ loading.plans ? 'Loading plans...' : 'No plans returned yet.' }}
          </p>
        </div>
      </div>

      <div class="panel p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-700 uppercase tracking-wide text-gray-500">Inbox</p>
            <h2 class="text-xl font-800 text-ink-900">Notifications</h2>
          </div>
          <button class="btn-soft" :disabled="loading.notifications" @click="loadNotifications">Load</button>
        </div>

        <div class="mt-4 space-y-3">
          <article v-for="item in notifications" :key="item._id || item.id" class="rounded-lg border border-gray-200 p-3">
            <div class="flex items-center justify-between gap-2">
              <p class="font-750 text-ink-900">{{ item.title }}</p>
              <span class="text-xs text-gray-500">{{ item.type }}</span>
            </div>
            <p class="mt-1 text-sm text-gray-600">{{ item.message }}</p>
          </article>
          <p v-if="!notifications.length" class="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            {{ loading.notifications ? 'Loading notifications...' : 'No notifications loaded.' }}
          </p>
        </div>
        <button class="btn-ghost mt-3 w-full" @click="markAllSeen">Mark all seen</button>
      </div>
    </aside>
  </section>

  <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
</template>
