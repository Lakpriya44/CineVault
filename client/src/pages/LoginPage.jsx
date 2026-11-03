import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TextField from '../components/TextField.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateLogin } from '../utils/validators.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // After registering, the register page sends people here with a message and their username.
  const notice = location.state?.notice;
  const [values, setValues] = useState({ username: location.state?.username ?? '', password: '' });
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

    const errors = validateLogin(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await login({ username: values.username.trim(), password: values.password });
      navigate(location.state?.from ?? '/home', { replace: true });
    } catch (err) {
      setFieldErrors(err.fieldErrors ?? {});
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h1 className="form__title">Sign in</h1>

      {notice && !formError && (
        <p className="notice notice--ok" role="status">
          {notice}
        </p>
      )}
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
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
      />
      <PasswordField
        label="Password"
        name="password"
        value={values.password}
        onChange={handleChange}
        error={fieldErrors.password}
        autoComplete="current-password"
      />

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="form__switch">
        New to CineVault? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}
