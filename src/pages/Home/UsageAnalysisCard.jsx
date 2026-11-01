import Card from "../../components/Card.jsx";
import { formatM3 } from "../../utils/format.js";
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

// 0 geçerli bir tüketimdir; eksik veya geçersiz değerler null olur
function parseM3(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

// Son iki ay karşılaştırılır; months eskiden yeniye sıralıdır (Bölüm 5)
function analyzeUsage(usage) {
  const months = usage.months ?? [];
  const currentM3 = parseM3(months.at(-1)?.m3);
  const previousM3 = parseM3(months.at(-2)?.m3);

  if (currentM3 === null || previousM3 === null) {
    return { currentM3, previousM3, trend: "unknown" };
  }

  // Ekranda gösterilen hassasiyete (1 ondalık) yuvarlanır, kayan nokta gürültüsü temizlenir
  const differenceM3 = Math.round((currentM3 - previousM3) * 10) / 10;
  let trend = "unchanged";
  if (differenceM3 > 0) trend = "increased";
  if (differenceM3 < 0) trend = "decreased";

  // Yüzde servisten gelir (grafikle aynı değer); geçen ay 0 ise yüzde hesaplanamaz
  const changePercent =
    previousM3 > 0 && Number.isFinite(usage.changePercent) ? Math.abs(usage.changePercent) : null;

  return { currentM3, previousM3, trend, differenceM3, changePercent };
}

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
