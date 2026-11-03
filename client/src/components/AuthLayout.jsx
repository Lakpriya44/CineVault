import { Outlet } from 'react-router-dom';
import VideoBackground from './VideoBackground.jsx';
import './AuthLayout.css';

// Shared frame for the login and register pages: video behind, ticket-style window on top.
// It is a layout route, so switching between the two pages keeps the video playing
// and only the form inside the ticket changes.
export default function AuthLayout() {
  return (
    <main className="auth">
      <VideoBackground />
      <section className="ticket">
        <header className="ticket__stub">
          <p className="ticket__brand">CineVault</p>
          <p className="ticket__tagline">Browse films. Rate them. Keep a watchlist.</p>
        </header>
        <div className="ticket__perforation" aria-hidden="true" />
        <div className="ticket__body"><Outlet /></div>
      </section>
    </main>
  );
}
