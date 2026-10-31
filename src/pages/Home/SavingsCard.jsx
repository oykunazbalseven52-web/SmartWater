import Card from "../../components/Card.jsx";
import { formatM3 } from "../../utils/format.js";
import "./SavingsCard.css";

const SAVING_TIPS = [
  "Musluk ve rezervuarlarda sızıntı olup olmadığını kontrol edebilirsiniz.",
  "Duş ve sulama sürelerini kısaltmayı deneyebilirsiniz.",
  "Tüketiminizi ay içinde düzenli takip etmeyi sürdürebilirsiniz.",
];

// Önceki ay verisi yoksa null döner (servis bu durumda previousMonthM3 = 0 verir)
function getComparisonMessage({ currentMonthM3, previousMonthM3, changePercent }) {
  if (!previousMonthM3) return null;
  if (currentMonthM3 === previousMonthM3) return "Geçen ayla aynı miktarda su kullandınız.";

  const difference = formatM3(Math.abs(currentMonthM3 - previousMonthM3));
  const direction = currentMonthM3 > previousMonthM3 ? "fazla" : "az";
  return `Geçen aya göre ${difference} (%${Math.abs(changePercent)}) daha ${direction} su kullandınız.`;
}

export default function SavingsCard({ usage }) {
  const message = getComparisonMessage(usage);
  if (!message) return null;

  return (
    <Card title="Su tasarrufu analizi">
      <p className="savings-message">{message}</p>

      <ul className="savings-tips">
        {SAVING_TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>

      <p className="text-muted">
        Bu karşılaştırma örnek verilere dayanır; gerçek tasarrufun kanıtı değildir.
      </p>
    </Card>
  );
}
