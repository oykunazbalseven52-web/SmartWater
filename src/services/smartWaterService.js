// SmartWater veri servisi — Bölüm 5.4.
// Sayfalar veriye SADECE bu dosyadaki fonksiyonlarla erişir.
// Tüm fonksiyonlar (isLoggedIn hariç) async'tir; ileride backend'e geçişte
// sadece bu fonksiyonların içi değişir, ekranlar değişmez.
//
// Dönüş biçimi:
//   { ok: true, data: ... }
//   { ok: false, error: { code, message } }

import {
  STORAGE_KEY,
  PRICE_PER_M3_TL,
  MIN_PURCHASE_M3,
  MAX_PURCHASE_M3,
  ANOMALY_RATIO,
  SERVICE_DELAY_MS,
  PAYMENT_DELAY_MS,
  DECLINED_TEST_CARD,
} from "./constants.js";
import { INITIAL_STATE } from "./mockData.js";

// ---------- Hata mesajları ----------

const ERROR_MESSAGES = {
  SUBSCRIBER_NOT_FOUND:
    "Bu abonelik numarasıyla kayıtlı bir hesap bulunamadı. Numarayı kontrol edip tekrar deneyin.",
  NOT_LOGGED_IN: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
  INVALID_AMOUNT: "Lütfen 1 ile 100 ton arasında tam sayı bir miktar girin.",
  INVALID_CARD:
    "Kart bilgileri geçersiz. Lütfen kart numarası, son kullanma tarihi ve CVV'yi kontrol edin.",
  PAYMENT_DECLINED: "Ödeme bankanız tarafından onaylanmadı. Farklı bir kartla tekrar deneyin.",
  NO_PENDING_BALANCE: "Yüklenecek bekleyen bakiyeniz yok. Önce su satın alın.",
  METER_MISMATCH: "Okutulan sayaç bu aboneliğe kayıtlı değil. Yükleme yapılmadı, bakiyeniz güvende.",
  TRANSACTION_NOT_FOUND: "İşlem bulunamadı.",
};

// ---------- Yardımcılar ----------

function ok(data) {
  return { ok: true, data };
}

function fail(code) {
  return { ok: false, error: { code, message: ERROR_MESSAGES[code] } };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Kayan nokta gürültüsünü temizler (örn. 2.4 + 10 → 12.4)
function round2(value) {
  return Math.round(value * 100) / 100;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.account && Array.isArray(parsed.transactions)) {
        return parsed;
      }
    }
  } catch {
    // Bozuk veri → başlangıç verisine dön
  }
  const initial = clone(INITIAL_STATE);
  saveState(initial);
  return initial;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isSessionValid(state) {
  return state.sessionSubscriberNo !== null && state.sessionSubscriberNo === state.account.subscriberNo;
}

// "TX-" + Date.now(); aynı milisaniyede çakışmayı önler
function createTransactionId(state) {
  let stamp = Date.now();
  while (state.transactions.some((tx) => tx.id === `TX-${stamp}`)) {
    stamp += 1;
  }
  return `TX-${stamp}`;
}

