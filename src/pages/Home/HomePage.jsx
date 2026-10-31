import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert.jsx";
import Button from "../../components/Button.jsx";
import Card from "../../components/Card.jsx";
import Spinner from "../../components/Spinner.jsx";
import { LOW_BALANCE_THRESHOLD_M3 } from "../../services/constants.js";
import { getAccount, getLastMeterLoad, getUsageSummary } from "../../services/smartWaterService.js";
import { formatDate, formatM3 } from "../../utils/format.js";
import UsageChart from "./UsageChart.jsx";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Sayfa her açıldığında veri servisten yeniden okunur (satın alma ve yükleme burada görünür)
  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      const results = await Promise.all([getAccount(), getLastMeterLoad(), getUsageSummary()]);
      if (cancelled) return;

      const failed = results.find((result) => !result.ok);
      if (failed) {
        setErrorMessage(failed.error.message);
        return;
      }

      const [account, lastLoad, usage] = results.map((result) => result.data);
      setHomeData({ account, lastLoad, usage });
    }

    loadHomeData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (errorMessage) {
    return (
      <div className="page">
        <Alert type="error">{errorMessage}</Alert>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="page home-loading">
        <Spinner size={32} />
      </div>
    );
  }

  const { account, lastLoad, usage } = homeData;
  const firstName = account.fullName.split(" ")[0];

  return (
    <div className="page home-page">
      <header>
        <h1 className="page-title">Merhaba, {firstName}</h1>
        <p className="text-muted">Abonelik no: {account.subscriberNo}</p>
        <p className="text-muted">Sayaç no: {account.meterNo}</p>
      </header>

      <Card title="Sayaçtaki bakiye">
        <p className="balance-number">{formatM3(account.meterBalanceM3)}</p>
      </Card>

      {account.meterBalanceM3 < LOW_BALANCE_THRESHOLD_M3 && (
        <Alert
          type="warning"
          action={
            <Button variant="secondary" fullWidth onClick={() => navigate("/purchase")}>
              Su Satın Al
            </Button>
          }
        >
          Bakiyeniz azalıyor. Su satın alıp sayacınıza yükleyebilirsiniz.
        </Alert>
      )}

      <Card>
        {account.pendingM3 > 0 ? (
          <div className="home-pending">
            <p>Yükleme bekleyen: {formatM3(account.pendingM3)}</p>
            <Button fullWidth onClick={() => navigate("/load")}>
              NFC ile Sayaca Yükle
            </Button>
          </div>
        ) : (
          <p className="text-muted">Bekleyen yükleme yok.</p>
        )}
      </Card>

      <div className="home-actions">
        <Button fullWidth onClick={() => navigate("/purchase")}>
          Su Satın Al
        </Button>
        <Button
          variant="secondary"
          fullWidth
          disabled={account.pendingM3 === 0}
          onClick={() => navigate("/load")}
        >
          NFC ile Sayaca Yükle
        </Button>
      </div>

      <Card>
        <p>
          {lastLoad
            ? `Son yükleme: ${formatM3(lastLoad.amountM3)} · ${formatDate(lastLoad.createdAt)}`
            : "Henüz yükleme yapılmadı."}
        </p>
      </Card>

      {usage.isAnomaly && (
        <Alert type="warning" title="Olağan dışı tüketim">
          <p>
            Bu ayki tüketiminiz son 5 ayın ortalamasından %{usage.anomalyPercent} fazla. Musluk ve
            tesisatınızı kaçak açısından kontrol etmenizi öneririz.
          </p>
          <p className="text-muted home-alert-note">Bu uyarı kesin kaçak tespiti değildir.</p>
        </Alert>
      )}

      <UsageChart usage={usage} />
    </div>
  );
}
