import Card from "../../components/Card.jsx";
import { formatM3 } from "../../utils/format.js";
import "./DailyAverageCard.css";

const AVERAGE_MONTH_COUNT = 5;

// getDaysInMonth("2026-06") → 30
function getDaysInMonth(yearMonth) {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

// Son ay hariç önceki 5 ayın toplam tüketimi ÷ toplam gün sayısı; veri yoksa 0 döner
function getDailyAverageM3(months) {
  const completedMonths = months.slice(0, -1).slice(-AVERAGE_MONTH_COUNT);
  const totalM3 = completedMonths.reduce((sum, month) => sum + month.m3, 0);
  const totalDays = completedMonths.reduce((sum, month) => sum + getDaysInMonth(month.month), 0);
  return totalDays > 0 ? totalM3 / totalDays : 0;
}

function formatDailyAverage(dailyAverageM3) {
  const value = dailyAverageM3.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `yaklaşık ${value} ton/gün`;
}

export default function DailyAverageCard({ usage, meterBalanceM3 }) {
  const dailyAverageM3 = getDailyAverageM3(usage.months);

  if (dailyAverageM3 <= 0) {
    return (
      <Card title="Günlük ortalama">
        <p className="text-muted">Tahmin için yeterli veri yok.</p>
      </Card>
    );
  }

  // Faturalı abonede bakiye yoktur, kalan süre satırları gösterilmez
  const hasBalance = meterBalanceM3 !== undefined;

  return (
    <Card title="Günlük ortalama">
      <dl className="daily-rows">
        <div className="daily-row">
          <dt className="text-muted">Günlük ortalama tüketim</dt>
          <dd className="daily-value">{formatDailyAverage(dailyAverageM3)}</dd>
        </div>

        {hasBalance && (
          <>
            <div className="daily-row">
              <dt className="text-muted">Mevcut bakiye</dt>
              <dd className="daily-value">{formatM3(meterBalanceM3)}</dd>
            </div>
            <div className="daily-row">
              <dt className="text-muted">Tahmini kullanım süresi</dt>
              <dd className="daily-value">
                yaklaşık {Math.floor(meterBalanceM3 / dailyAverageM3)} gün
              </dd>
            </div>
          </>
        )}
      </dl>

      {hasBalance && (
        <p className="text-muted daily-note">
          Bu süre geçmiş tüketim verilerine göre hesaplanan tahmindir; gerçek kullanım süresi
          değişebilir.
        </p>
      )}
      <p className="text-muted daily-note">
        Tahmindir; aylık örnek verinin günlük ortalamasına dayanır, günlük ölçüm değildir.
      </p>
    </Card>
  );
}
