import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Alert from "../../components/Alert.jsx";
import Spinner from "../../components/Spinner.jsx";
import {
  getAccount,
  getTransactions,
  logout,
  resetDemoData,
} from "../../services/smartWaterService.js";
import { formatDateTime, formatM3, formatTL } from "../../utils/format.js";
import ReceiptModal from "./ReceiptModal.jsx";
import "./HistoryPage.css";

const TRANSACTION_STATUSES = {
  pending_load: { label: "Yükleme bekliyor", tone: "warning" },
  loaded: { label: "Sayaca yüklendi", tone: "success" },
  completed: { label: "Tamamlandı", tone: "success" },
  failed: { label: "Başarısız", tone: "error" },
};

const FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "purchase", label: "Satın alma" },
  { id: "meter_load", label: "Yükleme" },
];

const RESET_CONFIRM_TIMEOUT_MS = 4000;

function TransactionIcon({ isPurchase }) {
  return (
    <svg
      className="history-transaction-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isPurchase ? (
        <>
          <path d="M5 8h14v12H5z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </>
      ) : (
        <>
          <path d="M12 3v12m-4-4 4 4 4-4" />
          <path d="M5 16v5h14v-5" />
        </>
      )}
    </svg>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filter, setFilter] = useState("all");
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState(null);
  const actionInProgress = useRef(false);

  async function runAccountAction(action) {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setPendingAction(action);
    setActionError(null);

    try {
      const result = await (action === "logout" ? logout() : resetDemoData());
      if (result.ok) {
        navigate("/login", { replace: true });
      } else {
        setActionError(result.error.message);
      }
    } finally {
      actionInProgress.current = false;
      setPendingAction(null);
    }
  }

  function handleResetClick() {
    if (actionInProgress.current) return;
    if (!resetConfirmed) {
      setResetConfirmed(true);
      return;
    }
    runAccountAction("reset");
  }

  // Onay istemi bir süre sonra kendiliğinden kalkar; yanlışlıkla sıfırlamayı önler
  useEffect(() => {
    if (!resetConfirmed) return;
    const timeoutId = setTimeout(() => setResetConfirmed(false), RESET_CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(timeoutId);
  }, [resetConfirmed]);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      const [accountResult, transactionsResult] = await Promise.all([
        getAccount(),
        getTransactions(),
      ]);

      if (!active) return;

      if (!accountResult.ok) {
        setError(accountResult.error.message);
      } else if (!transactionsResult.ok) {
        setError(transactionsResult.error.message);
      } else {
        setAccount(accountResult.data);
        // getTransactions returns transactions from newest to oldest.
        setTransactions(transactionsResult.data);
      }
      setLoading(false);
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const visibleTransactions =
    filter === "all" ? transactions : transactions.filter((transaction) => transaction.type === filter);

  return (
    <div className="history-page">
      <h1 className="history-title">İşlem Geçmişi &amp; Hesap</h1>

      {loading ? (
        <div className="history-loading">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : (
        <>
          <Card title="Hesap bilgileri" className="history-account-card">
            <dl className="history-account-details">
              <div className="history-account-field">
                <dt className="history-account-label">Ad soyad</dt>
                <dd className="history-account-value">{account.fullName}</dd>
              </div>
              <div className="history-account-field">
                <dt className="history-account-label">Abonelik numarası</dt>
                <dd className="history-account-value">{account.subscriberNo}</dd>
              </div>
              <div className="history-account-field">
                <dt className="history-account-label">Adres</dt>
                <dd className="history-account-value">{account.address}</dd>
              </div>
              <div className="history-account-field">
                <dt className="history-account-label">Belediye</dt>
                <dd className="history-account-value">{account.municipality}</dd>
              </div>
              <div className="history-account-field">
                <dt className="history-account-label">Sayaç numarası</dt>
                <dd className="history-account-value">{account.meterNo}</dd>
              </div>
            </dl>
          </Card>

          <Card title="İşlem geçmişi" className="history-transactions-card">
            {transactions.length > 0 && (
              <div className="history-filters" role="group" aria-label="İşlem filtresi">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`history-filter${filter === item.id ? " history-filter--active" : ""}`}
                    aria-pressed={filter === item.id}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {transactions.length === 0 ? (
              <p className="history-empty">Henüz işlem yok.</p>
            ) : visibleTransactions.length === 0 ? (
              <p className="history-empty">Bu filtrede işlem yok.</p>
            ) : (
              <ul className="history-transaction-list">
                {visibleTransactions.map((transaction) => {
                  const isPurchase = transaction.type === "purchase";
                  const status = TRANSACTION_STATUSES[transaction.status];
                  const TransactionElement = isPurchase ? "button" : "div";

                  return (
                    <li key={transaction.id} className="history-transaction-row">
                      <TransactionElement
                        className={`history-transaction-content${isPurchase ? " history-transaction-button" : ""}`}
                        type={isPurchase ? "button" : undefined}
                        onClick={isPurchase ? () => setSelectedTransaction(transaction) : undefined}
                        aria-haspopup={isPurchase ? "dialog" : undefined}
                      >
                        <span className="history-transaction-type">
                          <TransactionIcon isPurchase={isPurchase} />
                          <span>{isPurchase ? "Su satın alma" : "Sayaca yükleme"}</span>
                        </span>
                        <time className="history-transaction-date" dateTime={transaction.createdAt}>
                          {formatDateTime(transaction.createdAt)}
                        </time>
                        <span className="history-transaction-amounts">
                          <span>{formatM3(transaction.amountM3)}</span>
                          {isPurchase && <span>{formatTL(transaction.totalTL)}</span>}
                        </span>
                        <span className={`history-status history-status--${status.tone}`}>
                          {status.label}
                        </span>
                      </TransactionElement>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          <div className="history-account-actions">
            {actionError && <Alert type="error">{actionError}</Alert>}
            <Button
              variant="secondary"
              fullWidth
              loading={pendingAction === "logout"}
              disabled={pendingAction !== null}
              onClick={() => runAccountAction("logout")}
              className="history-logout-button"
            >
              Çıkış Yap
            </Button>
            <Button
              variant="ghost"
              fullWidth
              loading={pendingAction === "reset"}
              disabled={pendingAction !== null}
              onClick={handleResetClick}
              className="history-reset-button"
            >
              {resetConfirmed ? "Emin misiniz? Tekrar dokunun" : "Demo verisini sıfırla"}
            </Button>
          </div>
          {selectedTransaction && (
            <ReceiptModal
              transaction={selectedTransaction}
              account={account}
              status={TRANSACTION_STATUSES[selectedTransaction.status]}
              onClose={() => setSelectedTransaction(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
