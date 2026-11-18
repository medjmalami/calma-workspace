import React, { useState } from 'react';

const clientTypes = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'PUPIL', label: 'Pupil' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'ENTREPRENEUR', label: 'Entrepreneur' },
];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  clientType: 'STUDENT',
  password: '',
};

const initialLoginForm = {
  email: '',
  password: '',
};

function getTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const initialAvailabilityForm = {
  date: getTomorrow(),
  startTime: '10:00',
  endTime: '12:00',
  attendeeCount: '1',
};

const initialSubmission = {
  status: 'idle',
  message: '',
  details: [],
};

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

function getErrorDetails(payload) {
  if (!Array.isArray(payload?.error?.details)) {
    return [];
  }

  return payload.error.details
    .map((detail) => {
      const path = Array.isArray(detail.path) ? detail.path.join('.') : '';
      return path ? `${path}: ${detail.message}` : detail.message;
    })
    .filter(Boolean);
}

function getErrorMessage(payload, response, fallback) {
  if (typeof payload?.error?.message === 'string') {
    return payload.error.message;
  }

  if (response.status === 409) {
    return 'This account or room configuration already exists.';
  }

  if (response.status === 422) {
    return 'Please check your details and try again.';
  }

  return fallback;
}

function App() {
  const [view, setView] = useState('register');
  const [form, setForm] = useState(initialForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [availabilityForm, setAvailabilityForm] = useState(initialAvailabilityForm);
  const [submission, setSubmission] = useState(initialSubmission);
  const [availability, setAvailability] = useState(null);
  const [availabilitySubmission, setAvailabilitySubmission] = useState(initialSubmission);
  const [authToken, setAuthToken] = useState(() => {
    try {
      return window.sessionStorage.getItem('calma_token') || '';
    } catch (_error) {
      return '';
    }
  });

  const isSubmitting = submission.status === 'loading';
  const isSearching = availabilitySubmission.status === 'loading';

  function selectView(nextView) {
    setView(nextView);
    setSubmission(initialSubmission);
    setAvailabilitySubmission(initialSubmission);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (submission.status !== 'idle') {
      setSubmission(initialSubmission);
    }
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((currentForm) => ({ ...currentForm, [name]: value }));
    if (submission.status !== 'idle') {
      setSubmission(initialSubmission);
    }
  }

  function handleAvailabilityChange(event) {
    const { name, value } = event.target;
    setAvailabilityForm((currentForm) => ({ ...currentForm, [name]: value }));
    if (availabilitySubmission.status !== 'idle') {
      setAvailabilitySubmission(initialSubmission);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmission({ status: 'loading', message: 'Creating your account…', details: [] });

    try {
      const response = await fetch(`${apiBaseUrl}/clients/register`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          clientType: form.clientType,
          password: form.password,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmission({
          status: 'error',
          message: getErrorMessage(
            payload,
            response,
            'We could not create your account right now. Please try again.',
          ),
          details: getErrorDetails(payload),
        });
        return;
      }

      setForm(initialForm);
      setSubmission({
        status: 'success',
        message: `Your account is ready${payload?.client?.name ? `, ${payload.client.name}` : ''}.`,
        details: [],
      });
    } catch (_error) {
      setSubmission({
        status: 'error',
        message: 'We could not reach Calma WorkSpace. Please try again.',
        details: [],
      });
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmission({ status: 'loading', message: 'Signing you in…', details: [] });

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmission({
          status: 'error',
          message: getErrorMessage(
            payload,
            response,
            'We could not sign you in right now. Please try again.',
          ),
          details: getErrorDetails(payload),
        });
        return;
      }

      try {
        window.sessionStorage.setItem('calma_token', payload.token);
      } catch (_error) {
        // The session can still be used for this view when storage is unavailable.
      }
      setAuthToken(payload.token || '');
      setLoginForm(initialLoginForm);
      setSubmission({
        status: 'success',
        message: `Welcome back${payload?.client?.name ? `, ${payload.client.name}` : ''}.`,
        details: [],
      });
    } catch (_error) {
      setSubmission({
        status: 'error',
        message: 'We could not reach Calma WorkSpace. Please try again.',
        details: [],
      });
    }
  }

  async function handleAvailabilitySearch(event) {
    event.preventDefault();

    if (isSearching) {
      return;
    }

    setAvailabilitySubmission({
      status: 'loading',
      message: 'Checking the rooms…',
      details: [],
    });

    try {
      const query = new URLSearchParams(availabilityForm);
      const response = await fetch(`${apiBaseUrl}/rooms/availability?${query}`);
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setAvailabilitySubmission({
          status: 'error',
          message: getErrorMessage(
            payload,
            response,
            'We could not check availability right now. Please try again.',
          ),
          details: getErrorDetails(payload),
        });
        return;
      }

      setAvailability(payload?.availability || null);
      setAvailabilitySubmission({
        status: 'success',
        message: 'Availability updated.',
        details: [],
      });
    } catch (_error) {
      setAvailabilitySubmission({
        status: 'error',
        message: 'We could not reach Calma WorkSpace. Please try again.',
        details: [],
      });
    }
  }

  const isRegisterView = view === 'register';
  const isLoginView = view === 'login';

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Calma WorkSpace home">
          <span className="brand-mark" aria-hidden="true">CW</span>
          <span>Calma WorkSpace</span>
        </a>

        <span className="phase-label">F2–F4 · Auth, rooms &amp; availability</span>
      </header>

      <main className="hero" aria-labelledby="page-title">
        <section className="hero-copy">
          <p className="eyebrow">A calmer place to get things done</p>
          <h1 id="page-title">
            Make space for your
            <span> best work.</span>
          </h1>
          <p className="intro">
            Create an account, sign in securely, and find the right room for
            focused work, shared ideas, and meaningful progress.
          </p>
          <p className="progress-note">
            {authToken ? 'You are signed in.' : 'Your calmer workspace starts here.'}
          </p>
        </section>

        <section className="registration-card" aria-labelledby="workspace-action-title">
          <nav className="view-switcher" aria-label="Workspace actions">
            <button
              className={isRegisterView ? 'view-tab active' : 'view-tab'}
              type="button"
              onClick={() => selectView('register')}
            >
              Create account
            </button>
            <button
              className={isLoginView ? 'view-tab active' : 'view-tab'}
              type="button"
              onClick={() => selectView('login')}
            >
              Sign in
            </button>
            <button
              className={view === 'availability' ? 'view-tab active' : 'view-tab'}
              type="button"
              onClick={() => selectView('availability')}
            >
              Find a room
            </button>
          </nav>

          {isRegisterView && (
            <>
              <div className="card-heading">
                <span className="status-dot" aria-hidden="true" />
                <span>Join the workspace</span>
              </div>
              <h2 id="workspace-action-title">Create your account.</h2>
              <p className="form-intro">Tell us a little about yourself to get started.</p>

              <form className="registration-form" onSubmit={handleSubmit} noValidate>
                <div className="field-group">
                  <label htmlFor="name">Full name <span aria-hidden="true">*</span></label>
                  <input id="name" name="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} required maxLength={120} />
                </div>
                <div className="field-group">
                  <label htmlFor="email">Email address <span aria-hidden="true">*</span></label>
                  <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required maxLength={254} />
                </div>
                <div className="field-group">
                  <label htmlFor="phone">Phone number <span className="optional-label">(optional)</span></label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} maxLength={32} />
                </div>
                <div className="field-group">
                  <label htmlFor="clientType">I am a <span aria-hidden="true">*</span></label>
                  <select id="clientType" name="clientType" value={form.clientType} onChange={handleChange} required>
                    {clientTypes.map((clientType) => <option key={clientType.value} value={clientType.value}>{clientType.label}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="password">Password <span aria-hidden="true">*</span></label>
                  <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required minLength={8} maxLength={128} aria-describedby="password-hint" />
                  <span className="field-hint" id="password-hint">Use at least 8 characters.</span>
                </div>
                {submission.status !== 'idle' && (
                  <SubmissionMessage submission={submission} />
                )}
                <button className="submit-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account…' : 'Create account'} <span aria-hidden="true">→</span>
                </button>
              </form>
            </>
          )}

          {isLoginView && (
            <>
              <div className="card-heading"><span className="status-dot" aria-hidden="true" /><span>Welcome back</span></div>
              <h2 id="workspace-action-title">Sign in securely.</h2>
              <p className="form-intro">Use your Calma WorkSpace account to continue.</p>
              <form className="registration-form" onSubmit={handleLogin} noValidate>
                <div className="field-group">
                  <label htmlFor="login-email">Email address <span aria-hidden="true">*</span></label>
                  <input id="login-email" name="email" type="email" autoComplete="email" value={loginForm.email} onChange={handleLoginChange} required maxLength={254} />
                </div>
                <div className="field-group">
                  <label htmlFor="login-password">Password <span aria-hidden="true">*</span></label>
                  <input id="login-password" name="password" type="password" autoComplete="current-password" value={loginForm.password} onChange={handleLoginChange} required minLength={8} maxLength={128} />
                </div>
                {submission.status !== 'idle' && <SubmissionMessage submission={submission} />}
                <button className="submit-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span>
                </button>
              </form>
            </>
          )}

          {view === 'availability' && (
            <>
              <div className="card-heading"><span className="status-dot" aria-hidden="true" /><span>Room finder</span></div>
              <h2 id="workspace-action-title">Find your focus room.</h2>
              <p className="form-intro">Choose a future time and we’ll show rooms that fit your group.</p>
              <form className="registration-form" onSubmit={handleAvailabilitySearch} noValidate>
                <div className="field-group">
                  <label htmlFor="availability-date">Date <span aria-hidden="true">*</span></label>
                  <input id="availability-date" name="date" type="date" value={availabilityForm.date} onChange={handleAvailabilityChange} required />
                </div>
                <div className="availability-time-grid">
                  <div className="field-group">
                    <label htmlFor="availability-start">Starts <span aria-hidden="true">*</span></label>
                    <input id="availability-start" name="startTime" type="time" value={availabilityForm.startTime} onChange={handleAvailabilityChange} required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="availability-end">Ends <span aria-hidden="true">*</span></label>
                    <input id="availability-end" name="endTime" type="time" value={availabilityForm.endTime} onChange={handleAvailabilityChange} required />
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="attendee-count">People <span aria-hidden="true">*</span></label>
                  <input id="attendee-count" name="attendeeCount" type="number" min="1" step="1" value={availabilityForm.attendeeCount} onChange={handleAvailabilityChange} required />
                </div>
                {availabilitySubmission.status !== 'idle' && <SubmissionMessage submission={availabilitySubmission} />}
                <button className="submit-button" type="submit" disabled={isSearching}>
                  {isSearching ? 'Checking rooms…' : 'Check availability'} <span aria-hidden="true">→</span>
                </button>
              </form>
              {availability && (
                <div className="availability-results" aria-live="polite">
                  <div className="results-heading">
                    <span>{availability.rooms.length} room{availability.rooms.length === 1 ? '' : 's'} available</span>
                    <span>{availability.startTime}–{availability.endTime}</span>
                  </div>
                  {availability.rooms.length > 0 ? (
                    <ul className="room-list">
                      {availability.rooms.map((room) => (
                        <li className="room-result" key={room.id}>
                          <span>{room.name}</span>
                          <span>up to {room.capacity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="empty-results">No rooms fit that time and group size.</p>}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span>Built for focused work.</span>
        <span aria-hidden="true">✦</span>
        <span>Your calmer workspace starts here.</span>
      </footer>
    </div>
  );
}

function SubmissionMessage({ submission }) {
  return (
    <div className={`form-message ${submission.status}`} role={submission.status === 'error' ? 'alert' : 'status'} aria-live="polite">
      <p>{submission.message}</p>
      {submission.details.length > 0 && (
        <ul className="validation-details">
          {submission.details.map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}
        </ul>
      )}
    </div>
  );
}

export default App;
