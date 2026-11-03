const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration({ username, email, password } = {}) {
  const errors = {};

  if (typeof username !== 'string' || !USERNAME_PATTERN.test(username.trim())) {
    errors.username = 'Use 3–20 letters, numbers or underscores.';
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (typeof password !== 'string' || password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  } else if (password.length > 72) {
    // bcrypt only uses the first 72 bytes of a password.
    errors.password = 'Use 72 characters or fewer.';
  }

  return errors;
}

export function validateLogin({ username, password } = {}) {
  const errors = {};

  if (typeof username !== 'string' || username.trim() === '') {
    errors.username = 'Enter your username.';
  }
  if (typeof password !== 'string' || password === '') {
    errors.password = 'Enter your password.';
  }

  return errors;
}
