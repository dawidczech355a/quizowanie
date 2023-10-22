import { Router } from 'express';

const router = Router();

router.get('/today', async (req, res) => {
  const games = await req.dataSource.games.getTodaysGames();

  res.json(games);
});

router.get('/:playerId', async (req, res) => {
  const playerId = req.params.playerId;

  if (!playerId) {
    // TODO: obsłużyć błąd
  }

  const game = await req.dataSource.games.getTodaysGameByPlayerId(playerId);
  const questions = await req.dataSource.question.getAndUpdateQuestions(game.id);

  res.json({ questions });
});

router.post('/:playerId', async (req, res) => {
  const playerId = req.params.playerId;
  const answers = req.body.answers;

  if (!playerId) {
    // TODO: obsłużyć błąd
  }

  await req.dataSource.games.updateTodaysGameByPlayerId(playerId, answers);

  res.json(true);
});

export default router;
