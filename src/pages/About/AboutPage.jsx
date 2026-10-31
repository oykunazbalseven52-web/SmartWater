import Card from "../../components/Card.jsx";
import "./AboutPage.css";

const STEPS = [
  {
    title: "Satın al",
    text: "Abonelik numaranızla giriş yapın ve istediğiniz miktarda su satın alın.",
  },
  {
    title: "Hesabınıza tanımlansın",
    text: 'Satın aldığınız su, aboneliğinize kayıtlı sayacınız için "yükleme bekleyen bakiye" olarak saklanır.',
  },
  {
    title: "Sayacınıza yükleyin",
    text: "Telefonunuzu sayacınıza yaklaştırın; bakiye NFC ile aktarılır. Aynı yükleme hakkı ikinci kez kullanılamaz ve başka bir sayaca yüklenemez.",
  },
];

const GOALS = [
  {
    number: 6,
    title: "Temiz Su ve Sanitasyon",
    level: "Çok güçlü potansiyel",
    text: "Tüketim takibi ve olağan dışı tüketim uyarıları, kullanıcıların su kullanımını anlamasına ve olası kayıpları daha erken fark etmesine yardımcı olabilir.",
  },
  {
    number: 12,
    title: "Sorumlu Üretim ve Tüketim",
    level: "Çok güçlü potansiyel",
    text: "Tüketim verilerinin görünür olması bilinçli kullanımı destekler; dijital makbuzlar kâğıt fiş ihtiyacını azaltabilir.",
  },
  {
    number: 9,
    title: "Sanayi, Yenilikçilik ve Altyapı",
    level: "Güçlü",
    text: "NFC destekli sayaçlar ve dijital yükleme süreci, mevcut ön ödemeli su altyapısının modernleştirilmesine katkıda bulunur.",
  },
  {
    number: 11,
    title: "Sürdürülebilir Şehirler ve Topluluklar",
    level: "Destekleyici",
    text: "Dijital su hizmetleri, vatandaşların hizmetlere zaman ve yol masrafı harcamadan erişmesini kolaylaştırır.",
  },
  {
    number: 13,
    title: "İklim Eylemi",
    level: "Dolaylı",
    text: "Verimli su kullanımı, kuraklık risklerine karşı dayanıklılığı destekleyebilir.",
  },
];

export default function AboutPage() {
  return (
    <div className="page about-page">
      <Card title="SmartWater nedir?">
        <p className="about-text">
          SmartWater, Kıbrıs'ta kullanılan ön ödemeli su kartı sistemini modernleştirmeyi amaçlayan bir
          prototiptir. Vatandaşlar su yükleme noktasına gitmeden telefonlarından su satın alabilir ve satın
          aldıkları suyu NFC destekli yeni nesil sayaçlarına aktarabilir. Fiziksel su kartına gerek kalmaz.
        </p>
      </Card>

      <section className="about-section" aria-labelledby="about-steps-title">
        <h2 id="about-steps-title" className="about-section-title">
          Nasıl çalışır?
        </h2>
        <ol className="about-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="about-step">
              <span className="about-step-number" aria-hidden="true">
                {index + 1}
              </span>
              <div className="about-step-body">
                <h3 className="about-step-title">{step.title}</h3>
                <p className="about-text">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-section" aria-labelledby="about-goals-title">
        <h2 id="about-goals-title" className="about-section-title">
          Sürdürülebilirlik ve Sürdürülebilir Kalkınma Amaçları (SKA)
        </h2>
        <ul className="about-goals">
          {GOALS.map((goal) => (
            <li key={goal.number} className="about-goal">
              <div className="about-goal-header">
                <span className="about-goal-badge">SKA {goal.number}</span>
                <h3 className="about-goal-title">{goal.title}</h3>
              </div>
              <p className="about-goal-level">{goal.level}</p>
              <p className="about-text">{goal.text}</p>
            </li>
          ))}
        </ul>
        <p className="about-note">
          Dijital yükleme tek başına su tasarrufu sağlamaz. Asıl katkı, tüketimin görünür hâle gelmesi ve olası
          kayıpların erken fark edilmesiyle ortaya çıkar.
        </p>
      </section>

      <Card title="Donanım ve elektronik atık">
        <p className="about-text">
          Sayaçların değiştirilmesi bir maliyet ve elektronik atık kaynağıdır. Bu nedenle geçişin kademeli
          yapılması (önce yeni abonelikler ve ömrünü tamamlamış sayaçlar), uzun ömürlü ve onarılabilir
          sayaçların tercih edilmesi ve eski sayaçların uygun elektronik atık süreçleriyle geri
          dönüştürülmesi öngörülür.
        </p>
      </Card>

      <Card title="Prototip notu">
        <p className="about-text">
          Bu sürüm Sürdürülebilir Kıbrıs Hackathonu 2026 için geliştirilmiş bir prototiptir. Ödeme ve NFC
          aktarımı simüle edilmektedir; veriler örnektir. Gösterilen 40 TL/ton fiyatı örnek tarifedir; gerçek
          tarifeler belediyeye göre değişir. Uygulamada miktarlar ton cinsinden gösterilir (1 ton su ≈ 1 m³).
        </p>
      </Card>

      <p className="about-team">
        <strong>Ekip:</strong> Eylül · Öykü · Sinem · Göksu · Zeynep
      </p>
    </div>
  );
}
