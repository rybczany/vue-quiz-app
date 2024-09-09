<script setup lang="ts">
import { computed, ref } from 'vue'
import VuePlotly from 'vue3-plotly-ts'
import Plotly from 'plotly.js-dist-min'
import { useQuizStore } from '@/stores/quiz'

//-------------------------------------------

const quizStore = useQuizStore()
const latestQuizIndex = ref<number>(quizStore.userResults.length - 1)
const historicalDataLength = ref<number>(6)
const correctAnwersCount = computed(() => quizStore.userResults[latestQuizIndex.value].correctAnswers)
const incorrectAnwersCount = computed(() => quizStore.userResults[latestQuizIndex.value].incorrectAnswers)
const userHistoricalResults = computed(() =>
  quizStore.userResults.slice(0, latestQuizIndex.value).reverse()
)

const historicalData: Plotly.Data[][] = userHistoricalResults.value.slice(0, historicalDataLength.value).map((result) => {
  return [
    {
      labels: ['Incorrect answers', 'Correct answers'],
      values: [result.incorrectAnswers, result.correctAnswers],
      type: 'pie',
      marker: { colors: ['#ff0000', '#3b82f6'] }
    }
  ]
})

const historicalDataLayout = ref<Partial<Plotly.Layout>>({
  height: 300,
  width: 450
})

const data: Plotly.Data[] = [
  {
    x: ['Latest quiz'],
    y: [correctAnwersCount.value],
    name: 'Correct answers',
    type: 'bar',
    marker: {
      color: '#3b82f6'
    }
  },
  {
    x: ['Latest quiz'],
    y: [incorrectAnwersCount.value],
    name: 'Incorrect answers',
    type: 'bar',
    marker: {
      color: '#ff0000'
    }
  }
]

const layout = ref<Partial<Plotly.Layout>>({
  height: 400,
  width: 900
})

const showHistoricalQuizzes = () => {
  document.getElementById('bottom-section')!.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="upper-section flex gap-1 flex-col items-center relative h-screen justify-center p-10">
    <h1 class="text-6xl text-center">Quiz summary</h1>
    <VuePlotly :data="data" :layout="layout" />
    <h2 class="-mt-10 z-10">
      Quiz time: {{ quizStore.userResults[latestQuizIndex].quizDuration.toFixed(1) }} s
    </h2>
    <button
      v-if="userHistoricalResults.length"
      @click="showHistoricalQuizzes"
      class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow absolute bottom-10 left-10"
    >
      <i class="pi pi-arrow-down text-4xl"></i>
    </button>
  </div>
  <div id="bottom-section" class="bottom-section p-10 min-h-screen" v-if="userHistoricalResults.length">
    <h2 class="text-4xl text-center">Previous quizzes</h2>
    <div class="bottom-section__charts flex flex-wrap">
      <div v-for="(quiz, index) in historicalData" :key="index">
        <VuePlotly :data="quiz" :layout="historicalDataLayout" />
        <p class="relative text-center -mt-12 z-10">
          Quiz time: {{ userHistoricalResults[index].quizDuration.toFixed(1) }} s <br>
          Quiz end date: {{ userHistoricalResults[index].quizEndDate }}
        </p>
      </div>
    </div>
  </div>
</template>
