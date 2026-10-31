import { useEffect, useRef } from "react";
import Button from "../../components/Button.jsx";
import { formatDateTime, formatM3, formatTL } from "../../utils/format.js";
import "./ReceiptModal.css";

export default function ReceiptModal({ transaction, account, status, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const fields = [
    ["İşlem numarası", transaction.id],
    ["İşlem tarihi", formatDateTime(transaction.createdAt)],
    ["Abonelik numarası", account.subscriberNo],
    ["Ad soyad", account.fullName],
    ["Sayaç numarası", transaction.meterNo],
    ["Satın alınan su miktarı", formatM3(transaction.amountM3)],
    ["Birim fiyat", `${formatTL(transaction.pricePerM3TL)} / ton`],
    ["Toplam tutar", formatTL(transaction.totalTL)],
    ["Ödeme yöntemi", `Kart •••• ${transaction.cardLast4}`],
  ];

  return (
    <dialog
      ref={dialogRef}
      className="history-receipt-modal"
      aria-labelledby="history-receipt-title"
      onCancel={(event) => event.preventDefault()}
    >
      <header className="history-receipt-header">
        <div className="history-receipt-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
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
          <span>SmartWater</span>
        </div>
        <h2 id="history-receipt-title" className="history-receipt-title">Dijital Makbuz</h2>
      </header>

      <dl className="history-receipt-details">
        {fields.map(([label, value]) => (
          <div key={label} className="history-receipt-field">
            <dt className="history-receipt-label">{label}</dt>
            <dd className="history-receipt-value">{value}</dd>
          </div>
        ))}
        <div className="history-receipt-field">
          <dt className="history-receipt-label">İşlem durumu</dt>
          <dd className="history-receipt-value">
            <span className={`history-status history-status--${status.tone}`}>{status.label}</span>
          </dd>
        </div>
      </dl>

      <p className="history-receipt-note">Bu makbuz kâğıt yerine dijital olarak saklanır.</p>
      <Button fullWidth onClick={onClose} className="history-receipt-close">Kapat</Button>
    </dialog>
  );
}
