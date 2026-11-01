import Card from "../../components/Card.jsx";
import { formatM3 } from "../../utils/format.js";
import { analyzeUsage } from "./usageTrend.js";
import "./UsageAnalysisCard.css";

const NEUTRAL_TIPS = [
  "Musluk ve tesisatta damlama olup olmadığını ara sıra kontrol edin.",
  "Çamaşır ve bulaşık makinesini tam dolu çalıştırın.",
  "Diş fırçalarken musluğu kapatın.",
];

const RECOMMENDATIONS = {
  increased: {
    intro: "Bu ay tüketiminiz arttı. Şu adımlar kullanımınızı azaltmanıza yardımcı olabilir:",
    tips: [
      "Diş fırçalarken ve tıraş olurken musluğu kapatın.",
      "Duş sürenizi birkaç dakika kısaltın.",
      "Çamaşır ve bulaşık makinesini tam dolu çalıştırın.",
    ],
  },
  decreased: {
    intro: "Tebrikler, bu ay tüketiminizi azalttınız. Böyle devam edin:",
    tips: [
      "Tasarruf sağlayan alışkanlıklarınızı sürdürün.",
      "Bitkileri sabah veya akşam serinliğinde sulayın.",
      "Musluk ve tesisatta damlama olup olmadığını ara sıra kontrol edin.",
    ],
  },
  unchanged: {
    intro: "Tüketiminiz geçen ayla aynı. Küçük alışkanlıklar da fark yaratır:",
    tips: NEUTRAL_TIPS,
  },
  unknown: {
    intro: "Su tasarrufu için birkaç öneri:",
    tips: NEUTRAL_TIPS,
  },
};

function formatPercent(changePercent) {
  if (changePercent === null) return "";
  return changePercent === 0 ? " (%1'den az)" : ` (%${changePercent})`;
}

function formatTrend({ trend, differenceM3, changePercent }) {
  if (trend === "unknown") return "Karşılaştırma için yeterli veri yok.";
  if (trend === "unchanged") return "Geçen ayla aynı";

  const direction = trend === "increased" ? "arttı" : "azaldı";
  return `Geçen aya göre ${formatM3(Math.abs(differenceM3))}${formatPercent(changePercent)} ${direction}`;
}

function formatStat(m3) {
  return m3 === null ? "Veri yok" : formatM3(m3);
}

export default function UsageAnalysisCard({ usage }) {
  const analysis = analyzeUsage(usage);
  const { intro, tips } = RECOMMENDATIONS[analysis.trend];

  return (
    <Card title="Su Tüketim Analizi">
      <dl className="home-analysis-stats">
        <div className="home-analysis-stat">
          <dt className="text-muted">Bu ay</dt>
          <dd className="home-analysis-stat-value">{formatStat(analysis.currentM3)}</dd>
        </div>
        <div className="home-analysis-stat">
          <dt className="text-muted">Geçen ay</dt>
          <dd className="home-analysis-stat-value">{formatStat(analysis.previousM3)}</dd>
        </div>
      </dl>

      <p className={`home-analysis-trend home-analysis-trend--${analysis.trend}`}>
        {formatTrend(analysis)}
      </p>

      <h3 className="home-analysis-tips-title">Su Tasarrufu Önerileri</h3>
      <p className="text-muted">{intro}</p>
      <ul className="home-analysis-tips">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </Card>
  );
}
