import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { COOKIE_NAME } from '../utils/token.js';

// Protects a route: attaches the signed-in user to req.user or responds 401.
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Sign in to continue.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Your session is no longer valid. Sign in again.' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ message: 'Sign in to continue.' });
  }

  req.user = user;
  next();
}

// Use after requireAuth, e.g. router.post('/films', requireAuth, requireRole('admin'), ...)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do that.' });
    }
    next();
  };
}
