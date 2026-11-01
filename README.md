# SmartWater

SmartWater is a web-based prototype designed to modernize Cyprus's prepaid water card system. The proposed solution allows residents to purchase water through their phones and transfer it to NFC-enabled smart water meters without visiting physical top-up locations.

The goal is to reduce dependence on physical water cards while making water management more accessible and convenient.

> **Prototype Notice:** Developed for the Sustainable Cyprus Hackathon 2026. Payments and NFC transfers are simulated, and all account and consumption data is fictional.

The application interface is in Turkish.

## Features

- **Subscription Login:** Access the demo using a subscription number.
- **Home Dashboard:** View meter balance, pending water loads, low-balance warnings, last successful loading, monthly consumption charts, and unusual consumption alerts.
- **Water Purchase:** Choose preset amounts or enter a custom amount between 1 and 100 tons. View calculated prices and complete simulated card payments.
- **NFC Meter Loading Simulation:** Follow a step-by-step loading process with a progress indicator, double-loading protection, and an optional wrong-meter simulation.
- **Transaction History:** Review transactions using "Tümü" (All), "Satın alma" (Purchase), and "Yükleme" (Loading) filters. View digital receipts and save them as PDF.
- **Account Management:** View subscription information, log out, and reset demo data.
- **About:** Learn about the project, its proposed workflow, and its connection to the Sustainable Development Goals.

## Tech Stack

- React (JavaScript / JSX)
- Vite
- React Router (`HashRouter`)
- CSS
- Browser `localStorage`

The current prototype does not require a backend or database. Application data is stored locally in the browser.

## Getting Started

### Requirements

Node.js 20.19+ (20.x), 22.13+ (22.x), or 24+, and npm.

### Installation

Run the following commands from the project directory:

```bash
npm install
npm run dev
```

Open the local address displayed in the terminal.

To access the application from a phone connected to the same network:

```bash
npm run dev -- --host
```

### Build

```bash
npm run build
```

## Demo Usage

**Demo subscription number:** `SW-100245`

Follow this workflow:

1. **Login:** Enter the demo subscription number and select "Giriş Yap" (Sign In).
2. **Purchase Water:** Open "Satın Al" (Purchase), select 10 tons, and use "Demo kartıyla doldur" (Fill with Demo Card).
3. **Complete Payment:** Confirm the simulated payment. The purchased amount is added to the pending balance.
4. **Load to Meter:** Open "Yükle" (Load) and complete the simulated NFC loading process.
5. **Transaction History:** Open "Geçmiş" (History) to review purchase and loading records, filter transactions, and access digital receipts.
6. **Save Receipt:** Open a purchase receipt and use the "PDF olarak kaydet" (Save as PDF) option.
7. **Reset Demo:** Select "Demo verisini sıfırla" (Reset Demo Data) to restore the initial application state.

All actions are performed using fictional demo data.

## Prototype Limitations

- **Simulated Payments:** No real transactions are processed, and no money is charged.
- **Simulated NFC:** No physical water meter is connected. NFC scanning and loading are simulated.
- **Local Data Storage:** Account information, balances, and transaction records are stored in the browser using `localStorage`.
- **Sample Pricing:** The displayed rate of 40 TL per ton is an example tariff, not an official municipal price.
- **Sample Consumption Data:** Consumption information is fictional and does not represent live meter readings.
- **Prototype Security:** Subscription-based demo login is not production-grade authentication.

The system demonstrates a proposed digital water management workflow rather than a fully deployed municipal service.

## Sustainability

SmartWater aligns with **Sustainable Development Goal 6 (SDG 6): Clean Water and Sanitation**.

The project aims to improve access to water management services, increase awareness of consumption patterns, and demonstrate how digital infrastructure could support more efficient water service delivery.

The prototype does not claim verified reductions in water consumption or environmental impact.

## Development Team

- Eylül Özcan
- Öykü Naz Balseven
- Zeynep Nazlıcan Taşkın
- Bahar Göksu Mardin
- Sinem Birinci