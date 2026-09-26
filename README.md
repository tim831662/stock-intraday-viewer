# Stock intraday viewer

A local full-stack app that loads about a month of 15-minute Yahoo Finance candles for a symbol and shows them grouped by exchange-local day. Each day has the average low, average high, and total volume.

The repo is an npm workspace with two apps:

- `server` — Express API on port 3001
- `client` — React app. In dev it is on port 5173 and proxies `/api` to the server

## Prerequisites

- Node.js 20 or newer (this project was run on Node.js 22)
- npm
- Outbound network access to Yahoo Finance

## Setup

From the repository root:

```powershell
npm install
```

That installs dependencies for the root workspace, the server, and the client.

## Run both apps

```powershell
npm run dev
```

This starts the API and the UI together.

- UI: http://localhost:5173/
- API: http://localhost:3001

Open the UI, enter a symbol such as `AAPL`, and search. The page calls `GET /api/stocks/:symbol/daily` through the Vite proxy, so the browser does not talk to Yahoo directly.

You can also call the API yourself. In PowerShell, use `curl.exe` so the request is not aliased to `Invoke-WebRequest`:

```powershell
curl.exe http://localhost:3001/api/health
curl.exe http://localhost:3001/api/stocks/AAPL/daily
```

`/api/health` returns `{ "status": "ok" }`. A symbol search returns a JSON array of `{ "day", "lowAverage", "highAverage", "volume" }`, oldest day first.

If startup fails with `EADDRINUSE` on port 3001, stop the process already using that port and run `npm run dev` again.

## Build

```powershell
npm run build
```

This compiles the server to `server/dist` and the client to `client/dist`.

## Run the built apps

Stop any dev server still bound to port 3001, then start the built API from the repository root:

```powershell
node server/dist/index.js
```

In a second terminal, serve the built UI:

```powershell
npm run preview -w client
```

- Built UI: http://localhost:4173/
- Built API: http://localhost:3001

The preview server proxies `/api` to port 3001, same as dev. Search from the UI the same way.

## Tests

Server unit tests:

```powershell
npm test
```

Optional live Yahoo check:

```powershell
npx tsx server/scripts/yahoo-smoke.ts AAPL
```

## Configuration

The server reads these environment variables. Defaults are shown.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | API port |
| `YAHOO_BASE_URL` | `https://query1.finance.yahoo.com` | Yahoo chart host |
| `YAHOO_TIMEOUT_MS` | `8000` | Yahoo request timeout |

The dev and preview UIs always proxy to `http://localhost:3001`. If you change `PORT`, update `client/vite.config.ts` to match.
