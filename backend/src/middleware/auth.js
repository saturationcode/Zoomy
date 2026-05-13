import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'zoomy-dev-secret-change-in-prod';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function decodeToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = decodeToken(auth.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
