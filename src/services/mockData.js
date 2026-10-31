// Başlangıç (demo) verisi — Bölüm 5.3.
// Tüm kişi/adres/sayaç bilgileri UYDURMADIR (repo herkese açık).
// Sayfalar bu dosyayı doğrudan kullanmaz; sadece smartWaterService.js kullanır.
import { PRICE_PER_M3_TL } from "./constants.js";

const METER_NO = "NFC-MTR-0007841";

// Tarihler Kıbrıs yerel saatiyle (UTC+3, yaz saati) yazılır, ISO (UTC) olarak saklanır.
function toIso(localDateTime) {
  return new Date(`${localDateTime}:00+03:00`).toISOString();
}

function purchase(id, amountM3, localDateTime, loadedLocalDateTime) {
  return {
    id,
    type: "purchase",
    amountM3,
    pricePerM3TL: PRICE_PER_M3_TL,
    totalTL: amountM3 * PRICE_PER_M3_TL,
    cardLast4: "4242",
    meterNo: METER_NO,
    status: "loaded",
    createdAt: toIso(localDateTime),
    loadedAt: toIso(loadedLocalDateTime),
  };
}

function meterLoad(id, amountM3, localDateTime) {
  return {
    id,
    type: "meter_load",
    amountM3,
    pricePerM3TL: null,
    totalTL: null,
    cardLast4: null,
    meterNo: METER_NO,
    status: "completed",
    createdAt: toIso(localDateTime),
    loadedAt: null,
  };
}

export const INITIAL_STATE = {
  sessionSubscriberNo: null,
  account: {
    subscriberNo: "SW-100245",
    fullName: "Ayşe Demir",
    address: "Kumsal Mah. Zeytin Sk. No: 12",
    municipality: "Lefkoşa",
    meterNo: METER_NO,
    meterBalanceM3: 2.4,
    pendingM3: 0,
  },
  transactions: [
    purchase("TX-1001", 10, "2026-08-03T10:15", "2026-08-03T18:40"),
    meterLoad("TX-1002", 10, "2026-08-03T18:40"),
    purchase("TX-1003", 10, "2026-09-02T09:30", "2026-09-02T20:05"),
    meterLoad("TX-1004", 10, "2026-09-02T20:05"),
    purchase("TX-1005", 12, "2026-10-01T12:00", "2026-10-01T19:20"),
    meterLoad("TX-1006", 12, "2026-10-01T19:20"),
  ],
  monthlyUsage: [
    { month: "2026-05", m3: 8.6 },
    { month: "2026-06", m3: 8.9 },
    { month: "2026-07", m3: 9.4 },
    { month: "2026-08", m3: 8.7 },
    { month: "2026-09", m3: 8.8 },
    { month: "2026-10", m3: 12.1 },
  ],
};
