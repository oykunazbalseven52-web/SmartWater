import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Alert from "../../components/Alert.jsx";
import { login } from "../../services/smartWaterService.js";
import { DEMO_SUBSCRIBER_NO } from "../../services/constants.js";
import "./LoginPage.css";

// GEÇİCİ SAYFA — Eylül bu dosyanın içini Ekran 1'e (Bölüm 7.1) göre dolduracak.
// Aşağıdaki test butonu da geçicidir; Eylül'ün ekranıyla birlikte kalkar.
export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleTestLogin() {
    setLoading(true);
    setError(null);
    const response = await login(DEMO_SUBSCRIBER_NO);
    if (response.ok) {
      navigate("/home", { replace: true });
      return;
    }
    setError(response.error.message);
    setLoading(false);
  }

  return (
    <div className="page login-placeholder">
      <h1 className="page-title">Giriş</h1>
      <p className="text-muted">Bu ekran yapım aşamasında — Eylül</p>

      <Button variant="secondary" fullWidth loading={loading} onClick={handleTestLogin}>
        Test: Demo ile giriş yap
      </Button>

      {error && <Alert type="error">{error}</Alert>}
    </div>
  );
}
