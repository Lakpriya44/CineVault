import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../components/Form.css';
import './HomePage.css';

// Placeholder shown after sign-in. The film catalog, reviews and watchlist will replace this.
export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="home">
      <header className="home__bar">
        <p className="home__brand">CineVault</p>
        <button className="button button--quiet" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <section className="home__content">
        <h1 className="home__title">Welcome, {user.username}</h1>
        <p className="home__text">You are signed in. The film catalog is coming in the next stage.</p>
      </section>
    </main>
  );
}
