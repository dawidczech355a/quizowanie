import { Router } from 'express';

// TODO: przejrzeć ten ROUTE bo dużo nieużytych funkcji + serwis

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

router.get('/', async (req, res) => {
  const users = await req.dataSource.user.find();

  if (!users || !users.length) {
    throw new Error('Nie znaleziono żadnych użytkowników.');
  }

  res.json({ users });
});

router.get('/xyz', async (req, res) => {
  console.log('???');

  try {
    const x = await req.dataSource.user.getClassification();

    res.json(x);
  } catch (error) {
    console.log('error ', error);

    res.json({ message: 'Błąd' });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const user = await req.dataSource.user.findById(id);

  if (!user) {
    // throw new Error('Nie znaleziono żadnego użytkownika.');
  }

  res.json({ user });
});

export default router;
