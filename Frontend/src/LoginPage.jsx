import { useState } from 'react';

export default function LoginPage({ onSuccess, onBack, notify }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', remember: true });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreateMode = mode === 'create';
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const email = form.email.trim();
    if (!email || !form.password || (isCreateMode && (!form.name.trim() || !form.confirmPassword))) {
      setError(isCreateMode ? 'Complete all fields to create your account.' : 'Enter your email and password.');
      return;
    }
    if (isCreateMode && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${isCreateMode ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name.trim(), email, password: form.password, remember: form.remember })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to continue');
      onSuccess(data.user);
      notify(isCreateMode ? 'Your CineVault account is ready' : `Welcome back, ${data.user.name}`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to continue. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(isCreateMode ? 'login' : 'create');
    setError('');
  };

  return <div className="login-page">
    <div className="login-art"><div className="login-art-copy"><span className="eyebrow">A home for cinema</span><h1>Every film<br /><em>has a story.</em></h1><p>Keep the ones that become part of yours.</p></div><div className="film-strip"><span>NOIR</span><span>ROMANCE</span><span>DRAMA</span></div></div>
    <main className="login-panel"><div className="login-brand"><span className="brand-mark">CV</span><span>CineVault<small>FILM ARCHIVE</small></span></div><div className="login-form-wrap"><span className="eyebrow">{isCreateMode ? 'Start your archive' : 'Welcome back'}</span><h2>{isCreateMode ? 'Create your account.' : 'Sign in to your archive.'}</h2><p className="login-intro">{isCreateMode ? 'Save films, reviews, and memories in one place.' : 'Continue collecting, reviewing, and remembering great films.'}</p><form onSubmit={submit} noValidate>{isCreateMode && <label>Your name<input type="text" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Alex Jordan" autoComplete="name" /></label>}<label>Email address<input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" autoComplete="email" /></label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Enter your password" autoComplete={isCreateMode ? 'new-password' : 'current-password'} /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>{isCreateMode && <label>Confirm password<input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} placeholder="Repeat your password" autoComplete="new-password" /></label>}{!isCreateMode && <div className="login-options"><label className="check-label"><input type="checkbox" checked={form.remember} onChange={(event) => updateField('remember', event.target.checked)} /> Remember me</label><button type="button" className="link-button" onClick={() => notify('Password reset is not configured yet')}>Forgot password?</button></div>}{error && <p className="login-error" role="alert">{error}</p>}<button className="primary-button login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : isCreateMode ? 'Create account' : 'Sign in'} <span>→</span></button></form><p className="signup-prompt">{isCreateMode ? 'Already have an account?' : 'New to CineVault?'} <button type="button" className="link-button" onClick={switchMode}>{isCreateMode ? 'Sign in' : 'Create an account'}</button></p><button className="back-to-archive" onClick={onBack}>← Back to archive</button></div></main>
  </div>;
}
