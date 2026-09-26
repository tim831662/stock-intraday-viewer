import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailySummary } from "../api/stocks";

interface AveragesChartProps {
  rows: DailySummary[];
}

export function AveragesChart({ rows }: AveragesChartProps) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" minTickGap={24} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="lowAverage" name="Low Avg" stroke="#2563eb" dot={false} />
          <Line type="monotone" dataKey="highAverage" name="High Avg" stroke="#dc2626" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
