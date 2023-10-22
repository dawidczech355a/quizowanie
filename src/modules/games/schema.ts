import mongoose from 'mongoose';
import { AnswersOptions } from '../questions/schema';

export interface Answer {
  questionId: string;
  value: AnswersOptions;
}

export interface GameInterface {
  _id: string;
  playerOneId: string;
  playerTwoId: string;
  date: number;
  playerOneAnswers: Answer[];
  playerTwoAnswers: Answer[];
}

export default new mongoose.Schema<GameInterface>({
  playerOneId: {
    type: String,
    required: true
  },
  playerTwoId: {
    type: String,
    required: true
  },
  date: {
    type: Number,
    required: true
  },
  playerOneAnswers: {
    type: Array()
  },
  playerTwoAnswers: {
    type: Array()
  }
});
