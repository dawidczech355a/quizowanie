import mongoose from 'mongoose';

export type AnswersOptions = 'a' | 'b' | 'c' | 'd';

export interface AnswersInterface {
  value: AnswersOptions;
  label: string;
}

export interface QuestionInterface {
  _id: string;
  question: string;
  answers: AnswersInterface[];
  correct: AnswersOptions;
  takenBy?: string;
}

export default new mongoose.Schema<QuestionInterface>({
  question: {
    type: String,
    required: true
  },
  answers: {
    type: Array(),
    required: true
  },
  correct: {
    type: String,
    required: true
  },
  takenBy: {
    type: String
  }
});
