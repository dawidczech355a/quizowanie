import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import { startOfDay } from 'date-fns';

import { UserInterface } from '../users/schema';
import { Answer, GameInterface } from '../games/schema';
import { QuestionInterface } from '../questions/schema';

export class UserService {
  constructor(
    private readonly userModel: Model<UserInterface>,
    private readonly gameModel: Model<GameInterface>,
    private readonly questionModel: Model<QuestionInterface>
  ) {}

  private mappedUserObject(user: UserInterface): Omit<UserInterface, 'password'> {
    return {
      _id: user._id,
      login: user.login,
      gameIds: user.gameIds
    };
  }

  async find() {
    const users = await this.userModel.find();

    return users.map(this.mappedUserObject);
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);

    return this.mappedUserObject(user);
  }

  async findByIds(ids: string[]) {
    const users = await Promise.all(
      ids.map(async (id) => {
        return await this.findById(id);
      })
    );

    return users;
  }

  async findOneByName(name: string) {
    const user = await this.userModel.findOne({ name });

    if (!user) {
      return undefined;
    }

    return this.mappedUserObject(user);
  }

  async findManyByName(name: string) {
    const users = await this.userModel.find({ name });

    if (!users || !users.length) {
      return undefined;
    }

    return users.map(this.mappedUserObject);
  }

  private generateAccessToken(id: string) {
    return jwt.sign(
      { id },
      '53fb785304e35f23666a0e467220c87b10780c413a059ddc73135b56e34f191cbf895b8a9199d8e7d13cdf30d28097e3b1d360b069bf34960ccfbc94b9cf1c99',
      {
        expiresIn: '7d'
      }
    );
  }

  async loginUser(login: string, password: string) {
    const user = await this.userModel.findOne({ login, password });

    if (!user) {
      throw new Error('Błędne dane logowania.');
    }

    const userId = user._id as unknown as string;

    return {
      accessToken: this.generateAccessToken(userId),
      userId
    };
  }

  //

  async getClassification() {
    const [players, games, questions] = await Promise.all([
      this.userModel.find(),
      this.gameModel.find(),
      this.questionModel.find()
    ]);

    const getPlayerAndOponent = (playerId: string, game: GameInterface) => {
      const result = {
        playerId: undefined as string | undefined,
        playerAnswers: [] as Answer[],
        oponentId: '' as string | undefined,
        oponentAnswers: [] as Answer[]
      };

      if (playerId === game.playerOneId) {
        result.playerId = game.playerOneId;
        result.playerAnswers = game.playerOneAnswers;
        result.oponentId = game.playerTwoId;
        result.oponentAnswers = game.playerTwoAnswers;

        return result;
      }

      if (playerId === game.playerTwoId) {
        result.playerId = game.playerTwoId;
        result.playerAnswers = game.playerTwoAnswers;
        result.oponentId = game.playerOneId;
        result.oponentAnswers = game.playerOneAnswers;

        return result;
      }
    };

    const countedClassification = players.map((player) => {
      const playerGames = games.filter(
        (game) =>
          getPlayerAndOponent(player._id.toString(), game)?.playerId === player._id.toString()
      );

      const playedGames = playerGames.filter((game) => {
        const startOfDayTime = startOfDay(new Date()).getTime();
        const playerAndOponent = getPlayerAndOponent(player._id.toString(), game);

        return startOfDayTime > game.date || playerAndOponent.playerAnswers.length > 0;
      });

      const playedGamesNumber = playedGames.length;

      const smallPoints = playedGames.reduce((prev, curr) => {
        const playerPoints = getPlayerAndOponent(player._id.toString(), curr).playerAnswers.reduce(
          (prev2, curr2) => {
            const question = questions.find(
              (question) => question._id.toString() === curr2.questionId
            );

            if (question && question.correct === curr2.value) {
              return prev2 + 1;
            }

            return prev2;
          },
          0
        );

        return prev + playerPoints;
      }, 0);

      const bigPoints = playedGames.reduce((prev, curr) => {
        const playerPoints = getPlayerAndOponent(player._id.toString(), curr).playerAnswers.reduce(
          (prev2, curr2) => {
            const question = questions.find(
              (question) => question._id.toString() === curr2.questionId
            );

            if (question && question.correct === curr2.value) {
              return prev2 + 1;
            }

            return prev2;
          },
          0
        );

        const oponentPoints = getPlayerAndOponent(
          player._id.toString(),
          curr
        ).oponentAnswers.reduce((prev2, curr2) => {
          const question = questions.find(
            (question) => question._id.toString() === curr2.questionId
          );

          if (question && question.correct === curr2.value) {
            return prev2 + 1;
          }

          return prev2;
        }, 0);

        if (playerPoints > oponentPoints) {
          return prev + 3;
        }

        if (playerPoints === oponentPoints) {
          return prev + 1;
        }

        return prev;
      }, 0);

      const won = playedGames.reduce((prev, curr) => {
        const playerPoints = getPlayerAndOponent(player._id.toString(), curr).playerAnswers.reduce(
          (prev2, curr2) => {
            const question = questions.find(
              (question) => question._id.toString() === curr2.questionId
            );

            if (question && question.correct === curr2.value) {
              return prev2 + 1;
            }

            return prev2;
          },
          0
        );

        const oponentPoints = getPlayerAndOponent(
          player._id.toString(),
          curr
        ).oponentAnswers.reduce((prev2, curr2) => {
          const question = questions.find(
            (question) => question._id.toString() === curr2.questionId
          );

          if (question && question.correct === curr2.value) {
            return prev2 + 1;
          }

          return prev2;
        }, 0);

        if (playerPoints > oponentPoints) {
          return prev + 1;
        }

        return prev;
      }, 0);

      const draw = playedGames.reduce((prev, curr) => {
        const playerPoints = getPlayerAndOponent(player._id.toString(), curr).playerAnswers.reduce(
          (prev2, curr2) => {
            const question = questions.find(
              (question) => question._id.toString() === curr2.questionId
            );

            if (question && question.correct === curr2.value) {
              return prev2 + 1;
            }

            return prev2;
          },
          0
        );

        const oponentPoints = getPlayerAndOponent(
          player._id.toString(),
          curr
        ).oponentAnswers.reduce((prev2, curr2) => {
          const question = questions.find(
            (question) => question._id.toString() === curr2.questionId
          );

          if (question && question.correct === curr2.value) {
            return prev2 + 1;
          }

          return prev2;
        }, 0);

        if (playerPoints === oponentPoints) {
          return prev + 1;
        }

        return prev;
      }, 0);

      const lose = playedGames.reduce((prev, curr) => {
        const playerPoints = getPlayerAndOponent(player._id.toString(), curr).playerAnswers.reduce(
          (prev2, curr2) => {
            const question = questions.find(
              (question) => question._id.toString() === curr2.questionId
            );

            if (question && question.correct === curr2.value) {
              return prev2 + 1;
            }

            return prev2;
          },
          0
        );

        const oponentPoints = getPlayerAndOponent(
          player._id.toString(),
          curr
        ).oponentAnswers.reduce((prev2, curr2) => {
          const question = questions.find(
            (question) => question._id.toString() === curr2.questionId
          );

          if (question && question.correct === curr2.value) {
            return prev2 + 1;
          }

          return prev2;
        }, 0);

        if (playerPoints < oponentPoints) {
          return prev + 1;
        }

        return prev;
      }, 0);

      return {
        playerId: player._id,
        playerName: player.login,
        playedGamesNumber,
        smallPoints,
        bigPoints,
        won,
        draw,
        lose
      };
    });

    return countedClassification.sort((a, b) => {
      if (a.bigPoints > b.bigPoints) {
        return -1;
      } else if (a.bigPoints < b.bigPoints) {
        return 1;
      } else {
        if (a.smallPoints > b.smallPoints) {
          return -1;
        } else if (a.smallPoints < b.smallPoints) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }
}