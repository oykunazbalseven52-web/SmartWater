import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import SimulationBadge from "../../components/SimulationBadge.jsx";
import Spinner from "../../components/Spinner.jsx";
import { getAccount } from "../../services/smartWaterService.js";
import { formatM3 } from "../../utils/format.js";
import "./NfcLoadPage.css";

export default function NfcLoadPage() {
  const [account, setAccount] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("idle");
  const isMounted = useRef(false);
  const flowLocked = useRef(false);
  const readLocked = useRef(false);

  useEffect(() => {
    let isActive = true;
    isMounted.current = true;

    async function fetchAccount() {
      const response = await getAccount();
      if (!isActive) return;

      if (response.ok) {
        setAccount(response.data);
      } else {
        setError(response.error.message);
      }
      setIsFetching(false);
    }

    fetchAccount();

    return () => {
      isActive = false;
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const transitions = {
      checking: { next: "waiting", delayMs: 1500 },
      reading: { next: "matched", delayMs: 1000 },
      matched: { next: "loading", delayMs: 1000 },
    };
    const transition = transitions[stage];
    if (!transition) return;

    // loading bu aşamada yalnızca geçiş hedefidir; aktarım başlatılmaz.
    const timeoutId = setTimeout(() => {
      setStage(transition.next);
    }, transition.delayMs);

    return () => clearTimeout(timeoutId);
  }, [stage]);

  async function handleStart() {
    // React yeniden çizmeden gelen ikinci tıklamayı da engelle.
    if (flowLocked.current || isFetching || stage !== "idle") return;
    flowLocked.current = true;
    readLocked.current = false;
    setIsFetching(true);
    setError(null);

    const response = await getAccount();
    if (!isMounted.current) return;

    setIsFetching(false);
    if (!response.ok) {
      setError(response.error.message);
      flowLocked.current = false;
      return;
    }

    setAccount(response.data);
    if (response.data.pendingM3 === 0) {
      flowLocked.current = false;
      return;
    }

    setStage("checking");
  }

  function handleRead() {
    if (stage !== "waiting" || readLocked.current) return;
    readLocked.current = true;
    setStage("reading");
  }

  function handleCancel() {
    if (stage !== "waiting" || readLocked.current) return;
    setStage("idle");
    flowLocked.current = false;
  }

  return (
    <div className="nfc-page">
      <header className="nfc-header">
        <SimulationBadge />
        <p className="nfc-note">Bu prototipte NFC aktarımı simüle edilir.</p>
        <h1 className="nfc-title">NFC ile Sayaca Yükleme</h1>
      </header>

      {isFetching && (
        <div className="nfc-fetching" role="status">
          <Spinner />
          <p>Hesap bilgileri yükleniyor…</p>
        </div>
      )}

      {!isFetching && error && <Alert type="error">{error}</Alert>}

      {!isFetching && account && stage === "idle" && (
        account.pendingM3 > 0 ? (
          <Card className="nfc-balance-card">
            <h2 className="nfc-card-title">
              Yükleme bekleyen: {formatM3(account.pendingM3)}
            </h2>
            <p className="nfc-meter">Sayaç: {account.meterNo}</p>
            <Button fullWidth onClick={handleStart}>Yüklemeyi Başlat</Button>
          </Card>
        ) : (
          <Card className="nfc-empty-card">
            <p>Yüklenecek bakiye yok.</p>
            <Link className="nfc-purchase-link" to="/purchase">Su Satın Al</Link>
          </Card>
        )
      )}

      {stage === "checking" && (
        <div className="nfc-fetching" role="status">
          <Spinner />
          <p>Telefonunuzun NFC desteği kontrol ediliyor…</p>
        </div>
      )}

      {stage === "waiting" && (
        <Card className="nfc-waiting-card">
          <div className="nfc-animation" aria-hidden="true">
            <div className="nfc-phone">
              <span className="nfc-wave nfc-wave-first" />
              <span className="nfc-wave nfc-wave-second" />
              <span className="nfc-wave nfc-wave-third" />
            </div>
          </div>
          <p role="status">Telefonunuzu sayacınızdaki NFC alanına yaklaştırın.</p>
          <Button fullWidth onClick={handleRead}>Sayaca Okut (Simülasyon)</Button>
          <Button variant="ghost" fullWidth onClick={handleCancel}>Vazgeç</Button>
        </Card>
      )}
      {stage === "reading" && (
        <p role="status">Sayaç okunuyor…</p>
      )}

      {stage === "matched" && account && (
        <p className="nfc-match-message" role="status">
          <span className="nfc-match-icon" aria-hidden="true">✓</span>{" "}
          Sayaç eşleşti: {account.meterNo} · Abonelik {account.subscriberNo}
        </p>
      )}
    </div>
  );
}

