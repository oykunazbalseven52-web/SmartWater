import { useState } from "react";
import Card from "../../components/Card.jsx";
import { formatM3, formatMonthShort } from "../../utils/format.js";
import "./UsageChart.css";

const CHART_HEIGHT_PX = 140;

// formatMonthLong("2026-06") → "Haziran 2026"
function formatMonthLong(yearMonth) {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

// Servisle aynı yuvarlama: önce kayan nokta gürültüsü temizlenir (12.1 − 8.8 → %37,5 → 38)
function getChangePercent(currentM3, previousM3) {
  return Math.round(Math.round(((currentM3 - previousM3) / previousM3) * 10000) / 100);
}

function formatChange(currentM3, previousM3) {
  if (!previousM3) return "Karşılaştırma için önceki ay verisi yok.";

  const changePercent = getChangePercent(currentM3, previousM3);
  if (changePercent > 0) return `önceki aya göre %${changePercent} fazla`;
  if (changePercent < 0) return `önceki aya göre %${Math.abs(changePercent)} az`;
  return "önceki ayla aynı";
}

// Çubuk üstü değerler birimsiz gösterilir (Bölüm 7.2), bu yüzden formatM3 kullanılmaz
function formatBarValue(m3) {
  return m3.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
}

export default function UsageChart({ usage }) {
  const { months, isAnomaly } = usage;
  const maxM3 = Math.max(...months.map((month) => month.m3));
  const lastIndex = months.length - 1;
  const lastBarClass = isAnomaly ? "home-chart-bar--anomaly" : "home-chart-bar--current";

  const [selectedIndex, setSelectedIndex] = useState(lastIndex);
  const selectedMonth = months[selectedIndex];

  return (
    <Card title="Aylık tüketim">
      <div className="home-chart">
        {months.map((month, index) => {
          const isSelected = index === selectedIndex;
          const barClasses = [
            "home-chart-bar",
            index === lastIndex ? lastBarClass : "",
            isSelected ? "home-chart-bar--selected" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              type="button"
              className="home-chart-column"
              key={month.month}
              aria-label={`${formatMonthLong(month.month)}: ${formatM3(month.m3)}`}
              aria-pressed={isSelected}
              onClick={() => setSelectedIndex(index)}
            >
              <span className="home-chart-value">{formatBarValue(month.m3)}</span>
              <span
                className={barClasses}
                style={{ height: (month.m3 / maxM3) * CHART_HEIGHT_PX }}
              />
              <span className="text-muted">{formatMonthShort(month.month)}</span>
            </button>
          );
        })}
      </div>

      <p className="home-chart-detail" aria-live="polite">
        {formatMonthLong(selectedMonth.month)}: {formatM3(selectedMonth.m3)} ·{" "}
        {formatChange(selectedMonth.m3, months[selectedIndex - 1]?.m3)}
      </p>

      <p className="text-muted">Örnek veri</p>
    </Card>
  );
}
