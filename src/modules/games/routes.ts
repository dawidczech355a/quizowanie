import { Router } from 'express';
import { isAuthenticated } from '../../utils';

const router = Router();

// JEŻELI PYTANIA BYŁY POBRANE RAZ DLA DANEGO UŻYTKOWNIKA TO NIE POBIERAMY ICH WIĘCEJ
// ODPOWIEDZI WYSYŁAMY POJEDYNCZO

router.get('/today', isAuthenticated, async (req, res) => {
  const games = await req.dataSource.games.getTodaysGames();

  res.json(games);
});

router.get('/current', isAuthenticated, async (req, res) => {
  const game = await req.dataSource.games.getTodaysGameByPlayerId(req.userId);
  const questions = await req.dataSource.question.getAndUpdateQuestions(game.id);

  res.json({ questions });
});

router.post('/current', isAuthenticated, async (req, res) => {
  const answers = req.body.answers;

  await req.dataSource.games.updateTodaysGameByPlayerId(req.userId, answers);

  res.json(true);
});

export default router;
