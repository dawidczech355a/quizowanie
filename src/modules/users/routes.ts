import { Router } from 'express';
import { isAuthenticated } from '../../utils';

const router = Router();

router.post('/auth', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      res.statusCode = 400;
      res.json({ message: 'Brak danych autoryzacyjnych.' });
      return;
    }

    const { userId, accessToken } = await req.dataSource.user.loginUser(login, password);

    if (!userId || !accessToken) {
      res.statusCode = 401;
      res.json({ message: 'Nieprawidłowy login lub hasło.' });
      return;
    }

    res.json({ userId, accessToken });
  } catch (error) {
    if (error.message) {
      res.statusCode = 500;
      res.json({ message: error.message });
      return;
    }
  }
});

router.get('/', isAuthenticated, async (req, res) => {
  const users = await req.dataSource.user.find();

  if (!users || !users.length) {
    throw new Error('Nie znaleziono żadnych użytkowników.');
  }

  res.json({ users });
});

router.get('/classification', isAuthenticated, async (req, res) => {
  try {
    const result = await req.dataSource.user.getClassification();

    res.json(result);
  } catch (error) {
    res.json({ message: 'Nie byliśmy w stanie pobrać klasyfikacji użytkowników :(' });
  }
});

router.get('/me', isAuthenticated, async (req, res) => {
  const user = await req.dataSource.user.findById(req.userId);

  if (!user) {
    // WYSTĄPIŁ PROBLEM Z POBRANIEM DANYCH
  }

  res.json({ user });
});

export default router;
