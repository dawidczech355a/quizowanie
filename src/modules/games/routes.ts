import { Router } from 'express';
import { isAuthenticated } from '../../utils';

const router = Router();

// GRAMY DO 20:00

router.get('/today', isAuthenticated, async (req, res) => {
  const games = await req.dataSource.games.getTodaysGames();

  res.json(games);
});

router.get('/current', isAuthenticated, async (req, res) => {
  const game = await req.dataSource.games.getTodaysGameByPlayerId(req.userId);

  if (
    (game.playerOneId === req.userId && game.playerOneFetched) ||
    (game.playerTwoId === req.userId && game.playerTwoFetched)
  ) {
    res.statusCode = 403;
    res.json({
      message: 'Już wcześniej pobrałeś pytania dla tej rozgrywki. Ponowna gra nie jest możliwa.'
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
