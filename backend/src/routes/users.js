import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const users = db.prepare(
    'SELECT id, username, created_at FROM users WHERE id != ? ORDER BY username'
  ).all(req.user.id);
  res.json(users);
});

export default router;
