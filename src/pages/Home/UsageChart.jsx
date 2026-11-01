import { useState } from "react";
import Card from "../../components/Card.jsx";
import { formatM3, formatMonthShort } from "../../utils/format.js";
import "./UsageChart.css";

const CHART_HEIGHT_PX = 140;

function formatChange(changePercent) {
  if (changePercent > 0) return `geçen aya göre %${changePercent} fazla`;
  if (changePercent < 0) return `geçen aya göre %${Math.abs(changePercent)} az`;
  return "geçen ayla aynı";
}

// Çubuk üstü değerler birimsiz gösterilir (Bölüm 7.2), bu yüzden formatM3 kullanılmaz
function formatBarValue(m3) {
  return m3.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
}

// formatMonthLong("2026-10") → "Ekim 2026"
function formatMonthLong(yearMonth) {
  const [year, month] = String(yearMonth).split("-").map(Number);
  const date = new Date(year, month - 1);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

// Geçersiz veya negatif değerler grafikte 0 sayılır (NaN/Infinity oluşmaz)
function toSafeM3(value) {
  const m3 = Number(value);
  return Number.isFinite(m3) && m3 > 0 ? m3 : 0;
}

export default function UsageChart({ usage }) {
  const { currentMonthM3, changePercent, isAnomaly } = usage;
  const months = usage.months ?? [];
  const [selectedMonth, setSelectedMonth] = useState(null);

  const maxM3 = Math.max(0, ...months.map((month) => toSafeM3(month.m3)));
  const lastIndex = months.length - 1;
  const lastBarClass = isAnomaly ? "home-chart-bar--anomaly" : "home-chart-bar--current";
  // Henüz seçim yapılmadıysa son ay seçili sayılır
  const selected = months.find((month) => month.month === selectedMonth) ?? months[lastIndex];

  return (
    <Card title="Aylık tüketim">
      <p className="text-muted">
        Bu ay {formatM3(currentMonthM3)} · {formatChange(changePercent)}
      </p>

      {selected ? (
        <>
          <div className="home-chart" role="group" aria-label="Aylık tüketim grafiği">
            {months.map((month, index) => {
              const m3 = toSafeM3(month.m3);
              const isSelected = month === selected;
              const barHeight = maxM3 > 0 ? (m3 / maxM3) * CHART_HEIGHT_PX : 0;

              return (
                <button
                  type="button"
                  className={`home-chart-column ${isSelected ? "home-chart-column--selected" : ""}`.trim()}
                  key={month.month}
                  aria-label={`${formatMonthLong(month.month)}: ${formatM3(m3)}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedMonth(month.month)}
                >
                  <span className="home-chart-value">{formatBarValue(m3)}</span>
                  <span
                    className={`home-chart-bar ${index === lastIndex ? lastBarClass : ""}`.trim()}
                    style={{ height: barHeight }}
                  />
                  <span className="text-muted home-chart-month">{formatMonthShort(month.month)}</span>
                </button>
              );
            })}
          </div>

          <p className="home-chart-selected" aria-live="polite">
            <span>{formatMonthLong(selected.month)}</span>
            <strong>{formatM3(toSafeM3(selected.m3))}</strong>
          </p>
        </>
      ) : (
        <p className="home-chart-empty">Henüz tüketim verisi yok.</p>
      )}

      <p className="text-muted">Örnek veri</p>
    </Card>
  );
}
