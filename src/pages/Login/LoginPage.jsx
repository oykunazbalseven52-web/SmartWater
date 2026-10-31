import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { DEMO_SUBSCRIBER_NO } from "../../services/constants.js";
import { login } from "../../services/smartWaterService.js";
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
  const navigate = useNavigate();
  const [subscriberNo, setSubscriberNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDisabled = loading || subscriberNo.trim() === "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (isDisabled) return;
    setError(null);
    setLoading(true);
    const result = await login(subscriberNo);
    setLoading(false);
    if (result.ok) {
      navigate("/home", { replace: true });
    } else {
      setError(result.error.message);
    }
  }

  function handleDemoClick() {
    setSubscriberNo(DEMO_SUBSCRIBER_NO);
  }

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

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <label className="login-field-label" htmlFor="subscriber-no">
          Abonelik numarası
        </label>
        <input
          id="subscriber-no"
          className="login-field-input"
          type="text"
          placeholder="SW-100245"
          value={subscriberNo}
          onChange={(e) => setSubscriberNo(e.target.value)}
          autoComplete="off"
        />
        {error && (
          <Alert type="error">
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          fullWidth
          disabled={isDisabled}
          loading={loading}
          className="login-submit"
        >
          Giriş Yap
        </Button>
        <button type="button" className="login-demo-hint" onClick={handleDemoClick}>
          Demo abonelik no: <strong>SW-100245</strong>
        </button>
      </form>
    </main>
  );
}
