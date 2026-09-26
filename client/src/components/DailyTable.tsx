import type { DailySummary } from "../api/stocks";

interface DailyTableProps {
  rows: DailySummary[];
}

const volumeFormat = new Intl.NumberFormat("en-US");

export function DailyTable({ rows }: DailyTableProps) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Low Avg</th>
            <th scope="col">High Avg</th>
            <th scope="col">Volume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.day}>
              <td>{row.day}</td>
              <td>{row.lowAverage}</td>
              <td>{row.highAverage}</td>
              <td>{volumeFormat.format(row.volume)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
