import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './login.css';

const fallbackFilms = [
  { id: '1', title: 'The Long Goodbye', year: 1973, director: 'Robert Altman', genre: 'Noir', rating: '8.0', runtime: '112m', accent: '#c5a46d', poster: 'NOIR / 73', description: 'A private eye drifts through a sun-bleached Los Angeles that has forgotten how to be honest.' },
  { id: '2', title: 'Chungking Express', year: 1994, director: 'Wong Kar-wai', genre: 'Romance', rating: '8.1', runtime: '102m', accent: '#ef7257', poster: 'HK / 94', description: 'Two lonely cops cross paths with two magnetic women in a city moving too quickly to notice.' },
  { id: '3', title: 'Jeanne Dielman', year: 1975, director: 'Chantal Akerman', genre: 'Drama', rating: '8.0', runtime: '201m', accent: '#b9c9c2', poster: 'HOME / 75', description: 'Three days in the life of a Brussels widow, observed with radical patience and precision.' },
  { id: '4', title: 'Paris, Texas', year: 1984, director: 'Wim Wenders', genre: 'Drama', rating: '8.1', runtime: '145m', accent: '#e2a35e', poster: 'ROAD / 84', description: 'A mysterious drifter walks back into his family and toward the landscape of his past.' },
  { id: '5', title: 'Perfect Days', year: 2023, director: 'Wim Wenders', genre: 'Slice of life', rating: '7.9', runtime: '123m', accent: '#8ba9a3', poster: 'TOKYO / 23', description: 'Routine becomes a quiet form of freedom for a Tokyo public toilet cleaner.' },
  { id: '6', title: 'The Red Shoes', year: 1948, director: 'Michael Powell', genre: 'Musical', rating: '8.1', runtime: '133m', accent: '#c8493e', poster: 'STAGE / 48', description: 'Art, desire, and ambition collide behind the velvet curtain of a ballet company.' }
];

