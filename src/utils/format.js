// Biçimlendirme yardımcıları (Bölüm 4.5) — yerel ayar tr-TR.
// Not: Fonksiyon adı M3, arayüz çıktısı "ton" (Bölüm 0.2, kural 8).

const LOCALE = "tr-TR";

const numberFormatM3 = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const numberFormatTL = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function pad2(value) {
  return String(value).padStart(2, "0");
}

// formatM3(12.4) → "12,4 ton"
export function formatM3(value) {
  return `${numberFormatM3.format(Number(value) || 0)} ton`;
}

// formatTL(400) → "400,00 TL"
export function formatTL(value) {
  return `${numberFormatTL.format(Number(value) || 0)} TL`;
}

// formatDate(iso) → "30 Eki 2026"
export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

// formatDateTime(iso) → "30 Eki 2026, 14:05"
export function formatDateTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDate(iso)}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// formatMonthShort("2026-10") → "Eki"
export function formatMonthShort(yearMonth) {
  const month = Number(String(yearMonth).split("-")[1]);
  return MONTHS_SHORT[month - 1] ?? "";
}
