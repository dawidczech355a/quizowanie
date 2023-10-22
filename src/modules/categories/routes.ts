import { Router } from "express";

const router = Router();

router.get('/', async (req, res) => {
  const categories = await req.dataSource.category.find();

  if (!categories || !categories.length) {
    throw new Error('Nie znaleziono żadnych kategorii.');
  }

  res.json({ categories });
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const category = await req.dataSource.category.findById(id);

  if (!category) {
    throw new Error('Nie znaleziono kategorii.');
  }

  res.json({ category });
});

export default router;
