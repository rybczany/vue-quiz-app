export interface Question {
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

export interface AnswerData {
  questionIndex: number
  answer: string
}

export interface QuizData {
  questions: Question[]
  currentQuestionIndex: number
  answers: AnswerData[]
}

export interface UserResult {
  correctAnswers: number
  incorrectAnswers: number
  quizDuration: number
  quizEndDate: string
}
