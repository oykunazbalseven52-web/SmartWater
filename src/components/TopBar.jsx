import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../services/smartWaterService.js";
import "./TopBar.css";

function DropIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
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

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 5l-7 7 7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TopBar({ title, showBack = false }) {
  const navigate = useNavigate();

  // Geri butonu: giriş yapılmışsa /home, değilse /login (Bölüm 6)
  function handleBack() {
    navigate(isLoggedIn() ? "/home" : "/login");
  }

  return (
    <header className="ui-topbar">
      <div className="ui-topbar__left">
        {showBack && (
          <button type="button" className="ui-topbar__icon-button" onClick={handleBack} aria-label="Geri">
            <BackIcon />
          </button>
        )}
        {showBack && title ? (
          <h1 className="ui-topbar__title">{title}</h1>
        ) : (
          <div className="ui-topbar__brand">
            <DropIcon />
            <span className="ui-topbar__brand-name">SmartWater</span>
          </div>
        )}
      </div>

      {!showBack && (
        <Link to="/about" className="ui-topbar__icon-button" aria-label="Hakkında">
          <InfoIcon />
        </Link>
      )}
    </header>
  );
}
