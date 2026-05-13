import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/:userId', (req, res) => {
  const me = req.user.id;
  const other = parseInt(req.params.userId, 10);

  const messages = db.prepare(`
    SELECT m.*, u.username AS sender_username
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC, m.id ASC
  `).all(me, other, other, me);

  res.json(messages);
});

export default router;
