import { useId } from 'react';
import './Form.css';

// A labelled input with an optional hint and error message.
// Renders `children` inside the field row (used by PasswordField for its show/hide button).
export default function TextField({ label, error, hint, children, ...inputProps }) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || hint);

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__row">
        <input
          id={id}
          className="field__input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          {...inputProps}
        />
        {children}
      </div>
      {hasMessage && (
        <p id={messageId} className={error ? 'field__message field__message--error' : 'field__message'}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
