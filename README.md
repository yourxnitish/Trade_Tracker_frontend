# TradeTrack Frontend – Personal Trading Journal

A modern, responsive financial web application built with **React, Vite, and Tailwind CSS** designed to digitalize physical trading journal notebooks into a high-performance analytics dashboard.

## Features

- **Dashboard**: Real-time account balance tracking, realized P/L, win rate %, profit factor, daily P/L bars, cumulative curve, monthly distribution, and top performing instruments.
- **Add / Edit Trade**: Live gross/net P/L preview, automatic risk/reward calculation, support for long/short, open/closed trades, and qualitative reflection fields.
- **Trade History**: Searchable, filterable table by date, outcome (Win/Loss/BE), status, instrument, and strategy. Sortable columns, pagination, CSV data export, and printable reports.
- **Daily Journal**: 
  - **Modern View**: Comprehensive session cards, day-by-day navigation, and automated sync with trades executed on that date.
  - **Physical Notebook Replica**: Interactive digital facsimile of the classic spiral notebook layout from your physical trading journal, with print and PDF capabilities.
- **Watchlist**: Track candidate setups with planned entry, target, and stop loss. One-click "Convert to Trade" pre-populates the trade entry form.
- **Performance Analytics**: Calendar heatmap, streak metrics, long vs. short breakdown, strategy rankings, and cumulative equity curve.
- **Notes & Observations**: Categorized notes for market observations, psychology, mistakes, and strategy rules.
- **Settings**: Baseline capital balance, customizable currency symbol (₹, $, €, £), deposit and withdrawal management, and database backup guides.

## Technology Stack

- **React 18** with **Vite**
- **Tailwind CSS** for styling
- **React Router v6** for client-side navigation
- **Recharts** for interactive financial charts
- **Lucide React** for icons
- **Axios** for API requests

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file based on `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```
*(In local development, the built-in Vite proxy forwards `/api` directly to `http://localhost:8080`)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates production-optimized static files in `dist/`.

## Deployment to Vercel

1. Push the `trading-journal-frontend` folder to a GitHub repository.
2. In the Vercel dashboard, click **Add New Project** and import the repository.
3. In **Build and Output Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed Spring Boot backend (e.g., `https://tradetrack-backend.onrender.com/api`).
5. Click **Deploy**.
