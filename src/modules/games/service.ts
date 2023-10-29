import { Model } from 'mongoose';
import { endOfDay, startOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import { Answer, GameInterface } from './schema';

export class GameService {
  constructor(private readonly gameModel: Model<GameInterface>) {}

  private getTodaysTimeRange() {
    const dateInPoland = utcToZonedTime(new Date(), 'Europe/Warsaw');
    
    return {
      start: startOfDay(dateInPoland).getTime(),
      end: endOfDay(dateInPoland).getTime()
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
    return await this.gameModel
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
      });
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
