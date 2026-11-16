import { Link } from "react-router-dom";

export default function Layout({ eventTitle, onCustomize, children }) {
  return (
    <div className="app-shell">
      <div className="bg-layer" aria-hidden="true">
        <img
          className="bg-photo"
          src="/christmas-bg.jpg"
          alt=""
        />
      </div>
      <div className="snow" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">{eventTitle}</span>
        </Link>
        <button
          type="button"
          className="nav-quiet"
          onClick={onCustomize}
        >
          Personalizar
        </button>
      </header>
      <main className="page">{children}</main>
      <footer className="site-footer">
        Lista de deseos · Navidad · Amigo secreto
      </footer>
    </div>
  );
}
