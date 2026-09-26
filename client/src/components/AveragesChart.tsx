import {
  CartesianGrid,
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

const axisTick = { fill: "#64748b", fontSize: 12 };

export function AveragesChart({ rows }: AveragesChartProps) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            minTickGap={24}
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: "#cbd5e1" }}
            tickMargin={8}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={64}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
              fontSize: 13,
            }}
            labelStyle={{ color: "#0f172a", fontWeight: 600, marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="lowAverage"
            name="Low Avg"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="highAverage"
            name="High Avg"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
