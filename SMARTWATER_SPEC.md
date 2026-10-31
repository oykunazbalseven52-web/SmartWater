# SmartWater — Proje Spesifikasyonu (Hackathon Prototipi)

> Sürdürülebilir Kıbrıs Hackathonu 2026 · 5 kişilik ekip · ~15 saat aktif çalışma
> Bu dosya, ekipteki herkesin ve her AI coding agent'ın **tek doğru kaynağıdır**. Burada yazmayan bir özellik eklenmez.
> Dosyanın güncel hâli her zaman **repo kökündeki** `SMARTWATER_SPEC.md`'dir. Değişiklikler sadece buraya yapılır.

---

## 0. Agent'lar İçin Talimatlar (önce burayı oku)

### 0.1. Bu dosya nasıl kullanılır?
Ekip üyesi agent'ına bu dosyayı verir ve örneğin **"Ekran 3'ü (Satın Alma) birlikte yapalım"** der. Agent:
1. Dosyanın **tamamını** okur (özellikle Bölüm 3, 4, 5, 6 ve kendi ekranının bölümü).
2. Sadece o ekranın **sahibi olduğu dosyalarda** çalışır (Bölüm 3.2).
3. Önce **[Zorunlu]** maddeleri bitirir, **[Zaman kalırsa]** maddelerine ancak sonra geçer.
4. Ekip üyeleri kod yazmayacak. Agent dosyaları kendisi oluşturur/düzenler, çalıştırılması gereken (git dışı) komutları **tek tek ve açıklamalı** söyler, bitince ekranın "Kabul kriterleri"ni ekip üyesiyle birlikte kontrol eder.
5. İş bitince agent **commit atmaz**; sadece önerilen commit mesajını yazar (örn. *"Şimdi GitHub Desktop'tan commit atabilirsin, önerilen mesaj: `feat(home): add balance card`"*).

### 0.2. Kurallar
1. **Agent hiçbir git işlemi yapmaz.** `git add`, `commit`, `push`, `pull`, `fetch`, `merge`, `rebase`, `checkout`, `switch`, `branch`, `reset`, `stash`, `restore` ve GitHub CLI (`gh`) dahil hiçbir git/GitHub komutu çalıştırmaz; `.git` klasörüne ve `.gitignore`'a dokunmaz. Branch açma, commit, push, pull, PR ve merge işlerini **sadece ekip üyesi GitHub Desktop'tan** yapar.
   > Ekip üyelerine not: Agent bir git komutu için izin isterse **her zaman reddedin.**
2. **Ortak dosyalara dokunma.** `src/components/`, `src/services/`, `src/utils/`, `src/styles/`, `src/App.jsx`, `src/main.jsx`, `index.html`, `package.json`, `vite.config.js` sadece **Zeynep (Kişi 5)**'e aittir. Ortak bir dosyada değişiklik gerekiyorsa değiştirme; ekip üyesine söyle, Pull Request açıklamasına yazılsın.
3. **Veriye sadece servis üzerinden eriş.** Sayfalar `localStorage`'a veya `mockData.js`'e **doğrudan erişmez**; yalnızca `src/services/smartWaterService.js` içindeki fonksiyonları kullanır (Bölüm 5).
4. **Yeni npm paketi kurma.** Sadece Bölüm 2'deki paketler kullanılır. UI kütüphanesi, grafik kütüphanesi, ikon kütüphanesi yok.
5. **Renkleri elle yazma.** Sadece `src/styles/theme.css` içindeki CSS değişkenleri kullanılır (Bölüm 4).
6. **CSS sınıf adlarına ekran önekini koy.** Düz CSS global olduğu için çakışmayı önlemek amacıyla her ekran kendi önekini kullanır: `login-`, `home-`, `purchase-`, `nfc-`, `history-`, `about-` (örn. `.home-balance-card`).
7. **Dil kuralı:** Arayüzde görünen tüm metinler **Türkçe**. Kod tarafı (değişken, fonksiyon, dosya/klasör adları, CSS sınıfları, commit mesajları) **İngilizce**.
8. **Birim kuralı:** Arayüzde su miktarı her yerde **"ton"** yazılır (örn. `12,4 ton`, `40 TL / ton`). Kodda ise isimler **`M3` olarak kalır** (`amountM3`, `pendingM3`, `meterBalanceM3`, `formatM3`…). Bu bilinçli bir karardır (1 ton su ≈ 1 m³); kod isimlerini "Ton" olarak değiştirme, arayüzde "m³" yazma.
9. **Mobile-first.** Her ekran 360px ve 430px genişlikte düzgün görünmeli. Dokunulabilir öğeler en az 44px yüksekliğinde.
10. **Simülasyon açıkça belirtilir.** Ödeme ve NFC aktarımı gerçek değildir; ekranlarda bu açıkça yazılır (Bölüm 1.2).
11. **Repo herkese açık.** Koda gerçek kişisel bilgi (gerçek isim/adres/telefon/kart), şifre, API anahtarı veya `.env` dosyası **yazılmaz**. Mock verideki tüm bilgiler uydurmadır.
12. **Bu dosyada olmayan özellik ekleme.** Fikir varsa ekip üyesine öner, kendiliğinden ekleme.
13. **Tarayıcı diyalogları kullanma.** `alert()`, `confirm()`, `prompt()` yok; mesajlar sayfa içinde gösterilir.
14. **PR öncesi öz kontrol.** Ekran bitince, Pull Request açılmadan önce o ekranın **Kabul kriterleri** ekip üyesiyle birlikte tek tek kontrol edilir.

---

## 1. Proje Özeti ve Kapsam

### 1.1. Fikir
Kıbrıs'ta kullanılan ön ödemeli su kartı sisteminde vatandaşlar bakiye yüklemek için fiziksel yükleme noktalarına gitmek zorunda. SmartWater'da mevcut sayaçlar **NFC destekli yeni sayaçlarla** değiştirilir ve fiziksel kart tamamen kalkar:

1. Kullanıcı Android telefonunun tarayıcısından SmartWater web sitesine **abonelik numarasıyla** girer.
2. Abonelik numarası, sistemde o aboneliğe kayıtlı **sayacı** (sayaç no / NFC kimliği) belirler.
3. Kullanıcı su satın alır (ton). Ödenen miktar hesabına **"yükleme bekleyen bakiye"** olarak tanımlanır.
4. Kullanıcı istediği zaman telefonunu **kendi sayacına** okutur; bekleyen bakiye sayaca aktarılır.
5. Aynı yükleme hakkı **ikinci kez kullanılamaz.**

Hedef: Kullanıcının su almak ve yüklemek için hiçbir fiziksel noktaya gitmemesi.

### 1.2. Gerçek mi, simülasyon mu?

| Parça | Bu prototipte | Not |
|---|---|---|
| Web sitesi, ekranlar, akış | **Gerçek** (çalışan React uygulaması) | Telefonda ve laptopta açılır |
| Abonelik / hesap verisi | **Sanal veri** (mock data) | Tek demo abone; veritabanı yok |
| Veri saklama | Tarayıcının `localStorage`'ı | Sayfa yenilense de veri korunur |
| Ödeme | **Simülasyon** | Gerçek para çekilmez, kart bilgisi saklanmaz |
| NFC ile sayaca aktarım | **Tamamen simülasyon** | Telefonun NFC'si kullanılmaz; ekranda "Simülasyon modu" etiketi |
| Tarife | **Örnek tarife:** 40 TL/ton (sabit) | Gerçek tarifeler belediyeye göre değişir ve kademelidir |
| Tüketim grafiği ve uyarı | **Örnek veri** | Gerçek sayaç verisi yok |
| Giriş doğrulaması | Yok, sadece abonelik numarası | Bilinçli karar (Bölüm 7.1) |

Birim: arayüzde **ton**, kodda `M3` isimleri (Bölüm 0.2, kural 8).

