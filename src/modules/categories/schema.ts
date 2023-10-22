import mongoose from "mongoose";

import { QuestionInterface } from "../questions/schema";

export interface CategoryInterface {
  id: string;
  name: string;
  questions: QuestionInterface[];
}

export default new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  questions: {
    type: Array,
    required: true,
  },
});
