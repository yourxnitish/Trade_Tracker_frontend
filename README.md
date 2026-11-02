# Trade Tracker - Frontend

A clean, responsive Trading Journal web application inspired by classic paper trading logs (Profit Pages style).

---

## 🚀 Features

- **Paper Journal Style**: Date, Day, Starting Balance, Closed P/L, Total Brokerage, Closing Balance.
- **Dynamic Calculation**: Auto-computes individual trade P/L from Buy, Sell, and Qty, with color-coded profit/loss styling.
- **Summary Metrics**: Real-time breakdown of overall profit vs. loss.
- **Trader Reflections**:
  - Watchlist for upcoming sessions
  - Market Movements & Technical observations
  - Mistakes analysis
  - Risk / Reward ratio notes
  - Daily Notes & Lessons
- **Calendar & Navigation**: Step forward/back between days, pick any date, or view full history drawer.
- **Demo Mode**: 1-click **⚡ Try Demo Account** button pre-configured with realistic trades.
- **Print / PDF**: Clean print styles to export paper journal sheets or save to PDF.

---

## 💻 Local Usage

Just open `index.html` in your browser, or run a local server:

```bash
npx serve .
# or
npm start
```

### Configuring Backend API

By default, the frontend connects to:
- `http://localhost:3001` (if running locally or served from the backend)
- Or your deployed backend URL.

To connect to a deployed backend (e.g. Render):
1. Open the site in your browser.
2. In the URL, pass `?api=https://your-backend.onrender.com`
3. Or open DevTools Console (`F12`) and run:
   ```javascript
   setApiUrl('https://your-backend.onrender.com');
   ```

---

## 🌐 Deploy to Vercel

1. Import this repository to [Vercel](https://vercel.com).
2. Framework Preset: **Other** (Static).
3. Root Directory: `./`
4. Deploy!

---

## 🔗 Related

- **Backend Repository:** [Trade_Tracker_backend](https://github.com/yourxnitish/Trade_Tracker_backend)
