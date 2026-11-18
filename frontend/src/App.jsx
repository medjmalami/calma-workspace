import React from 'react';

const upcomingFeatures = [
  'Find a room that fits your schedule',
  'Reserve a focused space in a few steps',
  'Keep your bookings and receipts together',
];

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Calma WorkSpace home">
          <span className="brand-mark" aria-hidden="true">
            CW
          </span>
          <span>Calma WorkSpace</span>
        </a>

        <span className="phase-label">Phase 0 · Foundation</span>
      </header>

      <main className="hero" aria-labelledby="page-title">
        <section className="hero-copy">
          <p className="eyebrow">A calmer place to get things done</p>
          <h1 id="page-title">
            Make space for your
            <span> best work.</span>
          </h1>
          <p className="intro">
            Calma WorkSpace helps students, pupils, developers, and entrepreneurs
            find the right room for focused work and shared ideas.
          </p>
          <p className="progress-note">
            The booking UI will be added incrementally as the workspace grows.
          </p>
        </section>

        <aside className="welcome-card" aria-label="Calma WorkSpace roadmap">
          <div className="card-heading">
            <span className="status-dot" aria-hidden="true" />
            <span>Workspace opening soon</span>
          </div>

          <h2>Everything you need for a productive session.</h2>

          <ul>
            {upcomingFeatures.map((feature) => (
              <li key={feature}>
                <span className="checkmark" aria-hidden="true">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </aside>
      </main>

      <footer className="site-footer">
        <span>Built for focused work.</span>
        <span aria-hidden="true">✦</span>
        <span>Booking features are on their way.</span>
      </footer>
    </div>
  );
}

export default App;
