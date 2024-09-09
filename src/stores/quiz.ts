import { defineStore } from 'pinia'
import type { UserResult } from '@/interfaces/quiz-interfaces'
import { ref } from 'vue'

//--------------------------------------------------------------

export const useQuizStore = defineStore('quiz', () => {
  const userResults = ref<UserResult[]>([])

  if (localStorage.getItem("quiz")) {
    userResults.value = JSON.parse(localStorage.getItem("quiz")!)
  }

  function colectUserResults(userResult: UserResult) {
    userResults.value.push(userResult)
  }
  return { userResults, colectUserResults }
})
