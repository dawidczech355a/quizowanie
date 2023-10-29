import { Router } from 'express';
import { utcToZonedTime } from 'date-fns-tz';
import { isAuthenticated } from '../../utils';

const router = Router();

router.get('/today', isAuthenticated, async (req, res) => {
  const [games, players] = await Promise.all([
    req.dataSource.games.getTodaysGames(),
    req.dataSource.user.find()
  ]);
  const resultsForToday = await req.dataSource.user.getGamesClassification({ games, players });

  const getPlayerById = (id: string) => {
    return players.find((player) => player._id.toString() === id);
  };

  const result = games.map((game) => {
    const playerOne = getPlayerById(game.playerOneId);
    const playerTwo = getPlayerById(game.playerTwoId);

    const playerOneFinished = game.playerOneFetched;
    const playerTwoFinished = game.playerTwoFetched;
    const gameFinished = playerOneFinished && playerTwoFinished;

    return {
      id: game.id,
      players: [
        {
          id: playerOne._id,
          name: playerOne.login,
          isFinished: playerOneFinished,
          subPoints: gameFinished
            ? resultsForToday.find((x) => x.id.toString() === playerOne._id.toString()).subPoints
            : undefined
        },
        {
          id: playerTwo._id,
          name: playerTwo.login,
          isFinished: playerTwoFinished,
          subPoints: gameFinished
            ? resultsForToday.find((x) => x.id.toString() === playerTwo._id.toString()).subPoints
            : undefined
        }
      ]
    };
  });

  res.json(result);
});

router.get('/current', isAuthenticated, async (req, res) => {
  const timeZone = 'Europe/Warsaw';
  const datePoland = utcToZonedTime(new Date(), timeZone).getHours();
  
  if (datePoland >= 20) {
    res.statusCode = 403;
    res.json({
      message: 'Już za późno. Gramy do 20:00...'
    });
    return;
  }

  const game = await req.dataSource.games.getTodaysGameByPlayerId(req.userId);

  if (!game) {
    res.statusCode = 404;
    res.json({
      message: 'Nie znaleziono gierki!',
    });
    return;
  }

  if (
    (game.playerOneId === req.userId && game.playerOneFetched) ||
    (game.playerTwoId === req.userId && game.playerTwoFetched)
  ) {
    res.statusCode = 403;
    res.json({
      message: 'Już wcześniej pobrano pytania dla tej rozgrywki. Ponowna gra nie jest możliwa.'
    });
    return;
  }

  await req.dataSource.games.markGameAsFetched(req.userId, game);
  const questions = await req.dataSource.question.getAndUpdateQuestions(game.id);

  res.json({ questions });
});

router.post('/current', isAuthenticated, async (req, res) => {
  const answer = req.body.answer;

  await req.dataSource.games.updateTodaysGameByPlayerId(req.userId, answer);

  res.json(true);
});

export default router;
