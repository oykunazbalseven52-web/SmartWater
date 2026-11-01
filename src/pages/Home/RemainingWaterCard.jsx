import Card from "../../components/Card.jsx";
import { formatM3 } from "../../utils/format.js";
import "./RemainingWaterCard.css";

const STATUS_MESSAGES = {
  invalidBalance: "Bakiye bilgisine ulaşılamadığı için süre hesaplanamadı.",
  emptyBalance: "Sayacınızda su kalmadı. Su satın alıp sayacınıza yükleyebilirsiniz.",
  noHistory: "Henüz yeterli tüketim geçmişi olmadığı için süre hesaplanamadı.",
  noConsumption: "Son aylarda tüketim görünmediği için süre hesaplanamadı.",
};

// 0 geçerli bir değerdir; eksik veya geçersiz değerler null olur
function parseM3(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

// getDaysInMonth("2026-02") → 28; geçersiz ay → null
function getDaysInMonth(yearMonth) {
  const [year, month] = String(yearMonth).split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  return new Date(year, month, 0).getDate();
}

// Günlük ortalama = geçerli ayların toplam tüketimi / bu ayların toplam gün sayısı.
// Ayların gerçek gün sayısı kullanılır; geçersiz kayıtlar (eksik, negatif, hatalı ay) hesaba katılmaz.
// Tüm ay kayıtları tamamlanmış ay sayılır (demo verisi sabit olduğu için bugünün tarihi kullanılmaz).
function getAverageDailyM3(months) {
  let totalM3 = 0;
  let totalDays = 0;

  for (const month of months) {
    const m3 = parseM3(month.m3);
    const days = getDaysInMonth(month.month);
    if (m3 === null || days === null) continue;
    totalM3 += m3;
    totalDays += days;
  }

  return totalDays > 0 ? totalM3 / totalDays : null;
}

function getEstimate(account, usage) {
  const balanceM3 = parseM3(account.meterBalanceM3);
  const dailyM3 = getAverageDailyM3(usage.months ?? []);

  let status = "ok";
  if (balanceM3 === null) status = "invalidBalance";
  else if (balanceM3 === 0) status = "emptyBalance";
  else if (dailyM3 === null) status = "noHistory";
  else if (dailyM3 === 0) status = "noConsumption";

  return { balanceM3, dailyM3, status, days: status === "ok" ? balanceM3 / dailyM3 : null };
}

// Süre fazla gösterilmesin diye tam güne aşağı yuvarlanır
function formatDays(days) {
  if (days < 1) return "1 günden az";
  return `Yaklaşık ${Math.floor(days).toLocaleString("tr-TR")} gün`;
}

// Küçük ortalamalar 0'a yuvarlanmasın diye 2 anlamlı basamak gösterilir: 0,31 ton/gün
function formatDailyM3(dailyM3) {
  if (dailyM3 === null) return "Veri yok";
  return `${dailyM3.toLocaleString("tr-TR", { maximumSignificantDigits: 2 })} ton/gün`;
}

export default function RemainingWaterCard({ account, usage }) {
  const { balanceM3, dailyM3, status, days } = getEstimate(account, usage);
  const pendingM3 = parseM3(account.pendingM3);

  return (
    <Card title="Tahmini Kalan Su Süresi">
      {status === "ok" ? (
        <p className="home-remaining-days">{formatDays(days)}</p>
      ) : (
        <p className={`home-remaining-message home-remaining-message--${status}`}>
          {STATUS_MESSAGES[status]}
        </p>
      )}

      <dl className="home-remaining-stats">
        <div className="home-remaining-stat">
          <dt className="text-muted">Sayaçtaki bakiye</dt>
          <dd className="home-remaining-stat-value">
            {balanceM3 === null ? "Veri yok" : formatM3(balanceM3)}
          </dd>
        </div>
        <div className="home-remaining-stat">
          <dt className="text-muted">Tahmini günlük ortalama</dt>
          <dd className="home-remaining-stat-value">{formatDailyM3(dailyM3)}</dd>
        </div>
      </dl>

      {pendingM3 > 0 && (
        <p className="text-muted home-remaining-note">
          Yükleme bekleyen {formatM3(pendingM3)} bu tahmine dahil değildir.
        </p>
      )}

      <p className="text-muted home-remaining-note">
        Bu süre, geçmiş tüketim ortalamanıza dayalı bir tahmindir; kesin değildir ve garanti
        edilmez.
      </p>
      <p className="text-muted home-remaining-note">Örnek veri</p>
    </Card>
  );
}
