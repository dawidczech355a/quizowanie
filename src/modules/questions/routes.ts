import { Router } from "express";

const router = Router();

router.get('/', async (req, res) => {
  const questions = await req.dataSource.question.getThreeQuestions();

  res.json({ questions });
});

export default router;
