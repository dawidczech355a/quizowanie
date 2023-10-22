import { Model } from 'mongoose';

import { QuestionInterface } from './schema';

export class QuestionsService {
  constructor(private readonly questionModel: Model<QuestionInterface>) {}

  private shuffleQuestions(questions: QuestionInterface[]) {
    let currentIndex = questions.length - 1,
      randomIndex;

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * (currentIndex + 1));
      [questions[currentIndex], questions[randomIndex]] = [
        questions[randomIndex],
        questions[currentIndex]
      ];
      currentIndex -= 1;
    }

    return questions;
  }

  private async getThreeQuestions(gameId: string) {
    const allQuestions = await this.questionModel
      .find({
        $or: [{ takenBy: gameId }, { takenBy: { $exists: false } }]
      })
      .exec();
    const gameQuestions = allQuestions.filter((question) => question.takenBy === gameId);
    const questions = gameQuestions.length ? gameQuestions : allQuestions;

    const result = this.shuffleQuestions(questions);

    return result.slice(0, 3).map((question) => ({
      id: question._id,
      question: question.question,
      answers: question.answers
    }));
  }

  private async markQuestionsAsTaken(questionIds: string[], gameId: string) {
    await this.questionModel.updateMany(
      { _id: { $in: questionIds } },
      { $set: { takenBy: gameId } },
      { multi: true }
    );
  }

  async getAndUpdateQuestions(gameId: string) {
    const result = await this.getThreeQuestions(gameId);
    await this.markQuestionsAsTaken(
      result.map((item) => item.id),
      gameId
    );

    return result;
  }
}