### 1.3. Kapsam dışı (eklenmeyecek)
Backend / sunucu, veritabanı (MySQL vb.), şifre / SMS doğrulama / şifremi unuttum, çoklu abonelik, başka aboneliğe su hediye etme, gerçek banka entegrasyonu, gerçek Web NFC, kademeli tarife, tasarruf hedefi ekranı, mobil uygulama.

---

## 2. Teknoloji

| Ne | Seçim | Neden |
|---|---|---|
| Arayüz | **React** (JavaScript, TypeScript **yok**) | Ekibin tercihi |
| Proje aracı | **Vite** (`--template react`) | Hocanın verdiği kurulum komutu |
| Çalışma ortamı | **Node.js** (LTS, en az 20.19) + npm | React projesini çalıştırmak/paket kurmak için |
| Sayfa geçişleri | **React Router** (`react-router-dom`), **`HashRouter`** | Ek sunucu ayarı gerektirmez |
| Stil | Her ekranın kendi `.css` dosyası; **ekstra stil kütüphanesi kurulmaz** (Tailwind/Bootstrap yok) | Basit, çakışmasız |
| Grafik | **CSS ile çubuk grafik** (kütüphane yok) | Kurulum gerektirmez |
| Veri | `localStorage` + sanal başlangıç verisi | Backend yok (hocanın önerisi) |
| İkonlar | Basit inline SVG (kütüphane yok) | Paket eklememek için |
| Versiyon kontrol | Git + GitHub + **GitHub Desktop** (sadece ekip üyeleri kullanır, agent'lar değil) | Herkeste kurulu |
| Demo | `npm run dev -- --host` (yerel ağ) | Bölüm 9 |

---

## 3. Klasör Yapısı ve Dosya Sahipliği

### 3.1. Klasör yapısı
```
/ (repo kökü)
├─ SMARTWATER_SPEC.md          ← bu dosya (Zeynep)
├─ README.md                   (Eylül)  — Bölüm 7.7
├─ index.html                  (Zeynep)
├─ package.json                (Zeynep)
└─ src/
   ├─ main.jsx                 (Zeynep)
   ├─ App.jsx                  (Zeynep)  rotalar
   ├─ styles/
   │  ├─ theme.css             (Zeynep)  renk/boyut değişkenleri
   │  └─ global.css            (Zeynep)  reset, body, uygulama kolonu
   ├─ components/              (Zeynep)  ortak bileşenler
   │  ├─ AppLayout.jsx/.css         TopBar + içerik + BottomNav
   │  ├─ TopBar.jsx/.css
   │  ├─ BottomNav.jsx/.css
   │  ├─ ProtectedRoute.jsx
   │  ├─ Button.jsx/.css
   │  ├─ Card.jsx/.css
   │  ├─ Alert.jsx/.css
   │  ├─ Spinner.jsx/.css
   │  └─ SimulationBadge.jsx/.css
   ├─ services/                (Zeynep)
   │  ├─ constants.js
   │  ├─ mockData.js
   │  └─ smartWaterService.js
   ├─ utils/
   │  └─ format.js             (Zeynep)
   └─ pages/
      ├─ Login/                (Eylül)   LoginPage.jsx, LoginPage.css
      ├─ Home/                 (Öykü)    HomePage.jsx, HomePage.css
      ├─ Purchase/             (Sinem)   PurchasePage.jsx, PurchasePage.css
      ├─ NfcLoad/              (Göksu)   NfcLoadPage.jsx, NfcLoadPage.css
      ├─ History/              (Eylül)   HistoryPage.jsx, HistoryPage.css, ReceiptModal.jsx, ReceiptModal.css
      └─ About/                (Sinem)   AboutPage.jsx, AboutPage.css
```
Bir ekrana özel küçük bileşenler (örn. `TransactionRow.jsx`, `UsageChart.jsx`) **o ekranın klasöründe** oluşturulur.

### 3.2. Kim neden sorumlu?

| Kişi | Sorumluluk | Branch | Yük |
|---|---|---|---|
| **Eylül** (Kişi 1) | Ekran 1 — Giriş · Ekran 5 — Geçmiş & Hesap (makbuz dahil) · README (en sonda) | `feature/login-history` | 5,5/10 |
| **Öykü** (Kişi 2) | Ekran 2 — Ana Sayfa (tüketim grafiği + olağan dışı tüketim uyarısı dahil) | `feature/home` | 6/10 |
| **Sinem** (Kişi 3) | Ekran 3 — Su Satın Alma & Ödeme · Ekran 6 — Hakkında | `feature/purchase-about` | 6/10 |
| **Göksu** (Kişi 4) | Ekran 4 — NFC ile Sayaca Yükleme (simülasyon) | `feature/nfc-load` | 6/10 |
| **Zeynep** (Kişi 5) | İskelet (tema, ortak bileşenler, servis, rotalar) · PR test & merge · Demo kurulumu | iskelet doğrudan `main`'e, sonra sadece merge | 6,5/10 |

---

## 4. Tasarım Sistemi

### 4.1. Renkler (`src/styles/theme.css`)
```css
:root {
  --color-primary: #0B63CE;        /* ana mavi: butonlar, vurgular */
  --color-primary-dark: #084A9A;   /* basılı buton, başlıklar */
  --color-primary-light: #E8F1FC;  /* açık mavi arka plan kartları */
  --color-accent: #12B5CB;         /* su/turkuaz vurgu: ilerleme, dalga animasyonu, grafik çubukları */
  --color-bg: #F5F8FC;             /* sayfa arka planı */
  --color-surface: #FFFFFF;        /* kart arka planı */
  --color-text: #0F1E33;
  --color-text-muted: #5B6B80;
  --color-border: #DCE4EE;
  --color-success: #1E9E5A;
  --color-success-light: #E6F6EE;
  --color-warning: #C98A0B;
  --color-warning-light: #FFF6E0;
  --color-danger: #D64545;
  --color-danger-light: #FDECEC;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --shadow-card: 0 2px 8px rgba(15, 30, 51, 0.06);
  --app-max-width: 430px;
  --topbar-height: 56px;
  --bottomnav-height: 64px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

### 4.2. Tipografi
Sistem fontu (kurulum yok). Ölçüler: sayfa başlığı 22px/700 · kart başlığı 16px/600 · gövde 15px/400 · yardımcı metin 13px/400 (`--color-text-muted`) · **büyük bakiye rakamı 36px/700**.

### 4.3. Yerleşim
- Uygulama tek bir orta kolondur: `max-width: var(--app-max-width)`, yatayda ortalı. Laptopta kolonun dışı biraz daha koyu arka plan + kolona hafif gölge → projeksiyonda "telefon ekranı" gibi görünür.
- Giriş yapılmış sayfalarda: üstte **TopBar** (sol: logo + "SmartWater", sağ: ⓘ Hakkında ikonu), altta sabit **BottomNav**. İçerik alt menünün arkasında kalmamalı (alt boşluk = `--bottomnav-height` + `--space-4`).
- Sayfa içi kenar boşluğu `--space-4`.

### 4.4. Ortak bileşenler (Zeynep yazar, herkes kullanır)
| Bileşen | Props | Görünüm |
|---|---|---|
| `Button` | `variant` (`primary` \| `secondary` \| `ghost` \| `danger`), `loading`, `disabled`, `fullWidth`, `onClick`, `type` | Yükseklik 48px, `--radius-md`. `loading` iken içinde Spinner, tıklanamaz |
| `Card` | `title?`, `children`, `className?` | Beyaz zemin, `--radius-md`, `--shadow-card`, iç boşluk `--space-4` |
| `Alert` | `type` (`info` \| `success` \| `warning` \| `error`), `title?`, `children`, `action?` | İlgili `*-light` zemin + sol kenarda renkli şerit |
| `Spinner` | `size?` | Mavi dönen halka |
| `SimulationBadge` | — | Küçük hap: "🧪 Simülasyon modu" (`--color-warning-light` zemin) |
| `TopBar` | `title?`, `showBack?` | Bölüm 4.3 |
| `BottomNav` | — | 4 sekme, aktif sekme mavi (Bölüm 6) |

### 4.5. Biçimlendirme (`src/utils/format.js`, Türkçe yerel ayar `tr-TR`)
- `formatM3(12.4)` → `"12,4 ton"` (en fazla 1 ondalık; **fonksiyon adı M3, çıktı "ton"** — Bölüm 0.2 kural 8)
- `formatTL(400)` → `"400,00 TL"`
- `formatDateTime(iso)` → `"30 Eki 2026, 14:05"`
- `formatDate(iso)` → `"30 Eki 2026"`
- `formatMonthShort("2026-10")` → `"Eki"`

---

## 5. Veri Sözleşmesi (en önemli bölüm)

Backend yok. Tüm veri, **Zeynep'in yazdığı tek bir servis dosyası** üzerinden okunur/yazılır. Servis veriyi `localStorage`'da tek bir anahtar altında JSON olarak tutar. İlk açılışta anahtar yoksa `mockData.js`'teki başlangıç verisiyle doldurulur.

> **İleride backend'e geçiş:** Tüm servis fonksiyonları baştan `async` yazılır. Gerçek bir backend eklendiğinde sadece bu fonksiyonların **içi** gerçek API çağrısıyla değiştirilir; **ekranlara dokunulmaz.**

> **Birim hatırlatması:** Aşağıdaki tüm `M3` isimli alanlar arayüzde **"ton"** olarak gösterilir.

### 5.1. Sabitler (`src/services/constants.js`)
```js
export const STORAGE_KEY = "smartwater.state.v1";
export const PRICE_PER_M3_TL = 40;          // örnek tarife (arayüzde "40,00 TL / ton")
export const MIN_PURCHASE_M3 = 1;
export const MAX_PURCHASE_M3 = 100;
export const PURCHASE_PRESETS_M3 = [5, 10, 20];
export const LOW_BALANCE_THRESHOLD_M3 = 3;
export const ANOMALY_RATIO = 1.3;           // bu ay > önceki 5 ay ortalaması × 1.3 ise uyarı
export const SERVICE_DELAY_MS = 400;        // her servis çağrısında yapay gecikme
export const PAYMENT_DELAY_MS = 1500;       // ödeme işleniyor hissi
export const DEMO_SUBSCRIBER_NO = "SW-100245";
export const DEMO_CARD = { number: "4242 4242 4242 4242", expiry: "12/29", cvv: "123" };
export const DECLINED_TEST_CARD = "4000 0000 0000 0002"; // [Zaman kalırsa] başarısız ödeme senaryosu
export const WRONG_METER_NO = "NFC-MTR-0009999";         // [Zaman kalırsa] yanlış sayaç senaryosu
```

### 5.2. Veri modeli
```js
// localStorage[STORAGE_KEY] içindeki nesne
{
  sessionSubscriberNo: "SW-100245" | null,   // giriş yapılmış mı?
  account: {
    subscriberNo: "SW-100245",
    fullName: "Ayşe Demir",                   // uydurma demo kişi
    address: "Kumsal Mah. Zeytin Sk. No: 12", // uydurma adres
    municipality: "Lefkoşa",
    meterNo: "NFC-MTR-0007841",
    meterBalanceM3: 2.4,                      // sayaçtaki su (arayüzde ton)
    pendingM3: 0                              // satın alınmış, sayaca henüz aktarılmamış su
  },
  transactions: [ Transaction, ... ],
  monthlyUsage: [ { month: "2026-05", m3: 8.6 }, ... ]   // son 6 ay, eskiden yeniye
}

// Transaction
{
  id: "TX-1730300000000",                    // "TX-" + Date.now()
  type: "purchase" | "meter_load",
  amountM3: 10,
  pricePerM3TL: 40,                          // sadece purchase; meter_load'da null
  totalTL: 400,                              // sadece purchase; meter_load'da null
  cardLast4: "4242",                         // sadece purchase; meter_load'da null
  meterNo: "NFC-MTR-0007841",
  status: "pending_load" | "loaded" | "completed" | "failed",
  createdAt: "2026-10-30T14:05:00.000Z",
  loadedAt: "..." | null                     // purchase sayaca yüklendiğinde dolar
}
```
**Durum anlamları:**
| type | status | Arayüzde |
|---|---|---|
| `purchase` | `pending_load` | "Yükleme bekliyor" (uyarı rengi) |
| `purchase` | `loaded` | "Sayaca yüklendi" (başarı rengi) |
| `meter_load` | `completed` | "Tamamlandı" (başarı rengi) |
| `meter_load` | `failed` | "Başarısız" (hata rengi) |

### 5.3. Başlangıç verisi (`src/services/mockData.js`)
- Hesap: yukarıdaki `account` (sayaç bakiyesi **2,4 ton** → demoda düşük bakiye uyarısı görünür; bekleyen **0**).
- Geçmiş işlemler (hepsi 40 TL/ton, kart sonu 4242):
  | id | type | ton | tarih | status |
  |---|---|---|---|---|
  | TX-1001 | purchase | 10 | 2026-08-03 10:15 | loaded |
  | TX-1002 | meter_load | 10 | 2026-08-03 18:40 | completed |
  | TX-1003 | purchase | 10 | 2026-09-02 09:30 | loaded |
  | TX-1004 | meter_load | 10 | 2026-09-02 20:05 | completed |
  | TX-1005 | purchase | 12 | 2026-10-01 12:00 | loaded |
  | TX-1006 | meter_load | 12 | 2026-10-01 19:20 | completed |
- Aylık tüketim (ton): `2026-05: 8.6`, `2026-06: 8.9`, `2026-07: 9.4`, `2026-08: 8.7`, `2026-09: 8.8`, `2026-10: 12.1` → bu ay önceki 5 ayın ortalamasının (8,88) %36 üstünde, geçen aya göre %38 fazla → **olağan dışı tüketim uyarısı demoda görünür.**

### 5.4. Servis fonksiyonları (`src/services/smartWaterService.js`)
**Dönüş biçimi (tüm async fonksiyonlarda aynı):**
```js
{ ok: true, data: ... }
{ ok: false, error: { code: "SUBSCRIBER_NOT_FOUND", message: "Türkçe, kullanıcıya gösterilecek mesaj" } }
```
Sayfalar hata mesajını kendileri yazmaz; `error.message`'ı gösterir. Her async fonksiyon önce `SERVICE_DELAY_MS` kadar bekler.

| Fonksiyon | Girdi | Başarılı `data` | Hata kodları |
|---|---|---|---|
| `isLoggedIn()` **(senkron)** | — | `true/false` döner (sarmalanmaz) | — |
| `login(subscriberNo)` | string (boşluklar kırpılır, büyük harfe çevrilir) | `account` | `SUBSCRIBER_NOT_FOUND` |
| `logout()` | — | `null` | — |
| `getAccount()` | — | `account` | `NOT_LOGGED_IN` |
| `purchaseWater({ amountM3, card })` | `card = { number, expiry, cvv }` | `{ transaction, account }` | `INVALID_AMOUNT`, `INVALID_CARD`, `PAYMENT_DECLINED` *(zaman kalırsa)*, `NOT_LOGGED_IN` |
| `loadToMeter({ meterNo })` | okutulan sayaç no (normalde `account.meterNo`) | `{ loadedM3, newMeterBalanceM3, transaction }` | `NO_PENDING_BALANCE`, `METER_MISMATCH`, `NOT_LOGGED_IN` |
| `getTransactions()` | — | Transaction[] (yeniden eskiye) | `NOT_LOGGED_IN` |
| `getTransactionById(id)` | string | Transaction | `TRANSACTION_NOT_FOUND` |
| `getLastMeterLoad()` | — | son `completed` meter_load veya `null` | `NOT_LOGGED_IN` |
| `getUsageSummary()` | — | `{ months, currentMonthM3, previousMonthM3, changePercent, averagePreviousM3, anomalyPercent, isAnomaly }` | `NOT_LOGGED_IN` |
| `resetDemoData()` | — | `null` (başlangıç verisine döner, oturum kapanır) | — |

**İş kuralları:**
- `purchaseWater`: `amountM3` tam sayı ve 1–100 arası olmalı. Kart kontrolü sadece biçim: numara 16 hane (boşluklar yok sayılır), son kullanma `AA/YY` biçiminde ve geçmiş bir ay değil, CVV 3 hane. Ek olarak `PAYMENT_DELAY_MS` bekler. Başarılıysa: `purchase` işlemi `pending_load` durumunda eklenir, `pendingM3 += amountM3`. Kart numarasının **sadece son 4 hanesi** saklanır.
- `loadToMeter` (**çift yüklemeyi engelleyen kural**): Tek adımda ve bölünmeden şunları yapar:
  1. `pendingM3 === 0` ise → `NO_PENDING_BALANCE`.
  2. `meterNo !== account.meterNo` ise → hiçbir bakiye değişmez, `failed` durumunda bir `meter_load` kaydı eklenir → `METER_MISMATCH`.
  3. Aksi halde: `meterBalanceM3 += pendingM3`, `pendingM3 = 0`, tüm `pending_load` satın almalar `loaded` olur (`loadedAt` dolar), `completed` bir `meter_load` kaydı eklenir.
  Bekleyen bakiye sıfırlandığı için aynı yükleme ikinci kez yapılamaz.
- `getUsageSummary`:
  - `months` = `monthlyUsage` dizisi (eskiden yeniye)
  - `currentMonthM3` = son ay, `previousMonthM3` = bir önceki ay
  - `changePercent` = (son ay − önceki ay) / önceki ay × 100, tam sayıya yuvarlanır (demo verisinde **+38**)
  - `averagePreviousM3` = son ay hariç önceki 5 ayın ortalaması
  - `anomalyPercent` = (son ay − ortalama) / ortalama × 100, tam sayıya yuvarlanır (demo verisinde **36**)
  - `isAnomaly` = `currentMonthM3 > averagePreviousM3 * ANOMALY_RATIO`

**Hata mesajları (Türkçe):**
| Kod | Mesaj |
|---|---|
| `SUBSCRIBER_NOT_FOUND` | Bu abonelik numarasıyla kayıtlı bir hesap bulunamadı. Numarayı kontrol edip tekrar deneyin. |
| `NOT_LOGGED_IN` | Oturumunuz sona erdi. Lütfen tekrar giriş yapın. |
| `INVALID_AMOUNT` | Lütfen 1 ile 100 ton arasında tam sayı bir miktar girin. |
| `INVALID_CARD` | Kart bilgileri geçersiz. Lütfen kart numarası, son kullanma tarihi ve CVV'yi kontrol edin. |
| `PAYMENT_DECLINED` | Ödeme bankanız tarafından onaylanmadı. Farklı bir kartla tekrar deneyin. |
| `NO_PENDING_BALANCE` | Yüklenecek bekleyen bakiyeniz yok. Önce su satın alın. |
| `METER_MISMATCH` | Okutulan sayaç bu aboneliğe kayıtlı değil. Yükleme yapılmadı, bakiyeniz güvende. |
| `TRANSACTION_NOT_FOUND` | İşlem bulunamadı. |

---

## 6. Navigasyon ve Rotalar

`App.jsx` içinde `HashRouter` (adresler `/#/home` gibi görünür).

| Rota | Sayfa | Erişim | Düzen |
|---|---|---|---|
| `/` | — | Giriş yapılmışsa `/home`, değilse `/login`'e yönlendirir | — |
| `/login` | Giriş | Herkes (giriş yapılmışsa `/home`'a yönlendir) | TopBar/BottomNav **yok** |
| `/about` | Hakkında | Herkes | TopBar (geri butonlu), BottomNav **yok** |
| `/home` | Ana Sayfa | Giriş gerekli | AppLayout |
| `/purchase` | Satın Al | Giriş gerekli | AppLayout |
| `/load` | NFC Yükleme | Giriş gerekli | AppLayout |
| `/history` | Geçmiş & Hesap | Giriş gerekli | AppLayout |
| `*` | — | `/`'e yönlendir | — |

"Giriş gerekli" rotalar `ProtectedRoute` ile sarılır: `isLoggedIn()` false ise `/login`'e yönlendirir.

**BottomNav sekmeleri** (soldan sağa): `Ana Sayfa` → `/home` · `Satın Al` → `/purchase` · `Yükle` → `/load` · `Geçmiş` → `/history`. Her sekmede basit bir inline SVG ikon + etiket.
**TopBar:** sağdaki ⓘ ikonu `/about`'a gider. Hakkında sayfasındaki geri butonu: giriş yapılmışsa `/home`, değilse `/login`.

---

## 7. Ekranlar

> Her ekran sahibinin agent'ı sadece kendi bölümünü uygular. "Kabul kriterleri" önce ekran sahibinin PR öncesi öz kontrolü, sonra Zeynep'in test kontrol listesidir.

### 7.1. Ekran 1 — Giriş (`/login`) · **Eylül (Kişi 1)**
**Amaç:** Kullanıcının abonelik numarasıyla hesabına girmesi.
**Neden şifre yok?** Su abonelikleri genellikle ev sahibinin üzerine kayıtlı; kiracının telefon numarası vb. sistemde olmayabilir. Ayrıca kimse başkasının sayacına para ödeyip su yüklemek istemez. Gerçek sistemde ek doğrulama düşünülebilir (Bölüm 12).

**[Zorunlu]**
- Üstte logo (basit damla SVG) + "SmartWater" + slogan: *"Suyunu telefonundan al, sayacına yükle."*
- 1–2 cümlelik tanıtım: *"Su yükleme noktasına gitmeden, telefonunuzdan su satın alın ve NFC destekli sayacınıza aktarın."* + "Hakkında" bağlantısı (`/about`).
- "Abonelik numarası" alanı (placeholder `SW-100245`).
- "Giriş Yap" butonu: alan boşken pasif; tıklanınca `loading`.
- Hata olursa alanın altında `Alert type="error"` ile `error.message`.
- Küçük ipucu: *"Demo abonelik no: **SW-100245**"* (tıklanınca alana doldurur).
- Başarılı girişte `/home`'a yönlendirme.

**Kabul kriterleri**
- [ ] `SW-100245` ile giriş → Ana Sayfa açılır. ` sw-100245 ` (küçük harf + boşluk) da çalışır.
- [ ] Yanlış numara → Türkçe hata mesajı, sayfa değişmez.
- [ ] Giriş yapılmışken `/login` açılırsa `/home`'a gider.
- [ ] Sayfa yenilenince oturum korunur.

### 7.2. Ekran 2 — Ana Sayfa (`/home`) · **Öykü (Kişi 2)**
**Amaç:** Hesabın özetini ve tüketim durumunu tek ekranda görmek, ana işlemlere hızlı geçmek.

**[Zorunlu]** (yukarıdan aşağıya bu sırayla)
1. **Selamlama:** *"Merhaba, Ayşe"* + altında abonelik no ve sayaç no (`--color-text-muted`).
2. **Sayaç bakiyesi kartı:** "Sayaçtaki bakiye" başlığı + büyük rakam (`formatM3` → *"2,4 ton"*).
3. **Düşük bakiye uyarısı:** `meterBalanceM3 < LOW_BALANCE_THRESHOLD_M3` ise `Alert type="warning"`: *"Bakiyeniz azalıyor. Su satın alıp sayacınıza yükleyebilirsiniz."* + "Su Satın Al" aksiyonu.
4. **Bekleyen yükleme kartı:**
   - `pendingM3 > 0` ise: *"Yükleme bekleyen: 10 ton"* + **"NFC ile Sayaca Yükle"** butonu (`/load`).
   - `pendingM3 === 0` ise: soluk metin *"Bekleyen yükleme yok."*
5. **Hızlı işlemler:** "Su Satın Al" (`/purchase`) ve "NFC ile Sayaca Yükle" (`/load`; bekleyen 0 ise pasif).
6. **Son yükleme:** `getLastMeterLoad()` → *"Son yükleme: 12 ton · 1 Eki 2026"*; yoksa *"Henüz yükleme yapılmadı."*
7. **Olağan dışı tüketim uyarısı:** `getUsageSummary().isAnomaly` true ise `Alert type="warning"`, başlık *"Olağan dışı tüketim"*, metin: *"Bu ayki tüketiminiz son 5 ayın ortalamasından %{anomalyPercent} fazla. Musluk ve tesisatınızı kaçak açısından kontrol etmenizi öneririz."* + küçük not: *"Bu uyarı kesin kaçak tespiti değildir."*
8. **Tüketim kartı + grafik** (`UsageChart.jsx`, `pages/Home/` içinde):
   - Başlık: *"Aylık tüketim"*; altında: *"Bu ay 12,1 ton · geçen aya göre %38 fazla"* (`changePercent` negatifse *"%X az"*, 0 ise *"geçen ayla aynı"*).
   - **Son 6 ayın CSS çubuk grafiği** (kütüphane yok): yan yana 6 dikey çubuk; çubuk yüksekliği = `m3 / en büyük değer × grafik yüksekliği` (grafik yüksekliği ~140px).
   - Her çubuğun **üstünde değeri** (örn. *"8,6"*), **altında ay kısaltması** (`formatMonthShort`).
   - Çubuk rengi `--color-accent`; **son ay (bu ay)** `--color-primary` ile vurgulanır. `isAnomaly` true ise son ay çubuğu `--color-warning`.
   - Kartın altında küçük not: *"Örnek veri"*.
- Veri yüklenirken Spinner.

**Kabul kriterleri**
- [ ] Demo başlangıcında 2,4 ton ve düşük bakiye uyarısı görünür.
- [ ] Olağan dışı tüketim uyarısı "%36 fazla" metniyle görünür.
- [ ] Grafikte 6 çubuk, değerler ve ay etiketleri (May, Haz, Tem, Ağu, Eyl, Eki) doğru; en yüksek çubuk Ekim; 360px genişlikte taşmıyor.
- [ ] Satın alma sonrası bekleyen miktar ve "NFC ile Sayaca Yükle" butonu görünür.
- [ ] NFC yüklemesi sonrası bakiye güncellenir (örn. 12,4 ton), düşük bakiye uyarısı kaybolur, bekleyen kartı "Bekleyen yükleme yok" olur.

### 7.3. Ekran 3 — Su Satın Alma & Ödeme (`/purchase`) · **Sinem (Kişi 3)**
**Amaç:** Kullanıcının istediği miktarda suyu satın alması.

**[Zorunlu]**
- Üstte küçük abonelik özeti: abonelik no + sayaç no.
- **Miktar seçimi:**
  - Hazır butonlar: **5 ton · 10 ton · 20 ton** (`PURCHASE_PRESETS_M3`). Seçilen mavi görünür.
  - "Farklı miktar" alanı: sadece rakam (`inputMode="numeric"`), 1–100 tam sayı. Hazır buton seçilince alan o değeri gösterir; alana yazılınca hazır seçim kalkar.
  - Geçersiz değerde alan altında: *"Lütfen 1 ile 100 ton arasında tam sayı girin."*
- **Fiyat özeti:** *"Birim fiyat: 40,00 TL / ton (örnek tarife)"* ve büyük yazıyla **Toplam: 400,00 TL** (miktar değiştikçe anında hesaplanır).
- **Ödeme bilgileri:**
  - Kart numarası (yazarken 4'erli gruplanır: `4242 4242 4242 4242`)
  - Son kullanma (`AA/YY`)
  - CVV (3 hane, gizli)
  - **"Demo kartıyla doldur"** bağlantısı (`DEMO_CARD`).
  - Not: *"Bu bir simülasyondur; gerçek ödeme alınmaz ve kart bilgileriniz saklanmaz."*
- **"Ödemeyi Tamamla (400,00 TL)"** butonu: miktar ve kart geçerli değilse pasif; tıklanınca `loading` ("Ödeme işleniyor…").
- **Başarılı ödeme** (form yerine sonuç görünümü):
  - ✓ *"Ödeme başarılı"*
  - *"10 ton su hesabınıza yükleme hakkı olarak tanımlandı. Sayacınıza aktarmak için NFC ile yükleyin."*
  - İşlem no + tarih
  - Butonlar: **"NFC ile Sayaca Yükle"** (`/load`) ve "Ana Sayfaya Dön" (`/home`).
- **Başarısız ödeme:** `Alert type="error"` + `error.message` + "Tekrar Dene" (form bilgileri korunur).

**[Zaman kalırsa]**
- `DECLINED_TEST_CARD` ile ödeme → servis `PAYMENT_DECLINED` döner (servis tarafı Zeynep'te hazır), ekran başarısız görünümünü gösterir.

**Kabul kriterleri**
- [ ] 10 ton seçilince toplam 400,00 TL; 7 yazılınca 280,00 TL.
- [ ] 0, 101, 2.5, boş değer → buton pasif + uyarı.
- [ ] Demo kartıyla ödeme → başarı ekranı; Ana Sayfa'da bekleyen 10 ton görünür.
- [ ] Geçmiş'te yeni bir "Yükleme bekliyor" satırı oluşur.
- [ ] Ekranın hiçbir yerinde "m³" yazmıyor, her yerde "ton".
- [ ] İskeletteki geçici "Test: 10 ton satın al" butonu artık yok (sayfa tamamen bu ekranla değişti).

### 7.4. Ekran 4 — NFC ile Sayaca Yükleme (`/load`) · **Göksu (Kişi 4)**
**Amaç:** Bekleyen bakiyenin (simüle edilmiş) NFC ile kullanıcının kendi sayacına aktarılması.
**Sayfanın üstünde her zaman `SimulationBadge`** ve kısa not: *"Bu prototipte NFC aktarımı simüle edilir."*

**[Zorunlu] — Adım akışı (state machine)**
| Durum | Ekranda | Geçiş |
|---|---|---|
| `idle` | Bekleyen kartı: *"Yükleme bekleyen: 10 ton"*, *"Sayaç: NFC-MTR-0007841"*, **"Yüklemeyi Başlat"** butonu | Butona basınca → `checking` |
| `idle` (bekleyen 0) | Boş durum: *"Yüklenecek bakiye yok."* + "Su Satın Al" (`/purchase`) | — |
| `checking` | Spinner + *"Telefonunuzun NFC desteği kontrol ediliyor…"* | 1,5 sn sonra → `waiting` |
| `waiting` | Telefon + dalga animasyonu (CSS, `--color-accent`), *"Telefonunuzu sayacınızdaki NFC alanına yaklaştırın."*, **"Sayaca Okut (Simülasyon)"** butonu, "Vazgeç" (ghost) | Okut → `reading` · Vazgeç → `idle` |
| `reading` | *"Sayaç okunuyor…"* | 1 sn sonra → `matched` |
| `matched` | ✓ *"Sayaç eşleşti: NFC-MTR-0007841 · Abonelik SW-100245"* | 1 sn sonra → `loading` |
| `loading` | İlerleme çubuğu 0→%100 (~2 sn), *"10 ton sayaca aktarılıyor…"*. Bu durumun başında `loadToMeter({ meterNo: account.meterNo })` çağrılır | Animasyon **ve** servis bitince → `success` veya `error` |
| `success` | ✓ *"Yükleme başarılı"*, *"10 ton sayacınıza yüklendi. Yeni sayaç bakiyesi: 12,4 ton"*, butonlar "Ana Sayfa" ve "İşlem Geçmişi" | — |
| `error` | ✗ `Alert type="error"` + `error.message` + **"Tekrar Dene"** | → `idle` (bekleyen miktar servisten yeniden okunur) |

**Kurallar**
- Akış devam ederken başlat/okut butonları tekrar tıklanamaz (çift tıklama koruması).
- Bekleyen miktar akışın başında servisten **yeniden** okunur (eski veri kullanılmaz).
- Sayfadan akış ortasında çıkılırsa sorun olmaz: aktarım sadece `loadToMeter` çağrısında ve tek adımda gerçekleşir.
- Zamanlayıcılar sayfa kapanınca temizlenir.

**[Zaman kalırsa]**
- **Yanlış sayaç senaryosu:** `waiting` durumunda küçük bir bağlantı *"Farklı bir sayaç okut (demo)"* → `loadToMeter({ meterNo: WRONG_METER_NO })` → `error` durumunda `METER_MISMATCH` mesajı. Bekleyen bakiye değişmez.

**Kabul kriterleri**
- [ ] Bekleyen 10 ton → tüm adımlar sırayla görünür → başarı; yeni bakiye doğru.
- [ ] Başarıdan sonra tekrar `/load` açılırsa "Yüklenecek bakiye yok" görünür (**çift yükleme yok**).
- [ ] "Simülasyon modu" etiketi her durumda görünür.
- [ ] Geçmiş'te `meter_load` "Tamamlandı" satırı oluşur, ilgili satın alma "Sayaca yüklendi" olur.

### 7.5. Ekran 5 — İşlem Geçmişi & Hesap (`/history`) · **Eylül (Kişi 1)**
**Amaç:** Geçmiş işlemleri görmek, dijital makbuza ulaşmak, hesap bilgilerini görmek.

**[Zorunlu]**
- **Hesap kartı:** Ad soyad, abonelik no, adres, belediye, sayaç no.
- **İşlem listesi** (`getTransactions()`, yeniden eskiye). Her satırda:
  - Tür etiketi: "Su satın alma" / "Sayaca yükleme" (+ küçük ikon)
  - Tarih (`formatDateTime`)
  - Miktar (`formatM3` → "ton"); satın almalarda tutar (`formatTL`)
  - Durum çipi (Bölüm 5.2 tablosundaki metin ve renkler)
- Liste boşsa: *"Henüz işlem yok."*
- **Dijital makbuz:** Bir satın alma satırına dokununca `ReceiptModal` açılır (sayfa içi pencere, `alert` değil):
  - Başlık "Dijital Makbuz" + SmartWater logosu
  - İşlem no, tarih, abonelik no, ad soyad, sayaç no
  - Miktar, birim fiyat (*"40,00 TL / ton"*), toplam tutar, ödeme yöntemi (*"Kart •••• 4242"*), durum
  - Alt not: *"Bu makbuz kâğıt yerine dijital olarak saklanır."*
  - "Kapat" butonu
- **"Çıkış Yap"** butonu → `logout()` → `/login`.
- **"Demo verisini sıfırla"** (küçük, sayfanın en altında, `ghost`): ilk tıklamada buton *"Emin misiniz? Tekrar dokunun"* olur, ikinci tıklamada `resetDemoData()` → `/login`.

**[Zaman kalırsa]**
- Filtre sekmeleri: Tümü / Satın alma / Yükleme.
- Makbuzda **"PDF olarak kaydet"**: `window.print()` + yalnızca makbuzu gösteren `@media print` CSS'i (kütüphane yok; kullanıcı yazdır penceresinden "PDF olarak kaydet"i seçer).

**Kabul kriterleri**
- [ ] Başlangıçta 6 işlem görünür, en yenisi en üstte.
- [ ] Satın alma satırına dokununca makbuz doğru bilgilerle açılır ve kapanır.
- [ ] Çıkış → Giriş ekranı; korumalı sayfalar açılamaz.
- [ ] Sıfırlama sonrası her şey başlangıç verisine döner.

### 7.6. Ekran 6 — Hakkında (`/about`) · **Sinem (Kişi 3)**
**Amaç:** Projeyi ve sürdürülebilirlik bağlantısını anlatmak. Sadece metin + basit kartlar; giriş yapmadan da açılabilir.

**[Zorunlu] — Metin aşağıdaki gibi kullanılır (küçük düzeltmeler serbest):**

**SmartWater nedir?**
SmartWater, Kıbrıs'ta kullanılan ön ödemeli su kartı sistemini modernleştirmeyi amaçlayan bir prototiptir. Vatandaşlar su yükleme noktasına gitmeden telefonlarından su satın alabilir ve satın aldıkları suyu NFC destekli yeni nesil sayaçlarına aktarabilir. Fiziksel su kartına gerek kalmaz.

**Nasıl çalışır?** (3 numaralı adım kartı)
1. **Satın al:** Abonelik numaranızla giriş yapın ve istediğiniz miktarda su satın alın.
2. **Hesabınıza tanımlansın:** Satın aldığınız su, aboneliğinize kayıtlı sayacınız için "yükleme bekleyen bakiye" olarak saklanır.
3. **Sayacınıza yükleyin:** Telefonunuzu sayacınıza yaklaştırın; bakiye NFC ile aktarılır. Aynı yükleme hakkı ikinci kez kullanılamaz ve başka bir sayaca yüklenemez.

**Sürdürülebilirlik ve Sürdürülebilir Kalkınma Amaçları (SKA)** (her biri ayrı küçük kart; "SKA 6" gibi mavi rozet + başlık + uyum düzeyi + 1–2 cümle)
- **SKA 6 — Temiz Su ve Sanitasyon** · *Çok güçlü potansiyel*: Tüketim takibi ve olağan dışı tüketim uyarıları, kullanıcıların su kullanımını anlamasına ve olası kayıpları daha erken fark etmesine yardımcı olabilir.
- **SKA 12 — Sorumlu Üretim ve Tüketim** · *Çok güçlü potansiyel*: Tüketim verilerinin görünür olması bilinçli kullanımı destekler; dijital makbuzlar kâğıt fiş ihtiyacını azaltabilir.
- **SKA 9 — Sanayi, Yenilikçilik ve Altyapı** · *Güçlü*: NFC destekli sayaçlar ve dijital yükleme süreci, mevcut ön ödemeli su altyapısının modernleştirilmesine katkıda bulunur.
- **SKA 11 — Sürdürülebilir Şehirler ve Topluluklar** · *Destekleyici*: Dijital su hizmetleri, vatandaşların hizmetlere zaman ve yol masrafı harcamadan erişmesini kolaylaştırır.
- **SKA 13 — İklim Eylemi** · *Dolaylı*: Verimli su kullanımı, kuraklık risklerine karşı dayanıklılığı destekleyebilir.

> Not kutusu: *"Dijital yükleme tek başına su tasarrufu sağlamaz. Asıl katkı, tüketimin görünür hâle gelmesi ve olası kayıpların erken fark edilmesiyle ortaya çıkar."*

**Donanım ve elektronik atık**
Sayaçların değiştirilmesi bir maliyet ve elektronik atık kaynağıdır. Bu nedenle geçişin kademeli yapılması (önce yeni abonelikler ve ömrünü tamamlamış sayaçlar), uzun ömürlü ve onarılabilir sayaçların tercih edilmesi ve eski sayaçların uygun elektronik atık süreçleriyle geri dönüştürülmesi öngörülür.

**Prototip notu**
Bu sürüm Sürdürülebilir Kıbrıs Hackathonu 2026 için geliştirilmiş bir prototiptir. Ödeme ve NFC aktarımı simüle edilmektedir; veriler örnektir. Gösterilen 40 TL/ton fiyatı örnek tarifedir; gerçek tarifeler belediyeye göre değişir. Uygulamada miktarlar ton cinsinden gösterilir (1 ton su ≈ 1 m³).

**Ekip:** Eylül · Öykü · Sinem · Göksu · Zeynep

**Kabul kriterleri**
- [ ] Giriş yapmadan Giriş ekranındaki bağlantıdan açılır; giriş yapmışken TopBar'daki ⓘ ikonundan açılır.
- [ ] Geri butonu doğru sayfaya döner.
- [ ] 360px genişlikte metin taşmaz.

### 7.7. README.md · **Eylül (Kişi 1)** — en sonda, tüm ekranlar merge edildikten sonra
Repo herkese açık olduğu için repo sayfasında görünen tanıtım dosyası. Türkçe yazılır. İçerik:
- **SmartWater** başlığı + 2–3 cümlelik açıklama (Hakkında'daki "SmartWater nedir?" metninden kısaltılabilir)
- **Özellikler** listesi (giriş, bakiye, satın alma, NFC ile yükleme simülasyonu, tüketim grafiği, olağan dışı tüketim uyarısı, işlem geçmişi ve dijital makbuz)
- **Teknolojiler:** React, Vite, React Router, CSS, localStorage
- **Çalıştırma:** `npm install` → `npm run dev` (telefonda açmak için `npm run dev -- --host`)
- **Demo:** abonelik no `SW-100245`, "Demo kartıyla doldur"
- **Not:** *"Bu proje Sürdürülebilir Kıbrıs Hackathonu 2026 için geliştirilmiş bir prototiptir. Ödeme ve NFC aktarımı simüle edilmektedir; tüm veriler örnektir."*
- **Ekip:** Eylül, Öykü, Sinem, Göksu, Zeynep
- *(İsteğe bağlı)* Ekran görüntüleri

---

## 8. Kurulum ve Git Akışı

> **Hatırlatma:** Bu bölümdeki git işlemlerini (pull, commit, push, branch, PR, merge) **sadece ekip üyeleri GitHub Desktop'tan** yapar. Agent'lar git komutu çalıştırmaz (Bölüm 0.2, kural 1). Agent'lar sadece `npm` komutlarını önerebilir.

### 8.0. Hazırlık (herkes, hackathon başlamadan)
- Herkesin bilgisayarında: **Node.js LTS** (`node -v` ≥ 20.19), **GitHub Desktop** (kendi hesabıyla giriş yapılmış), **VS Code** (veya agent'ın editörü), **Chrome**.
- Repo sahibi GitHub'da **Settings → Collaborators** üzerinden herkesi davet eder; herkes daveti kabul eder.
- Windows'ta komutlar için **Command Prompt (cmd)** önerilir. PowerShell'de `npm` *"running scripts is disabled"* hatası verirse cmd kullanın.

### 8.1. Template ve iskelet

**Durum: Template TAMAMLANDI.** Zeynep, hocanın komutuyla (`npm create vite@latest . -- --template react`) template'i kurdu ve `main`'e push'ladı (commit: `chore: add Vite React template`). Repo kökünde `package.json`, `index.html`, `vite.config.js`, `eslint.config.js`, `.gitignore`, `README.md`, `src/`, `public/` var; `node_modules` GitHub'da **yok** (doğru).

> **Agent'lar için:** Template işi bitti. **`npm create vite` asla çalıştırılmaz**, template yeniden kurulmaz, `README.md`/`.gitignore`/`vite.config.js`/`eslint.config.js` değiştirilmez (README'yi en sonda sadece Eylül yazar, Bölüm 7.7).

> **Kimse başka bir template kurmaz / push'lamaz.** Daha önce kendi bilgisayarında hocanın komutunu çalıştırmış biri varsa (örn. Öykü) o eski dosyaları **asla push'lamaz** (Bölüm 8.1.1).

> **Spec dosyasını repo'ya sadece Zeynep koyar.** Diğerleri `SMARTWATER_SPEC.md`'yi kendi repo klasörüne **kopyalamaz** (yoksa GitHub Desktop'ta değişiklik olarak görünür ve yanlışlıkla commit'lenip çakışabilir). İskelet gelene kadar dosya agent'a **sohbete ek olarak** verilir; iskelet geldikten sonra Pull ile herkesin klasörüne kendiliğinden gelir.

#### 8.1.1. Öykü — eski yerel template'i temizlemek (bir kez)
Öykü'nün bilgisayarında daha önce kurduğu template duruyor; bu dosyalar Zeynep'inkilerle çakışır.
1. GitHub Desktop → **Repository → Show in Explorer** ile SmartWater klasörünün yerini bulun.
2. GitHub Desktop'ı kapatın, **SmartWater klasörünü tamamen silin.**
3. GitHub Desktop'ı açın; repo'nun bulunamadığını söylerse **Remove** deyin.
4. **File → Clone repository** → SmartWater → **Clone**. Zeynep'in template'i (ve iskelet geldiyse iskelet) hazır gelir.
> GitHub Desktop'taki *Discard changes* ile tek tek silmeye çalışmayın: `.gitignore` da silineceği için `node_modules` binlerce dosya olarak listede belirebilir. Klasörü silip yeniden clone'lamak en temizi.

#### 8.1.2. Zeynep — iskelet (~45–60 dk; diğerleri kod yazmaya bundan sonra başlar)
1. Template'i kurduğun repo klasöründen devam et (GitHub Desktop'ta `main` seçili, **Fetch origin** ile güncel olduğunu kontrol et).
   - Bu dosyayı (`SMARTWATER_SPEC.md`) **elle** repo klasörünün en üstüne (kök) kopyala. Agent iskeleti kurarken dosyayı buradan okuyacak.
2. **Repository → Open in Command Prompt** (Mac'te *Open in Terminal*). `npm create vite` **çalıştırılmaz.** Sadece:
   ```
   npm install
   npm install react-router-dom
   ```
3. **Dene:** `npm run dev` → `http://localhost:5173` açılmalı. Durdurmak için `Ctrl + C`.
4. **Telefon testini hemen yap** (Bölüm 9): `npm run dev -- --host` ile sitenin telefonda açıldığını hackathon mekanının Wi-Fi'ında **ilk saatte** doğrula.
5. **Agent ile iskeleti kur** (agent'a "SMARTWATER_SPEC.md'yi oku, Bölüm 8.1.2'deki iskeleti kuralım" de):
   - Şablondaki örnek içeriği temizle (sayaç örneği, `App.css`, `assets/react.svg`).
   - `index.html`'de `lang="tr"`, başlık "SmartWater", `<meta name="viewport" content="width=device-width, initial-scale=1">`.
   - Bölüm 3.1'deki klasör yapısı, `theme.css`, `global.css`, ortak bileşenler (4.4), `format.js` (4.5), servis + sabitler + mock veri (Bölüm 5), rotalar (Bölüm 6).
   - **Her ekran için geçici sayfa:** başlık + *"Bu ekran yapım aşamasında — {ekran sahibinin adı}"*. Ekran sahipleri bu dosyaların içini dolduracak.
   - **Geçici test butonu (sadece Satın Alma'nın geçici sayfasında):** *"Test: 10 ton satın al (geçici)"* butonu; `purchaseWater({ amountM3: 10, card: DEMO_CARD })` çağırır ve sonucu sayfada küçük bir mesajla gösterir. Amaç: Sinem'in Satın Alma ekranı merge edilene kadar Göksu (NFC), Öykü (Ana Sayfa'daki bekleyen yükleme kartı) ve Eylül (Geçmiş'teki "Yükleme bekliyor" durumu) ekranlarını bekleyen bakiyeyle test edebilsin. Sinem geçici sayfanın yerine kendi ekranını koyduğunda buton kendiliğinden kalkar; başka hiçbir yere eklenmez.
   - `SMARTWATER_SPEC.md` 1. adımda Zeynep tarafından repo köküne konmuş olur; agent bu dosyayı **değiştirmez**.
6. **Commit & push (GitHub Desktop):** özet `chore: initial project skeleton` → **Commit to main** → **Push origin**.
   - ⚠️ Commit listesinde `node_modules` **görünmemeli** (klasörün bilgisayarda Explorer'da durması normaldir).
7. Ekibe "iskelet hazır" de.

### 8.2. Herkes — Başlangıç (iskelet geldikten sonra)
1. GitHub Desktop → **Fetch origin / Pull origin** (main güncel olsun).
2. **Current Branch → New Branch** → Bölüm 3.2'deki branch adı (örn. `feature/home`), *main*'den oluşturulur.
3. Terminal (Repository → Open in Command Prompt): `npm install` (sadece ilk seferde ve `package.json` değiştiğinde), ardından `npm run dev`.
4. Agent'a "repo kökündeki `SMARTWATER_SPEC.md`'yi oku, {Ekran X}'i yapalım" deyin.
5. Bekleyen bakiye gereken bir durumu test etmek için (Satın Alma ekranı henüz merge edilmediyse): **Satın Al** sekmesindeki geçici **"Test: 10 ton satın al"** butonunu kullanın (Bölüm 8.1.2).

### 8.3. Çalışma sırasında
- **Kimse doğrudan `main`'e push yapmaz** (Zeynep'in template'i ve ilk iskeleti hariç).
- Sık ve küçük commit (GitHub Desktop'tan): İngilizce mesaj, örn. `feat(home): add usage chart`, `fix(purchase): validate expiry date`.
- Ekran bitince: **Kabul kriterlerini kendiniz kontrol edin** → **Push origin** → **Create Pull Request** (GitHub Desktop butonu) → açıklamaya ne yapıldığını ve varsa ortak dosya isteklerini yazın.
- Başkasının PR'ı merge edildikten sonra: GitHub Desktop → kendi branch'inizdeyken **Branch → Update from main**. Dosya sahipliği ayrı olduğu için çakışma beklenmez.
- Her yeni agent sohbetinde dosyayı tekrar okutun; agent'lar önceki sohbeti hatırlamaz.

### 8.4. Zeynep — PR inceleme ve merge
1. GitHub Desktop → **Current Branch → Pull Requests** sekmesi → ilgili PR'ı seçin (branch'e geçer).
2. `npm install` (gerekirse) → `npm run dev -- --host` → telefonda ve laptopta açın (Bölüm 9).
3. İlgili ekranın **Kabul kriterleri**ni kontrol edin + ortak dosyalara dokunulmadığını kontrol edin (PR'daki "Files changed" listesi sadece o kişinin klasörü olmalı).
4. Sorun yoksa GitHub web sitesinde PR → **Merge pull request**. Ekibe "merge edildi, Update from main yapın" deyin.
5. Tüm ekranlar merge edilince **Bölüm 10'daki uçtan uca demo senaryosunu** baştan sona deneyin.

### 8.5. Önerilen zaman planı (~15 saat)
| Saat | İş |
|---|---|
| 0–1 | (Template hazır.) Zeynep iskelet + telefon testi; Öykü eski yerel klasörünü silip yeniden clone'lar (8.1.1). Diğerleri bu sırada kendi bölümünü agent'ıyla okuyup plan çıkarır (kod yok). |
| 1–8 | Herkes **[Zorunlu]** kısmı yapar; Sinem Satın Alma'dan sonra Hakkında'yı yapar; Zeynep gelen PR'ları test eder. |
| 8–10 | Tüm merge'ler + uçtan uca test + hata düzeltme. |
| 10–13 | **[Zaman kalırsa]** listesi (Bölüm 11) + Eylül README. |
| 13–15 | Son test, demo provası, demo ekran kaydı (yedek), sunum. |

### 8.6. Repo herkese açık — dikkat
- Gerçek kişisel bilgi, şifre, API anahtarı, `.env` dosyası **commit'lenmez**.
- Mock verideki isim/adres/sayaç no uydurmadır; öyle kalır.
- Hakkında ve README'deki ekip isimleri herkese açık görünür.

---

## 9. Çalıştırma ve Demo (Vercel'siz)

- **Laptopta:** `npm run dev` → `http://localhost:5173`.
- **Telefonda:**
  1. Laptop ve telefon **aynı Wi-Fi**'a bağlı olsun.
  2. Laptopta: `npm run dev -- --host`
  3. Terminalde `Network: http://192.168.x.x:5173` satırı çıkar → bu adresi telefonun Chrome'unda açın.
  - ⚠️ Windows "Node.js ağ erişimi" izni sorarsa **izin verin**.
  - ⚠️ Telefon adresi açamıyorsa (hackathon Wi-Fi'ı cihazların birbirini görmesini engelliyor olabilir): **telefonun hotspot'unu açın, laptopu ona bağlayın**, komutu yeniden çalıştırın.
- **Yedek:** Laptopta Chrome DevTools mobil görünüm (`F12` → `Ctrl + Shift + M`) + önceden alınmış **demo ekran kaydı**.
- **Opsiyonel:** Vercel veya okulun sunucusu (gerekirse sonra karar verilir).
- **Demodan önce:** Geçmiş ekranından **"Demo verisini sıfırla"**.

---

## 10. Uçtan Uca Demo Senaryosu (Zeynep'in son test listesi)
1. Giriş ekranı → *"Demo abonelik no"* ipucuna dokun → **Giriş Yap**.
2. Ana Sayfa: sayaçta **2,4 ton**, düşük bakiye uyarısı, bekleyen yükleme yok, **olağan dışı tüketim uyarısı (%36)** ve **6 aylık tüketim grafiği**.
3. **Su Satın Al** → 10 ton → toplam 400,00 TL → *Demo kartıyla doldur* → **Ödemeyi Tamamla** → başarı.
4. **NFC ile Sayaca Yükle** → Yüklemeyi Başlat → Sayaca Okut (Simülasyon) → eşleşme → ilerleme → **başarılı, yeni bakiye 12,4 ton**.
5. Ana Sayfa: bakiye 12,4 ton, düşük bakiye uyarısı yok, bekleyen yok.
6. Tekrar **Yükle** sekmesi → *"Yüklenecek bakiye yok"* (**çift yükleme engeli**).
7. **Geçmiş** → yeni satın alma "Sayaca yüklendi", yeni yükleme "Tamamlandı" → satın almaya dokun → **dijital makbuz**.
8. ⓘ → **Hakkında** → SKA bölümü.
9. Tüm ekranlarda "m³" yazmadığını, her yerde "ton" yazdığını kontrol et.
10. *(Zaman kalırsa eklenenler: yanlış sayaç senaryosu, başarısız ödeme.)*

> Sunum akışı (5 dk sunum + 2 dk soru-cevap) ayrıca planlanacak.

---

## 11. [Zaman kalırsa] Listesi (öncelik sırasıyla)
| # | Özellik | Sahip |
|---|---|---|
| 1 | NFC "yanlış sayaç" demo senaryosu | Göksu |
| 2 | Başarısız ödeme test kartı | Sinem |
| 3 | Makbuzu PDF olarak kaydet (`window.print`) | Eylül |
| 4 | Geçmiş filtre sekmeleri | Eylül |
| 5 | BottomNav'da "Yükle" sekmesine bekleyen bakiye rozeti | Zeynep |

---

## 12. Gelecek (hackathon sonrası, şimdi yapılmayacak)
- **Backend:** Servis fonksiyonlarının içi gerçek API çağrılarıyla değiştirilir (örn. Node.js + veritabanı). Ekranlar değişmez.
- **Gerçek NFC:** Android Chrome'daki Web NFC yalnızca HTTPS üzerinde ve NDEF formatındaki etiketlerle çalışır. Gerçek bir sayaca güvenli bakiye yazmak için sayaç üreticisinin protokolü gerekir. Önerilen güvenli yapı: sunucu, `sayaç no + miktar + tek kullanımlık numara`dan oluşan **imzalı bir yükleme kodu** üretir; sayaç imzayı doğrular, kodu bir kez kabul eder ve kullanılmış kodları hafızasında tutar (çift yükleme ve yanlış sayaca yükleme engeli; sayacın internete bağlı olması gerekmez).
- Ek doğrulama (SMS vb.), çoklu abonelik, başka aboneliğe su yükleme, kademeli tarife, tasarruf hedefi, topluluk tasarruf göstergesi, daha gelişmiş grafikler.
