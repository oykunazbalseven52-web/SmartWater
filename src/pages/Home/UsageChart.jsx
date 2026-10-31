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

export default function UsageChart({ usage }) {
  const { months, currentMonthM3, changePercent, isAnomaly } = usage;
  const maxM3 = Math.max(...months.map((month) => month.m3));
  const lastIndex = months.length - 1;
  const lastBarClass = isAnomaly ? "home-chart-bar--anomaly" : "home-chart-bar--current";

  return (
    <Card title="Aylık tüketim">
      <p className="text-muted">
        Bu ay {formatM3(currentMonthM3)} · {formatChange(changePercent)}
      </p>

      <div className="home-chart">
        {months.map((month, index) => (
          <div className="home-chart-column" key={month.month}>
            <span className="home-chart-value">{formatBarValue(month.m3)}</span>
            <div
              className={`home-chart-bar ${index === lastIndex ? lastBarClass : ""}`.trim()}
              style={{ height: (month.m3 / maxM3) * CHART_HEIGHT_PX }}
            />
            <span className="text-muted">{formatMonthShort(month.month)}</span>
          </div>
        ))}
      </div>

      <p className="text-muted">Örnek veri</p>
    </Card>
  );
}
