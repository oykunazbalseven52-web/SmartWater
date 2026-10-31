import { useState } from "react";
import Button from "../../components/Button.jsx";
import Alert from "../../components/Alert.jsx";
import { purchaseWater } from "../../services/smartWaterService.js";
import { DEMO_CARD } from "../../services/constants.js";
import { formatM3 } from "../../utils/format.js";
import "./PurchasePage.css";

// GEÇİCİ SAYFA — Sinem bu dosyanın içini Ekran 3'e (Bölüm 7.3) göre dolduracak.
// Aşağıdaki test butonu da geçicidir (Bölüm 8.1.2); Sinem'in ekranıyla birlikte kalkar.
export default function PurchasePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleTestPurchase() {
    setLoading(true);
    setResult(null);
    const response = await purchaseWater({ amountM3: 10, card: DEMO_CARD });
    setResult(response);
    setLoading(false);
  }

  return (
    <div className="page purchase-placeholder">
      <h1 className="page-title">Satın Al</h1>
      <p className="text-muted">Bu ekran yapım aşamasında — Sinem</p>

      <Button variant="secondary" fullWidth loading={loading} onClick={handleTestPurchase}>
        Test: 10 ton satın al (geçici)
      </Button>

      {result?.ok && (
        <Alert type="success" title="Test satın alma başarılı">
          {formatM3(result.data.transaction.amountM3)} eklendi. Yükleme bekleyen:{" "}
          {formatM3(result.data.account.pendingM3)}
        </Alert>
      )}
      {result && !result.ok && <Alert type="error">{result.error.message}</Alert>}
    </div>
  );
}
