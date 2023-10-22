import { Model } from 'mongoose';
import { Answer, GameInterface } from './schema';
import { UserInterface } from '../users/schema';
import { endOfDay, startOfDay } from 'date-fns';

export class GameService {
  constructor(
    private readonly gameModel: Model<GameInterface>,
    private readonly userModel: Model<UserInterface>
  ) {}

  private getTodaysTimeRange() {
    return {
      start: startOfDay(new Date()).getTime(),
      end: endOfDay(new Date()).getTime()
    };
  }

  async getTodaysGames() {
    const [games, players] = await Promise.all([
      this.gameModel
        .find({
          date: {
            $gte: this.getTodaysTimeRange().start,
            $lte: this.getTodaysTimeRange().end
          }
        })
        .exec(),
      this.userModel.find().exec()
    ]);

    const getPlayerById = (id: string) => {
      return players.find((player) => player._id.toString() === id);
    };

    return games.map((game) => {
      const playerOne = getPlayerById(game.playerOneId);
      const playerTwo = getPlayerById(game.playerTwoId);

      return {
        id: game.id,
        players: [
          {
            id: playerOne._id,
            name: playerOne.login,
            isFinished: game.playerOneAnswers.length > 0
          },
          {
            id: playerTwo._id,
            name: playerTwo.login,
            isFinished: game.playerTwoAnswers.length > 0
          }
        ]
      };
    });
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

  async updateTodaysGameByPlayerId(playerId: string, answers: Answer[]) {
    const game = await this.getTodaysGameByPlayerId(playerId);

    const getUpdateDto = () => {
      if (game.playerOneId === playerId) {
        return {
          playerOneAnswers: answers
        };
      }

      if (game.playerTwoId === playerId) {
        return {
          playerTwoAnswers: answers
        };
      }

      throw new Error('Nieprawidłowy identyfikator użytkownika gry!');
    };

    if (
      (game.playerOneId === playerId && game.playerOneAnswers.length > 0) ||
      (game.playerTwoId === playerId && game.playerTwoAnswers.length > 0)
    ) {
      throw new Error('Gracz już udzielił odpowiedzi. Nie jest możliwa modyfikacja odpowiedzi.');
    }

    await this.gameModel.updateOne({ _id: game._id }, getUpdateDto());
  }
}
