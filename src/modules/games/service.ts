import { Model } from 'mongoose';
import { Answer, GameInterface } from './schema';
import { UserInterface } from '../users/schema';
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';

export class GameService {
  constructor(private readonly gameModel: Model<GameInterface>) {}

  private getTodaysTimeRange() {
    return {
      // TODO: wyłącznie na czas developmentu - usunąć później
      // start: startOfDay(new Date()).getTime(),
      // end: endOfDay(new Date()).getTime()
      start: startOfMonth(new Date()).getTime(),
      end: endOfMonth(new Date()).getTime()
    };
  }

  async getTodaysGames() {
    return await this.gameModel
      .find({
        date: {
          $gte: this.getTodaysTimeRange().start,
          $lte: this.getTodaysTimeRange().end
        }
      })
      .exec();
  }

  async getTodaysGameByPlayerId(playerId: string) {
    const result = await this.gameModel
      .findOne({
        $and: [
          {
            date: {
              $gte: this.getTodaysTimeRange().start,
              $lte: this.getTodaysTimeRange().end
            }
          },
          {
            $or: [
              {
                playerOneId: playerId
              },
              {
                playerTwoId: playerId
              }
            ]
          }
        ]
      })
      .exec();

    return result;
  }

  async updateTodaysGameByPlayerId(playerId: string, answer: Answer) {
    const game = await this.getTodaysGameByPlayerId(playerId);

    const getUpdateDto = () => {
      if (game.playerOneId === playerId) {
        return {
          playerOneAnswers: [...game.playerOneAnswers, answer]
        };
      }

      if (game.playerTwoId === playerId) {
        return {
          playerTwoAnswers: [...game.playerTwoAnswers, answer]
        };
      }

      throw new Error('Nieprawidłowy identyfikator użytkownika gry!');
    };

    // TODO: DO REFAKTORU - MOŻE UŻYCIE POLIMORFIZMU ZAMIAST IF'ow?
    if (
      (game.playerOneId === playerId &&
        game.playerOneAnswers.some(
          (alreadyAnswer) => alreadyAnswer.questionId === answer.questionId
        )) ||
      (game.playerTwoId === playerId &&
        game.playerTwoAnswers.some(
          (alreadyAnswer) => alreadyAnswer.questionId === answer.questionId
        ))
    ) {
      throw new Error('Gracz już udzielił odpowiedzi. Nie jest możliwa modyfikacja.');
    }

    await this.gameModel.updateOne({ _id: game._id }, getUpdateDto());
  }

  async markGameAsFetched(playerId: string, game: GameInterface) {
    const getUpdateDto = () => {
      if (game.playerOneId === playerId) {
        return {
          playerOneFetched: true
        };
      }

      if (game.playerTwoId === playerId) {
        return {
          playerTwoFetched: true
        };
      }

      throw new Error('Nieprawidłowy identyfikator użytkownika gry!');
    };

    await this.gameModel.updateOne({ _id: game._id }, getUpdateDto());
  }
}