function App() {
  const [films, setFilms] = useState(fallbackFilms);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All films');
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: true });

  useEffect(() => {
    fetch('/api/films').then((response) => response.json()).then((data) => { if (Array.isArray(data) && data.length) setFilms(data); }).catch(() => undefined);
  }, []);

  const visibleFilms = useMemo(() => films.filter((film) => {
    const id = film.id || film._id;
    const text = `${film.title} ${film.director} ${film.genre}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (filter !== 'My shelf' || saved.includes(id));
  }), [films, query, filter, saved]);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
  const saveFilm = (film) => {
    const id = film.id || film._id;
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    notify(saved.includes(id) ? 'Removed from your shelf' : 'Added to your shelf');
  };
  const selectFilter = (nextFilter) => { setFilter(nextFilter); setQuery(''); };

  const submitLogin = (event) => {
    event.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      notify('Enter your email and password');
      return;
    }
    setShowLogin(false);
    notify('Welcome back to CineVault');
  };

  if (showLogin) return <div className="login-page">
    <div className="login-art"><div className="login-art-copy"><span className="eyebrow">A home for cinema</span><h1>Every film<br /><em>has a story.</em></h1><p>Keep the ones that become part of yours.</p></div><div className="film-strip"><span>NOIR</span><span>ROMANCE</span><span>DRAMA</span></div></div>
    <main className="login-panel"><div className="login-brand"><span className="brand-mark">CV</span><span>CineVault<small>FILM ARCHIVE</small></span></div><div className="login-form-wrap"><span className="eyebrow">Welcome back</span><h2>Sign in to your archive.</h2><p className="login-intro">Continue collecting, reviewing, and remembering great films.</p><form onSubmit={submitLogin}><label>Email address<input type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} placeholder="you@example.com" autoComplete="email" /></label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} placeholder="Enter your password" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label><div className="login-options"><label className="check-label"><input type="checkbox" checked={loginForm.remember} onChange={(event) => setLoginForm({ ...loginForm, remember: event.target.checked })} /> Remember me</label><button type="button" className="link-button" onClick={() => notify('Password reset link requested')}>Forgot password?</button></div><button className="primary-button login-submit" type="submit">Sign in <span>→</span></button></form><p className="signup-prompt">New to CineVault? <button className="link-button" onClick={() => notify('Sign up flow opened')}>Create an account</button></p><button className="back-to-archive" onClick={() => setShowLogin(false)}>← Back to archive</button></div></main>
  </div>;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">CV</span><span>CineVault<small>FILM ARCHIVE</small></span></div>
      <nav className="main-nav" aria-label="Main navigation">
        <button className={`nav-item ${filter === 'All films' ? 'active' : ''}`} onClick={() => selectFilter('All films')}><span>▦</span> Archive <b>248</b></button>
        <button className={`nav-item ${filter === 'Recently added' ? 'active' : ''}`} onClick={() => selectFilter('Recently added')}><span>◷</span> Recently added</button>
        <button className={`nav-item ${filter === 'My shelf' ? 'active' : ''}`} onClick={() => setFilter('My shelf')}><span>☆</span> My shelf <b>{saved.length || 12}</b></button>
      </nav>
      <div className="nav-section"><span>COLLECTIONS</span><button className="nav-item"><i className="dot amber" /> Essential cinema <b>86</b></button><button className="nav-item"><i className="dot teal" /> New wave <b>42</b></button><button className="nav-item"><i className="dot coral" /> Comfort rewatches <b>18</b></button></div>
      <div className="sidebar-bottom"><button className="profile"><span className="avatar">AJ</span><span><strong>Alex Jordan</strong><small>Film enthusiast</small></span><span className="chevron">⌄</span></button></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs"><span>Explore</span><b>/</b> Film archive</div><div className="top-actions"><button className="icon-button" aria-label="Notifications">♧<em /></button><button className="avatar mini" onClick={() => setShowLogin(true)} aria-label="Open account">AJ</button></div></header>
      <section className="hero-row"><div><p className="eyebrow">A personal cinema journal <span>•</span> 21 September 2026</p><h1>Films worth <em>remembering.</em></h1><p className="subhead">Discover, review, and keep the stories that stay with you.</p></div><button className="primary-button" onClick={() => notify('Review composer opened')}><span>＋</span> Write a review</button></section>
      <section className="featured-film"><div className="featured-poster poster"><span>NOIR<br />/ 73</span><strong>FEATURED</strong><i>✦</i></div><div className="featured-copy"><span className="eyebrow">EDITOR'S PICK · 01</span><h2>The Long Goodbye</h2><p className="featured-meta">Robert Altman <span>•</span> 1973 <span>•</span> Noir <span>•</span> 112m</p><p className="featured-description">A private eye drifts through a sun-bleached Los Angeles that has forgotten how to be honest. A beautifully loose, melancholy mystery with a pulse all its own.</p><div className="featured-actions"><button className="primary-button" onClick={() => setSelected(films[0])}>View film <span>→</span></button><button className="quiet-button" onClick={() => saveFilm(films[0])}>☆ Add to shelf</button></div></div><div className="featured-rating"><strong>8.0</strong><span>IMDb rating</span><b>★★★★<i>★</i></b><small>2,418 community reviews</small></div></section>
      <section className="stats-row" aria-label="Archive statistics"><div className="stat"><span className="stat-label">IN YOUR ARCHIVE</span><strong>248</strong><small><i className="up">↗</i> 12 added this month</small></div><div className="stat"><span className="stat-label">REVIEWS WRITTEN</span><strong>37</strong><small><i className="up">↗</i> 8 this year</small></div><div className="stat"><span className="stat-label">YOUR AVG. RATING</span><strong>7.8 <small>/ 10</small></strong><small><i className="neutral">●</i> Taste is evolving</small></div></section>
      <section className="toolbar"><div className="tabs"><button className={filter === 'All films' ? 'selected' : ''} onClick={() => selectFilter('All films')}>All films <span>248</span></button><button className={filter === 'Recently added' ? 'selected' : ''} onClick={() => selectFilter('Recently added')}>Recently added <span>24</span></button><button className={filter === 'My shelf' ? 'selected' : ''} onClick={() => setFilter('My shelf')}>My shelf <span>{saved.length || 12}</span></button></div><div className="tools"><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, director..." /></label><select aria-label="Sort films"><option>Recently added</option><option>Highest rated</option><option>Release year</option></select><button className="view-button active" aria-label="Grid view">▦</button><button className="view-button" aria-label="List view">☷</button></div></section>
      <div className="content-grid"><section className="archive-section"><div className="section-heading"><div><h2>{filter === 'My shelf' ? 'Your shelf' : 'Recently added'}</h2><p>{visibleFilms.length} films in your collection</p></div><button className="text-button">View all <span>→</span></button></div><div className="film-grid">{visibleFilms.length ? visibleFilms.slice(0, 6).map((film, index) => { const id = film.id || film._id; const isSaved = saved.includes(id); return <article className="film-card" key={id || index} onClick={() => setSelected(film)}><div className="poster" style={{ '--accent': film.accent || '#c5a46d' }}><span>{film.poster || String(film.title || 'FILM').slice(0, 10).toUpperCase()}</span><strong>{film.year}</strong><i>✦</i></div><div className="film-meta"><div><h3>{film.title}</h3><p>{film.director} <span>•</span> {film.genre}</p></div><button className={`save-button ${isSaved ? 'saved' : ''}`} onClick={(event) => { event.stopPropagation(); saveFilm(film); }} aria-label={`Save ${film.title}`}>{isSaved ? '★' : '☆'}</button></div><div className="film-foot"><span>★ {film.rating || '—'}</span><span>{film.runtime || '—'}</span></div></article>; }) : <div className="empty-state">No films match that search.<button className="text-button" onClick={() => { setQuery(''); setFilter('All films'); }}>Clear filters</button></div>}</div></section></div>
      <footer><span>© 2026 CineVault</span><span>Made for people who love movies</span><span>v2.4.0</span></footer>
    </main>

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="film-modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setSelected(null)} aria-label="Close">×</button><div className="modal-poster poster" style={{ '--accent': selected.accent || '#c5a46d' }}><span>{selected.poster || 'FILM'}</span><strong>{selected.year}</strong></div><div className="modal-copy"><span className="eyebrow">FILM DETAIL</span><h2>{selected.title}</h2><p className="director">{selected.director} <span>•</span> {selected.genre}</p><p>{selected.description || 'A newly indexed title in your personal cinematic archive.'}</p><div className="modal-facts"><span><b>★ {selected.rating || '—'}</b> rating</span><span><b>{selected.runtime || '—'}</b> runtime</span></div><button className="primary-button" onClick={() => saveFilm(selected)}>{saved.includes(selected.id || selected._id) ? '★ Saved to shelf' : '☆ Save to shelf'}</button></div></div></div>}
    {toast && <div className="toast">{toast} <span>✓</span></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
