import mongoose from 'mongoose';

import { UserService } from './modules/users/service';
import userSchema from './modules/users/schema';
import gamesSchema from './modules/games/schema';
import { GameService } from './modules/games/service';
import { QuestionsService } from './modules/questions/service';
import questionsSchema from './modules/questions/schema';

export class DataSource {
  private readonly userModel = mongoose.model('User', userSchema);
  private readonly gameModel = mongoose.model('Game', gamesSchema);
  private readonly questionModel = mongoose.model('Question', questionsSchema);

  public user = new UserService(this.userModel, this.gameModel, this.questionModel);
  public games = new GameService(this.gameModel);
  public question = new QuestionsService(this.questionModel);
}
