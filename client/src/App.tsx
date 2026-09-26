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
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 17 9 11 13 15 21 7" />
              <polyline points="15 7 21 7 21 13" />
            </svg>
          </div>
          <div>
            <h1 className="app-title">Stock Intraday Viewer</h1>
            <p className="app-subtitle">Daily averages from 15-minute intraday data</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="card card__body" aria-label="Search">
          <SearchBar loading={status === "loading"} onSearch={handleSearch} />
        </section>

        <StatusMessage status={status} error={error} isEmpty={status === "success" && data?.length === 0} />

        {rows ? (
          <>
            <section className="card">
              <div className="card__header">
                <h2 className="card__title">Price averages</h2>
                <span className="card__meta legend">
                  <span>
                    <span className="legend-dot legend-dot--low" />
                    Low avg
                  </span>
                  <span>
                    <span className="legend-dot legend-dot--high" />
                    High avg
                  </span>
                </span>
              </div>
              <div className="card__body">
                <AveragesChart rows={rows} />
              </div>
            </section>

            <section className="card">
              <div className="card__header">
                <h2 className="card__title">Daily averages</h2>
                <span className="card__meta">{rows.length} trading days</span>
              </div>
              <div className="card__body card__body--flush">
                <DailyTable rows={rows} />
              </div>
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}
