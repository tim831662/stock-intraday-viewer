import { useDailyStock } from "./hooks/useDailyStock";

export function App() {
  const { status, data, error, search } = useDailyStock();

  async function loadSample() {
    try {
      const daily = await search("AAPL");
      console.log(daily);
    } catch (loadError) {
      console.error(loadError);
    }
  }

  return (
    <main>
      <h1>Stock intraday viewer</h1>
      <button type="button" onClick={loadSample} disabled={status === "loading"}>
        Load AAPL
      </button>
      <p>Status: {status}</p>
      {status === "success" && data ? <p>Loaded {data.length} days</p> : null}
      {status === "error" && error ? <p>{error}</p> : null}
    </main>
  );
}
