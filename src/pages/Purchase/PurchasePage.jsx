import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Alert from "../../components/Alert.jsx";
import Spinner from "../../components/Spinner.jsx";
import { getAccount, purchaseWater } from "../../services/smartWaterService.js";
import {
  PRICE_PER_M3_TL,
  MIN_PURCHASE_M3,
  MAX_PURCHASE_M3,
  PURCHASE_PRESETS_M3,
  DEMO_CARD,
} from "../../services/constants.js";
import { formatM3, formatTL, formatDateTime } from "../../utils/format.js";
import "./PurchasePage.css";

const DEFAULT_PRESET_M3 = 10;

// Kart alanı biçimleyicileri: sadece rakam, yazarken gruplama
function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function formatCvv(value) {
  return value.replace(/\D/g, "").slice(0, 3);
}

// Servisteki isValidCard ile aynı kurallar (16 hane, AA/YY geçmiş ay değil, CVV 3 hane)
function isValidCardNumber(value) {
  return /^\d{16}$/.test(value.replace(/\s/g, ""));
}

function isValidExpiry(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return !(year < currentYear || (year === currentYear && month < currentMonth));
}

function isValidCvv(value) {
  return /^\d{3}$/.test(value.trim());
}

// Geçerliyse tam sayıyı, değilse null döner
function parseAmount(text) {
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value >= MIN_PURCHASE_M3 && value <= MAX_PURCHASE_M3 ? value : null;
}

export default function PurchasePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [account, setAccount] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_PRESET_M3);
  const [amountText, setAmountText] = useState(String(DEFAULT_PRESET_M3));

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const cardNumberError = cardNumber.length === 19 && !isValidCardNumber(cardNumber);
  const expiryError = expiry.length === 5 && !isValidExpiry(expiry);

  function fillDemoCard() {
    setCardNumber(DEMO_CARD.number);
    setExpiry(DEMO_CARD.expiry);
    setCvv(DEMO_CARD.cvv);
  }

  const amountM3 = parseAmount(amountText);
  const amountError = amountM3 === null;
  const totalTL = amountM3 === null ? null : amountM3 * PRICE_PER_M3_TL;

  const cardValid = isValidCardNumber(cardNumber) && isValidExpiry(expiry) && isValidCvv(cvv);
  const canPay = !amountError && cardValid && !submitting;

  async function handlePay() {
    if (!canPay) return;
    setSubmitting(true);
    setPaymentError(null);
    const response = await purchaseWater({
      amountM3,
      card: { number: cardNumber, expiry, cvv },
    });
    setSubmitting(false);
    if (response.ok) {
      setCompletedTransaction(response.data.transaction);
    } else {
      setPaymentError(response.error.message);
    }
  }

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

  if (completedTransaction) {
    return (
      <div className="page purchase-page">
        <Card className="purchase-success">
          <div className="purchase-success-icon" aria-hidden="true">✓</div>
          <h1 className="purchase-success-title">Ödeme başarılı</h1>
          <p className="purchase-success-text">
            {formatM3(completedTransaction.amountM3)} su hesabınıza yükleme hakkı olarak
            tanımlandı. Sayacınıza aktarmak için NFC ile yükleyin.
          </p>
          <div className="purchase-success-meta">
            <div className="purchase-summary-row">
              <span className="text-muted">İşlem no</span>
              <strong>{completedTransaction.id}</strong>
            </div>
            <div className="purchase-summary-row">
              <span className="text-muted">Tarih</span>
              <strong>{formatDateTime(completedTransaction.createdAt)}</strong>
            </div>
          </div>
          <div className="purchase-success-actions">
            <Button variant="primary" fullWidth onClick={() => navigate("/load")}>
              NFC ile Sayaca Yükle
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate("/home")}>
              Ana Sayfaya Dön
            </Button>
          </div>
        </Card>
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

      <Card title="Ödeme bilgileri">
        <div className="purchase-card-form">
          <label className="purchase-field">
            <span className="purchase-field-label">Kart numarası</span>
            <input
              className={`purchase-input${cardNumberError ? " purchase-input--error" : ""}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
            />
          </label>

          <div className="purchase-card-row">
            <label className="purchase-field">
              <span className="purchase-field-label">Son kullanma (AA/YY)</span>
              <input
                className={`purchase-input${expiryError ? " purchase-input--error" : ""}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="AA/YY"
                value={expiry}
                onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                aria-invalid={expiryError}
              />
            </label>
            <label className="purchase-field">
              <span className="purchase-field-label">CVV</span>
              <input
                className="purchase-input"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="•••"
                value={cvv}
                onChange={(event) => setCvv(formatCvv(event.target.value))}
              />
            </label>
          </div>

          {cardNumberError && (
            <p className="purchase-field-error">Kart numarası 16 haneli olmalıdır.</p>
          )}
          {expiryError && (
            <p className="purchase-field-error">
              Son kullanma tarihi geçerli olmalı ve geçmiş bir ay olmamalı.
            </p>
          )}

          <button type="button" className="purchase-link-button" onClick={fillDemoCard}>
            Demo kartıyla doldur
          </button>
        </div>
        <p className="text-muted purchase-sim-note">
          Bu bir simülasyondur; gerçek ödeme alınmaz ve kart bilgileriniz saklanmaz.
        </p>
      </Card>

      {paymentError && (
        <Alert
          type="error"
          title="Ödeme tamamlanamadı"
          action={
            <Button variant="secondary" onClick={handlePay} disabled={!canPay}>
              Tekrar Dene
            </Button>
          }
        >
          {paymentError}
        </Alert>
      )}

      <Button variant="primary" fullWidth loading={submitting} disabled={!canPay} onClick={handlePay}>
        {submitting
          ? "Ödeme işleniyor…"
          : `Ödemeyi Tamamla (${totalTL === null ? "—" : formatTL(totalTL)})`}
      </Button>
    </div>
  );
}
