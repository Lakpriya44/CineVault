import User from '../models/User.js';
import { validateRegistration, validateLogin } from '../validators/authValidators.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';

const FIELD_LABELS = { username: 'username', email: 'email address' };

// POST /api/auth/register
export async function register(req, res) {
  const errors = validateRegistration(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Fix the highlighted fields and try again.', errors });
  }

  const { username, email, password } = req.body;

  try {
    const user = await User.create({ username, email, password });
    return res.status(201).json({ message: 'Account created.', user: user.toPublic() });
  } catch (err) {
    // 11000 = MongoDB duplicate key (username or email already registered)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern ?? {})[0] ?? 'username';
      const label = FIELD_LABELS[field] ?? field;
      return res.status(409).json({
        message: `That ${label} is already registered.`,
        errors: { [field]: `That ${label} is already registered.` },
      });
    }
    throw err;
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const errors = validateLogin(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Enter your username and password.', errors });
  }

  const username = req.body.username.trim().toLowerCase();
  const user = await User.findOne({ username }).select('+password');
  const passwordMatches = user ? await user.comparePassword(req.body.password) : false;

  // Same message for "no such user" and "wrong password" so usernames can't be probed.
  if (!passwordMatches) {
    return res
      .status(401)
      .json({ message: 'Username or password is incorrect. Check both and try again.' });
  }

  setAuthCookie(res, signToken(user));
  return res.json({ message: 'Signed in.', user: user.toPublic() });
}

// POST /api/auth/logout
export function logout(_req, res) {
  clearAuthCookie(res);
  return res.json({ message: 'Signed out.' });
}

// GET /api/auth/me  (requires a valid session cookie)
export function me(req, res) {
  return res.json({ user: req.user.toPublic() });
}
