import { Link } from "react-router-dom";
import "./LoginPage.css";

// Basit damla logosu (inline SVG, Bölüm 2)
function DropLogo() {
  return (
    <svg className="login-logo" width="64" height="64" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5c-.3 0-.6.2-.8.4C9.6 5 5 11 5 15a7 7 0 0 0 14 0c0-4-4.6-10-6.2-12.1-.2-.2-.5-.4-.8-.4z"
        fill="var(--color-primary)"
      />
      <path
        d="M9 15.5a3 3 0 0 0 3 3"
        fill="none"
        stroke="var(--color-surface)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Ekran 1 — Giriş (Bölüm 7.1)
export default function LoginPage() {
  return (
    <main className="page login-page">
      <header className="login-header">
        <DropLogo />
        <h1 className="login-brand">SmartWater</h1>
        <p className="login-slogan">Suyunu telefonundan al, sayacına yükle.</p>
      </header>

      <section className="login-intro">
        <p>
          Su yükleme noktasına gitmeden, telefonunuzdan su satın alın ve NFC destekli sayacınıza
          aktarın.
        </p>
        <Link to="/about" className="login-about-link">
          Hakkında
        </Link>
      </section>
    </main>
  );
}
