import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import SimulationBadge from "../../components/SimulationBadge.jsx";
import Spinner from "../../components/Spinner.jsx";
import { WRONG_METER_NO } from "../../services/constants.js";
import { getAccount, loadToMeter } from "../../services/smartWaterService.js";
import { formatM3 } from "../../utils/format.js";
import "./NfcLoadPage.css";

export default function NfcLoadPage() {
  const navigate = useNavigate();
  const [loadResult, setLoadResult] = useState(null);
  const loadRequest = useRef(null);
  const finishAnimation = useRef(null);
  const retryLocked = useRef(false);
  const [account, setAccount] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("idle");
  const isMounted = useRef(false);
  const flowLocked = useRef(false);
  const readLocked = useRef(false);
  // Okutulan sayaç no; null ise kullanıcının kendi sayacı okutulur
  const readMeterNo = useRef(null);

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
    // Yanlış sayaç okutulduysa "eşleşti" adımı atlanır; servis METER_MISMATCH döner
    const isOwnMeter = !readMeterNo.current || readMeterNo.current === account?.meterNo;
    const transitions = {
      checking: { next: "waiting", delayMs: 1500 },
      reading: { next: isOwnMeter ? "matched" : "loading", delayMs: 1000 },
      matched: { next: "loading", delayMs: 1000 },
    };
    const transition = transitions[stage];
    if (!transition) return;

    const timeoutId = setTimeout(() => {
      setStage(transition.next);
    }, transition.delayMs);

    return () => clearTimeout(timeoutId);
  }, [stage, account]);

  useEffect(() => {
    if (stage !== "loading" || !account) return;
    let isActive = true;

    // Aynı akışta effect tekrar kurulsa bile mevcut isteği kullan.
    if (!loadRequest.current) {
      loadRequest.current = loadToMeter({ meterNo: readMeterNo.current ?? account.meterNo });
    }
    const animationFinished = new Promise((resolve) => {
      finishAnimation.current = resolve;
    });

    Promise.all([loadRequest.current, animationFinished]).then(([response]) => {
      if (!isActive) return;
      if (response.ok) {
        setLoadResult(response.data);
        setStage("success");
      } else {
        setError(response.error.message);
        setStage("error");
      }
    });

    return () => {
      isActive = false;
      finishAnimation.current = null;
    };
  }, [stage, account]);

  function handleProgressEnd(event) {
    if (event.target !== event.currentTarget) return;
    finishAnimation.current?.();
  }

  async function handleRetry() {
    if (retryLocked.current || isFetching) return;
    retryLocked.current = true;
    setStage("idle");
    setIsFetching(true);
    setError(null);
    setAccount(null);
    setLoadResult(null);
    loadRequest.current = null;
    readLocked.current = false;
    readMeterNo.current = null;

    const response = await getAccount();
    if (!isMounted.current) return;
    if (response.ok) {
      setAccount(response.data);
    } else {
      setError(response.error.message);
      setStage("error");
    }
    setIsFetching(false);
    flowLocked.current = false;
    retryLocked.current = false;
  }

  async function handleStart() {
    // React yeniden çizmeden gelen ikinci tıklamayı da engelle.
    if (flowLocked.current || isFetching || stage !== "idle") return;
    flowLocked.current = true;
    readLocked.current = false;
    readMeterNo.current = null;
    loadRequest.current = null;
    setIsFetching(true);
    setError(null);

    const response = await getAccount();
    if (!isMounted.current) return;

    setIsFetching(false);
    if (!response.ok) {
      setError(response.error.message);
      flowLocked.current = false;
      setStage("error");
      return;
    }

    setAccount(response.data);
    if (response.data.pendingM3 === 0) {
      flowLocked.current = false;
      return;
    }

    setStage("checking");
  }

  function handleRead(meterNo) {
    if (stage !== "waiting" || readLocked.current) return;
    readLocked.current = true;
    readMeterNo.current = meterNo;
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

      {!isFetching && error && (
        <div className="nfc-result">
          <Alert type="error">
            <span aria-hidden="true">✗ </span>{error}
          </Alert>
          <Button fullWidth onClick={handleRetry}>Tekrar Dene</Button>
        </div>
      )}

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
          <Button fullWidth onClick={() => handleRead(account.meterNo)}>Sayaca Okut (Simülasyon)</Button>
          <Button variant="ghost" fullWidth onClick={handleCancel}>Vazgeç</Button>
          <button type="button" className="nfc-wrong-meter-link" onClick={() => handleRead(WRONG_METER_NO)}>
            Farklı bir sayaç okut (demo)
          </button>
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
      {stage === "loading" && account && (
        <Card className="nfc-result">
          <p role="status">{formatM3(account.pendingM3)} sayaca aktarılıyor…</p>
          <div className="nfc-progress" role="progressbar" aria-label="Sayaca aktarım ilerlemesi" aria-valuemin={0} aria-valuemax={100}>
            <div className="nfc-progress-fill" onAnimationEnd={handleProgressEnd} />
          </div>
        </Card>
      )}

      {stage === "success" && loadResult && (
        <Card className="nfc-result">
          <h2 className="nfc-card-title" role="status">
            <span className="nfc-match-icon" aria-hidden="true">✓ </span>
            Yükleme başarılı
          </h2>
          <p>
            {formatM3(loadResult.loadedM3)} sayacınıza yüklendi. Yeni sayaç bakiyesi: {formatM3(loadResult.newMeterBalanceM3)}
          </p>
          <Button fullWidth onClick={() => navigate("/home")}>Ana Sayfa</Button>
          <Button variant="secondary" fullWidth onClick={() => navigate("/history")}>
            İşlem Geçmişi
          </Button>
        </Card>
      )}
    </div>
  );
}


