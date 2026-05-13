<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { api, readApiError } from '@/lib/api'
import type { OptimizeResult, PromptCategory, TargetModel } from '@/lib/types'

const categories: Array<PromptCategory | 'all'> = ['all', 'coding', 'writing', 'analysis', 'marketing', 'general']
const models: TargetModel[] = ['general', 'gpt', 'claude']

const prompt = ref('write a product launch email for a developer tool')
const targetModel = ref<TargetModel>('general')
const activeCategory = ref<PromptCategory | 'all'>('all')
const score = ref(8)
const result = ref<OptimizeResult | null>(null)
const history = ref<OptimizeResult[]>([])
const loading = reactive({ optimize: false, history: false, rate: false })
const notice = ref('')
const error = ref('')

const optimizedText = computed(() => result.value?.optimized || result.value?.optimizedText || '')
const resultId = computed(() => result.value?.promptId || result.value?._id || '')

async function optimize() {
  loading.optimize = true
  error.value = ''
  notice.value = ''
  try {
    const response = await api.optimize({ text: prompt.value, targetModel: targetModel.value })
    result.value = response.data || null
    notice.value = response.usage
      ? `Used ${response.usage.tokensUsed ?? 0} token. Remaining ${response.usage.tokensRemaining ?? response.usage.remaining ?? 'unknown'}.`
      : 'Prompt optimized successfully.'
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.optimize = false
  }
}

async function analyzeOnly() {
  loading.optimize = true
  error.value = ''
  notice.value = ''
  try {
    const response = await api.analyze({ text: prompt.value, targetModel: targetModel.value })
    result.value = { analysis: response.data as OptimizeResult['analysis'], original: prompt.value }
    notice.value = 'Analysis completed.'
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.optimize = false
  }
}

async function loadHistory() {
  loading.history = true
  error.value = ''
  try {
    const response = await api.history({
      page: 1,
      limit: 12,
      category: activeCategory.value === 'all' ? undefined : activeCategory.value,
    })
    history.value = response.data || []
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.history = false
  }
}

async function rateCurrent() {
  if (!resultId.value) return
  loading.rate = true
  error.value = ''
  try {
    await api.ratePrompt(resultId.value, score.value)
    notice.value = `Rated ${score.value}/10.`
  } catch (err) {
    error.value = readApiError(err)
  } finally {
    loading.rate = false
  }
}

function useHistoryItem(item: OptimizeResult) {
  result.value = item
  prompt.value = item.original || item.originalText || prompt.value
}
</script>

<template>
  <section class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
    <div class="panel p-5">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-700 uppercase tracking-wide text-gray-500">Workbench</p>
          <h2 class="text-xl font-800 text-ink-900">Prompt optimizer</h2>
        </div>
        <select v-model="targetModel" class="field max-w-40">
          <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
        </select>
      </div>

      <textarea v-model="prompt" class="field mt-4 min-h-54 resize-y leading-6" maxlength="5000" />

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button class="btn-primary" :disabled="loading.optimize || !prompt.trim()" @click="optimize">
          {{ loading.optimize ? 'Optimizing...' : 'Optimize' }}
        </button>
        <button class="btn-soft" :disabled="loading.optimize || !prompt.trim()" @click="analyzeOnly">Analyze</button>
        <span class="ml-auto text-sm text-gray-500">{{ prompt.length }}/5000</span>
      </div>

      <p v-if="notice" class="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{{ notice }}</p>
      <p v-if="error" class="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
    </div>

    <div class="panel p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-700 uppercase tracking-wide text-gray-500">Output</p>
          <h2 class="text-xl font-800 text-ink-900">Result</h2>
        </div>
        <div v-if="result?.analysis?.category" class="rounded-md bg-gray-100 px-2 py-1 text-xs font-700 text-gray-700">
          {{ result.analysis.category }}
        </div>
      </div>

      <pre class="mt-4 min-h-54 overflow-auto rounded-lg bg-ink-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap">{{ optimizedText || 'Optimized prompt will appear here.' }}</pre>

      <div v-if="result?.analysis" class="mt-4 grid gap-2 sm:grid-cols-2">
        <div class="metric">
          <p class="text-xs text-gray-500">Complexity</p>
          <p class="font-750 text-ink-900">{{ result.analysis.complexity || 'unknown' }}</p>
        </div>
        <div class="metric">
          <p class="text-xs text-gray-500">Score</p>
          <p class="font-750 text-ink-900">{{ result.score ?? 'not scored' }}</p>
        </div>
      </div>

      <div v-if="resultId" class="mt-4 flex flex-wrap items-center gap-2">
        <input v-model.number="score" class="field max-w-24" type="number" min="1" max="10" />
        <button class="btn-soft" :disabled="loading.rate" @click="rateCurrent">Rate result</button>
      </div>
    </div>
  </section>

  <section class="panel p-5">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-xs font-700 uppercase tracking-wide text-gray-500">Learning loop</p>
        <h2 class="text-xl font-800 text-ink-900">History</h2>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category"
          class="btn"
          :class="activeCategory === category ? 'bg-ink-900 text-white' : 'bg-gray-100 text-gray-700'"
          @click="activeCategory = category; loadHistory()"
        >
          {{ category }}
        </button>
        <button class="btn-soft" :disabled="loading.history" @click="loadHistory">
          {{ loading.history ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="item in history"
        :key="item._id || item.promptId"
        class="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-ink-900"
        @click="useHistoryItem(item)"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="rounded-md bg-gray-100 px-2 py-1 text-xs font-700 text-gray-700">{{ item.category || item.analysis?.category || 'general' }}</span>
          <span class="text-xs text-gray-500">{{ item.userScore ? `${item.userScore}/10` : item.score ? `${item.score}/10` : 'unrated' }}</span>
        </div>
        <p class="mt-3 line-clamp-3 text-sm text-gray-700">{{ item.original || item.originalText }}</p>
      </button>
      <p v-if="!history.length" class="rounded-lg border border-dashed border-gray-300 p-5 text-sm text-gray-500 md:col-span-2 xl:col-span-3">
        Load history after signing in and running optimizations.
      </p>
    </div>
  </section>
</template>
