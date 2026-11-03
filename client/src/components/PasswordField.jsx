import { useState } from 'react';
import TextField from './TextField.jsx';

// Password input with a Show/Hide toggle.
export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField {...props} type={visible ? 'text' : 'password'}>
      <button
        type="button"
        className="field__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </TextField>
  );
}
