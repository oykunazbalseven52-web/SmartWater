import { useEffect, useState } from "react";
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

  useEffect(() => {
    let isActive = true;

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
    };
  }, []);

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

      {!isFetching && account && (
        account.pendingM3 > 0 ? (
          <Card className="nfc-balance-card">
            <h2 className="nfc-card-title">
              Yükleme bekleyen: {formatM3(account.pendingM3)}
            </h2>
            <p className="nfc-meter">Sayaç: {account.meterNo}</p>
            <Button fullWidth>Yüklemeyi Başlat</Button>
          </Card>
        ) : (
          <Card className="nfc-empty-card">
            <p>Yüklenecek bakiye yok.</p>
            <Link className="nfc-purchase-link" to="/purchase">Su Satın Al</Link>
          </Card>
        )
      )}
    </div>
  );
}
