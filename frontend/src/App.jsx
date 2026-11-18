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

function getErrorMessage(payload, response) {
  if (typeof payload?.error?.message === 'string') {
    return payload.error.message;
  }

  if (response.status === 409) {
    return 'An account with this email already exists.';
  }

  if (response.status === 422) {
    return 'Please check your details and try again.';
  }

  return 'We could not create your account right now. Please try again.';
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [submission, setSubmission] = useState(initialSubmission);
  const isSubmitting = submission.status === 'loading';

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmission({
      status: 'loading',
      message: 'Creating your account…',
      details: [],
    });

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
          message: getErrorMessage(payload, response),
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

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Calma WorkSpace home">
          <span className="brand-mark" aria-hidden="true">
            CW
          </span>
          <span>Calma WorkSpace</span>
        </a>

        <span className="phase-label">F1 · Client registration</span>
      </header>

      <main className="hero" aria-labelledby="page-title">
        <section className="hero-copy">
          <p className="eyebrow">A calmer place to get things done</p>
          <h1 id="page-title">
            Make space for your
            <span> best work.</span>
          </h1>
          <p className="intro">
            Create your Calma WorkSpace account and find the right room for
            focused work, shared ideas, and meaningful progress.
          </p>
          <p className="progress-note">
            Your first step toward a more focused workspace.
          </p>
        </section>

        <section className="registration-card" aria-labelledby="registration-title">
          <div className="card-heading">
            <span className="status-dot" aria-hidden="true" />
            <span>Join the workspace</span>
          </div>

          <h2 id="registration-title">Create your account.</h2>
          <p className="form-intro">
            Tell us a little about yourself to get started.
          </p>

          <form className="registration-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="name">
                Full name <span aria-hidden="true">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={120}
              />
            </div>

            <div className="field-group">
              <label htmlFor="email">
                Email address <span aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={254}
              />
            </div>

            <div className="field-group">
              <label htmlFor="phone">
                Phone number <span className="optional-label">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                maxLength={32}
              />
            </div>

            <div className="field-group">
              <label htmlFor="clientType">
                I am a <span aria-hidden="true">*</span>
              </label>
              <select
                id="clientType"
                name="clientType"
                value={form.clientType}
                onChange={handleChange}
                required
              >
                {clientTypes.map((clientType) => (
                  <option key={clientType.value} value={clientType.value}>
                    {clientType.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="password">
                Password <span aria-hidden="true">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={128}
                aria-describedby="password-hint"
              />
              <span className="field-hint" id="password-hint">
                Use at least 8 characters.
              </span>
            </div>

            {submission.status !== 'idle' && (
              <div
                className={`form-message ${submission.status}`}
                role={submission.status === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                <p>{submission.message}</p>
                {submission.details.length > 0 && (
                  <ul className="validation-details">
                    {submission.details.map((detail, index) => (
                      <li key={`${detail}-${index}`}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button className="submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
              <span aria-hidden="true">→</span>
            </button>
          </form>
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

export default App;
