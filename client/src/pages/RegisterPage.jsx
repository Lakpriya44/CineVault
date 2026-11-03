import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextField from '../components/TextField.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { registerUser } from '../api/auth.js';
import { validateRegistration } from '../utils/validators.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const errors = validateRegistration(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const username = values.username.trim();
      await registerUser({ username, email: values.email.trim(), password: values.password });
      // Send people to sign in with the account they just made.
      navigate('/login', {
        replace: true,
        state: { notice: 'Account created. Sign in to continue.', username: username.toLowerCase() },
      });
    } catch (err) {
      setFieldErrors(err.fieldErrors ?? {});
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h1 className="form__title">Create your account</h1>

      {formError && (
        <p className="notice notice--error" role="alert">
          {formError}
        </p>
      )}

      <TextField
        label="Username"
        name="username"
        value={values.username}
        onChange={handleChange}
        error={fieldErrors.username}
        hint="3–20 letters, numbers or underscores."
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={fieldErrors.email}
        autoComplete="email"
        spellCheck={false}
      />
      <PasswordField
        label="Password"
        name="password"
        value={values.password}
        onChange={handleChange}
        error={fieldErrors.password}
        hint="At least 8 characters."
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleChange}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>

      <p className="form__switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
