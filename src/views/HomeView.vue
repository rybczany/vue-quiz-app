<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
// @ts-ignore
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import { useQuizStore } from '@/stores/quiz'
import { useRouter } from 'vue-router'
import type { AnswerData, QuizData, UserResult } from '@/interfaces/quiz-interfaces'

//-----------------------------------------------------------------------

const router = useRouter()
const quizStore = useQuizStore()

const checkedAnswer = ref<string | null>(null)
const isLoading = ref<boolean>(true)
const quizStartTime = ref<number>(0)
const quizEndTime = ref<number>(0)
const startQuiz = ref<boolean>(false)

const state = ref<QuizData>({
  questions: [],
  currentQuestionIndex: 0,
  answers: []
})

const userResult = ref<UserResult>({
  correctAnswers: 0,
  incorrectAnswers: 0,
  quizDuration: 0,
  quizEndDate: ''
})

const currentQuestion = computed(() => state.value.questions[state.value.currentQuestionIndex])
const answersForCurrentQuestion = computed(() => {
  return [currentQuestion.value.correct_answer, ...currentQuestion.value.incorrect_answers].sort()
})

const loadData = async () => {
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=10')
    state.value.questions = response.data.results
  } catch (error) {
    console.error('Error fetching questions', error)
  } finally {
    isLoading.value = false
    quizStartTime.value = Date.now()
  }
}

const checkAnswer = (answer: string | null) => {
  if (answer) {
    checkedAnswer.value = answer
    const answerData: AnswerData = {
      questionIndex: state.value.currentQuestionIndex,
      answer
    }
    for (let item of state.value.answers) {
      if (item.questionIndex === answerData.questionIndex) {
        const foundIndex = state.value.answers.findIndex(
          (x) => x.questionIndex === answerData.questionIndex
        )
        state.value.answers[foundIndex] = answerData
        return
      }
    }
    state.value.answers.push(answerData)
  }
}

const loadQuiz = () => {
  startQuiz.value = true
  loadData()
}

const findCheckedAnswer = () => {
  checkedAnswer.value =
    state.value.answers.find((answer) => answer.questionIndex === state.value.currentQuestionIndex)
      ?.answer || null
}

const nextQuestion = () => {
  state.value.currentQuestionIndex++
  findCheckedAnswer()
}

const previousQuestion = () => {
  state.value.currentQuestionIndex--
  findCheckedAnswer()
}

const checkUserResult = () => {
  state.value.questions.forEach((q) => {
    if (state.value.answers.some((a) => a.answer === q.correct_answer)) {
      userResult.value.correctAnswers++
    } else {
      userResult.value.incorrectAnswers++
    }
  })
}

const submitQuiz = () => {
  quizEndTime.value = Date.now()
  const today = new Date(quizEndTime.value)
  userResult.value.quizEndDate = today.toUTCString()
  userResult.value.quizDuration = (quizEndTime.value - quizStartTime.value) / 1000
  checkUserResult()
  quizStore.colectUserResults(userResult.value)
  localStorage.setItem('quiz', JSON.stringify(quizStore.userResults))
  router.push({ path: '/results' })
}
</script>

<template>
  <section class="py-8 px-4 h-screen">
    <div class="lg:container m-auto">
      <h1 class="text-6xl font-bold mb-10">Quick Quiz</h1>
      <div v-if="!startQuiz">
        <p class="mb-2">Join our quiz. Good fun is guaranteed!</p>
        <button
          @click="loadQuiz"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-7 rounded start-btn"
        >
          Start quiz
        </button>
      </div>
      <div v-else>
        <div v-if="isLoading" class="py-4 text-center mt-28">
          <PulseLoader color="#3b82f6" />
        </div>
        <div v-else>
          <h2 class="text-sm question-number">
            Question number: {{ state.currentQuestionIndex + 1 }}
          </h2>
          <p class="question mb-4" v-html="currentQuestion.question"></p>
          <ul
            class="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <li
              class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600"
              v-for="(answer, index) in answersForCurrentQuestion"
              :key="index"
            >
              <div class="flex items-center ps-3">
                <input
                  :id="`input-${index}`"
                  type="radio"
                  :value="answer"
                  v-model="checkedAnswer"
                  @change="checkAnswer(checkedAnswer)"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-600 dark:border-gray-500 rounded"
                />
                <label
                  :for="`input-${index}`"
                  class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >{{ answer }}</label
                >
              </div>
            </li>
          </ul>
          <div class="progress-bar mb-10 mt-5">
            <p class="progress-bar__label">Quiz progress</p>
            <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div
                class="bg-blue-600 h-1.5 rounded-full"
                :style="{
                  width: `${((state.currentQuestionIndex + 1) * 100) / state.questions.length}%`
                }"
              ></div>
            </div>
          </div>
          <div class="button-container flex justify-between mt-5 w-96">
            <button
              @click="previousQuestion"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-7 rounded disabled:bg-blue-100 previous"
              :disabled="state.currentQuestionIndex === 0"
            >
              Previous Question
            </button>
            <button
              @click="nextQuestion"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-7 rounded disabled:bg-blue-100 next"
              :disabled="state.currentQuestionIndex === state.questions.length - 1"
            >
              Next Question
            </button>
          </div>
          <div class="submit-button-container w-96 mt-5">
            <button
              @click="submitQuiz"
              class="w-full text-2xl bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-100"
              :disabled="!(state.questions.length === state.answers.length)"
            >
              Submit
            </button>
            <p class="text-xs mt-2">
              You can submit the quiz only after selecting all the answers.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
