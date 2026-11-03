// Client-side checks that mirror the server rules, so people get instant feedback.
// The server always validates again.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ username, password }) {
  const errors = {};
  if (!username.trim()) errors.username = 'Enter your username.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export function validateRegistration({ username, email, password, confirmPassword }) {
  const errors = {};
  if (!USERNAME_PATTERN.test(username.trim())) {
    errors.username = 'Use 3–20 letters, numbers or underscores.';
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (password.length < 8) {
    errors.password = 'Use at least 8 characters.';
  } else if (password.length > 72) {
    errors.password = 'Use 72 characters or fewer.';
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}
