// Aylık tüketim eğilimi tek yerde hesaplanır; UsageChart ve UsageAnalysisCard ikisi de buradan okur.

// 0 geçerli bir tüketimdir; eksik veya geçersiz değerler null olur
function parseM3(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

// Son iki ay karşılaştırılır; months eskiden yeniye sıralıdır (Bölüm 5)
export function analyzeUsage(usage) {
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

  // Yüzde servisten gelir; geçen ay 0 ise yüzde hesaplanamaz
  const changePercent =
    previousM3 > 0 && Number.isFinite(usage.changePercent) ? Math.abs(usage.changePercent) : null;

  return { currentM3, previousM3, trend, differenceM3, changePercent };
}
