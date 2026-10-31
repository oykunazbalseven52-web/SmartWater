import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import Alert from "../../components/Alert.jsx";
import Spinner from "../../components/Spinner.jsx";
import { getAccount } from "../../services/smartWaterService.js";
import {
  PRICE_PER_M3_TL,
  MIN_PURCHASE_M3,
  MAX_PURCHASE_M3,
  PURCHASE_PRESETS_M3,
} from "../../services/constants.js";
import { formatTL } from "../../utils/format.js";
import "./PurchasePage.css";

const DEFAULT_PRESET_M3 = 10;

// Geçerliyse tam sayıyı, değilse null döner
function parseAmount(text) {
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value >= MIN_PURCHASE_M3 && value <= MAX_PURCHASE_M3 ? value : null;
}

export default function PurchasePage() {
  const [account, setAccount] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_PRESET_M3);
  const [amountText, setAmountText] = useState(String(DEFAULT_PRESET_M3));

  const amountM3 = parseAmount(amountText);
  const amountError = amountM3 === null;
  const totalTL = amountM3 === null ? null : amountM3 * PRICE_PER_M3_TL;

  function handlePresetClick(preset) {
    setSelectedPreset(preset);
    setAmountText(String(preset));
  }

  function handleAmountChange(event) {
    setSelectedPreset(null);
    setAmountText(event.target.value.trim());
  }

  useEffect(() => {
    let cancelled = false;
    getAccount().then((response) => {
      if (cancelled) return;
      if (response.ok) {
        setAccount(response.data);
      } else {
        setLoadError(response.error.message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <div className="page purchase-page">
        <h1 className="page-title">Satın Al</h1>
        <Alert type="error">{loadError}</Alert>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="page purchase-page purchase-loading">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="page purchase-page">
      <h1 className="page-title">Satın Al</h1>

      <Card className="purchase-account-summary">
        <div className="purchase-summary-row">
          <span className="text-muted">Abonelik no</span>
          <strong>{account.subscriberNo}</strong>
        </div>
        <div className="purchase-summary-row">
          <span className="text-muted">Sayaç no</span>
          <strong>{account.meterNo}</strong>
        </div>
      </Card>

      <Card title="Miktar seç">
        <div className="purchase-presets" role="group" aria-label="Hazır miktarlar">
          {PURCHASE_PRESETS_M3.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`purchase-preset${selectedPreset === preset ? " purchase-preset--active" : ""}`}
              aria-pressed={selectedPreset === preset}
              onClick={() => handlePresetClick(preset)}
            >
              {preset} ton
            </button>
          ))}
        </div>

        <label className="purchase-field">
          <span className="purchase-field-label">Farklı miktar (ton)</span>
          <input
            className={`purchase-input${amountError ? " purchase-input--error" : ""}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amountText}
            onChange={handleAmountChange}
            aria-invalid={amountError}
            aria-describedby={amountError ? "purchase-amount-error" : undefined}
          />
        </label>
        {amountError && (
          <p id="purchase-amount-error" className="purchase-field-error">
            Lütfen {MIN_PURCHASE_M3} ile {MAX_PURCHASE_M3} ton arasında tam sayı girin.
          </p>
        )}
      </Card>

      <Card title="Fiyat özeti">
        <p className="text-muted purchase-unit-price">
          Birim fiyat: {formatTL(PRICE_PER_M3_TL)} / ton (örnek tarife)
        </p>
        <p className="purchase-total">
          Toplam: <strong>{totalTL === null ? "—" : formatTL(totalTL)}</strong>
        </p>
      </Card>
    </div>
  );
}
