import { Link } from 'react-router-dom';
import './HomePage.css';

export default function NotFoundPage() {
  return (
    <main className="home">
      <section className="home__content">
        <h1 className="home__title">Page not found</h1>
        <p className="home__text">
          That address doesn’t exist. <Link to="/login">Go to sign in</Link>
        </p>
      </section>
    </main>
  );
}