function sortNewestFirst(transactions) {
  return [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function isValidCard(card) {
  if (!card || typeof card !== "object") return false;

  const number = String(card.number ?? "").replace(/\s/g, "");
  if (!/^\d{16}$/.test(number)) return false;

  const expiry = String(card.expiry ?? "").trim();
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false;

  const cvv = String(card.cvv ?? "").trim();
  if (!/^\d{3}$/.test(cvv)) return false;

  return true;
}

// ---------- Servis fonksiyonları ----------

// Senkron: sarmalanmamış true/false döner
export function isLoggedIn() {
  return isSessionValid(loadState());
}

export async function login(subscriberNo) {
  await delay(SERVICE_DELAY_MS);
  const state = loadState();
  const normalized = String(subscriberNo ?? "").trim().toUpperCase();
  if (normalized !== state.account.subscriberNo) {
    return fail("SUBSCRIBER_NOT_FOUND");
  }
  state.sessionSubscriberNo = normalized;
  saveState(state);
  return ok(clone(state.account));
}

export async function logout() {
  await delay(SERVICE_DELAY_MS);
  const state = loadState();
  state.sessionSubscriberNo = null;
  saveState(state);
  return ok(null);
}

export async function getAccount() {
  await delay(SERVICE_DELAY_MS);
  const state = loadState();
  if (!isSessionValid(state)) return fail("NOT_LOGGED_IN");
  return ok(clone(state.account));
}

export async function purchaseWater({ amountM3, card } = {}) {
  await delay(SERVICE_DELAY_MS);
  if (!isSessionValid(loadState())) return fail("NOT_LOGGED_IN");

  if (!Number.isInteger(amountM3) || amountM3 < MIN_PURCHASE_M3 || amountM3 > MAX_PURCHASE_M3) {
    return fail("INVALID_AMOUNT");
  }
  if (!isValidCard(card)) return fail("INVALID_CARD");

  await delay(PAYMENT_DELAY_MS);

  const cardNumber = String(card.number).replace(/\s/g, "");
  if (cardNumber === DECLINED_TEST_CARD.replace(/\s/g, "")) {
    return fail("PAYMENT_DECLINED");
  }

  // Gecikmeden sonra güncel durumu yeniden oku
  const state = loadState();
  if (!isSessionValid(state)) return fail("NOT_LOGGED_IN");

  const transaction = {
    id: createTransactionId(state),
    type: "purchase",
    amountM3,
    pricePerM3TL: PRICE_PER_M3_TL,
    totalTL: amountM3 * PRICE_PER_M3_TL,
    cardLast4: cardNumber.slice(-4), // sadece son 4 hane saklanır
    meterNo: state.account.meterNo,
    status: "pending_load",
    createdAt: new Date().toISOString(),
    loadedAt: null,
  };

  state.transactions.push(transaction);
  state.account.pendingM3 = round2(state.account.pendingM3 + amountM3);
  saveState(state);

  return ok({ transaction: clone(transaction), account: clone(state.account) });
}

// Çift yüklemeyi engelleyen kural: tek adımda, bölünmeden çalışır.
export async function loadToMeter({ meterNo } = {}) {
  await delay(SERVICE_DELAY_MS);
  const state = loadState();
  if (!isSessionValid(state)) return fail("NOT_LOGGED_IN");

  const { account } = state;

  // 1. Bekleyen bakiye yoksa
  if (account.pendingM3 === 0) return fail("NO_PENDING_BALANCE");

  const now = new Date().toISOString();

  // 2. Yanlış sayaç: bakiye değişmez, failed kaydı eklenir
  if (meterNo !== account.meterNo) {
    state.transactions.push({
      id: createTransactionId(state),
      type: "meter_load",
      amountM3: account.pendingM3,
      pricePerM3TL: null,
      totalTL: null,
      cardLast4: null,
      meterNo: String(meterNo ?? ""),
      status: "failed",
      createdAt: now,
      loadedAt: null,
    });
    saveState(state);
    return fail("METER_MISMATCH");
  }

  // 3. Başarılı yükleme
  const loadedM3 = account.pendingM3;
  account.meterBalanceM3 = round2(account.meterBalanceM3 + loadedM3);
  account.pendingM3 = 0;

  state.transactions.forEach((tx) => {
    if (tx.type === "purchase" && tx.status === "pending_load") {
      tx.status = "loaded";
      tx.loadedAt = now;
    }
  });

  const transaction = {
    id: createTransactionId(state),
    type: "meter_load",
    amountM3: loadedM3,
    pricePerM3TL: null,
    totalTL: null,
    cardLast4: null,
    meterNo: account.meterNo,
    status: "completed",
    createdAt: now,
    loadedAt: null,
  };
  state.transactions.push(transaction);
  saveState(state);

  return ok({
    loadedM3,
    newMeterBalanceM3: account.meterBalanceM3,
    transaction: clone(transaction),
  });
}

export async function getTransactions() {
  await delay(SERVICE_DELAY_MS);
  const state = loadState();
  if (!isSessionValid(state)) return fail("NOT_LOGGED_IN");
  return ok(clone(sortNewestFirst(state.transactions)));
}

export async function getTransactionById(id) {
  await delay(SERVICE_DELAY_MS);
  const state = loadState();
  const transaction = state.transactions.find((tx) => tx.id === id);
  if (!transaction) return fail("TRANSACTION_NOT_FOUND");
  return ok(clone(transaction));
}

export async function getLastMeterLoad() {
  await delay(SERVICE_DELAY_MS);
  const state = loadState();
  if (!isSessionValid(state)) return fail("NOT_LOGGED_IN");
  const last = sortNewestFirst(state.transactions).find(
    (tx) => tx.type === "meter_load" && tx.status === "completed",
  );
  return ok(last ? clone(last) : null);
}

export async function getUsageSummary() {
  await delay(SERVICE_DELAY_MS);
  const state = loadState();
  if (!isSessionValid(state)) return fail("NOT_LOGGED_IN");

  const months = clone(state.monthlyUsage); // eskiden yeniye
  const count = months.length;
  const currentMonthM3 = count > 0 ? months[count - 1].m3 : 0;
  const previousMonthM3 = count > 1 ? months[count - 2].m3 : 0;

  const previousMonths = months.slice(0, -1).slice(-5); // son ay hariç önceki 5 ay
  const averagePreviousM3 =
    previousMonths.length > 0
      ? round2(previousMonths.reduce((sum, m) => sum + m.m3, 0) / previousMonths.length)
      : 0;

  // round2 önce kayan nokta gürültüsünü temizler (12.1 − 8.8 = 3.2999… → %37,5 → 38)
  const changePercent =
    previousMonthM3 > 0
      ? Math.round(round2(((currentMonthM3 - previousMonthM3) / previousMonthM3) * 100))
      : 0;
  const anomalyPercent =
    averagePreviousM3 > 0
      ? Math.round(round2(((currentMonthM3 - averagePreviousM3) / averagePreviousM3) * 100))
      : 0;
  const isAnomaly = averagePreviousM3 > 0 && currentMonthM3 > averagePreviousM3 * ANOMALY_RATIO;

  return ok({
    months,
    currentMonthM3,
    previousMonthM3,
    changePercent,
    averagePreviousM3,
    anomalyPercent,
    isAnomaly,
  });
}

// Başlangıç verisine döner, oturum kapanır
export async function resetDemoData() {
  await delay(SERVICE_DELAY_MS);
  saveState(clone(INITIAL_STATE));
  return ok(null);
}
