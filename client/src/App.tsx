import { AveragesChart } from "./components/AveragesChart";
import { DailyTable } from "./components/DailyTable";
import { SearchBar } from "./components/SearchBar";
import { StatusMessage } from "./components/StatusMessage";
import { useDailyStock } from "./hooks/useDailyStock";

export function App() {
  const { status, data, error, search } = useDailyStock();
  const rows = status === "success" && data && data.length > 0 ? data : null;

  function handleSearch(symbol: string) {
    void search(symbol).catch(() => {
      // StatusMessage renders the error stored by the hook.
    });
  }

  return (
    <main>
      <h1>Stock intraday viewer</h1>
      <SearchBar loading={status === "loading"} onSearch={handleSearch} />
      <StatusMessage status={status} error={error} isEmpty={status === "success" && data?.length === 0} />
      {rows ? (
        <>
          <h2>Daily averages</h2>
          <DailyTable rows={rows} />
          <h2>Averages</h2>
          <AveragesChart rows={rows} />
        </>
      ) : null}
    </main>
  );
}
