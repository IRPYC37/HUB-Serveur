import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import Card from "../ui/Card";

export default function SystemGraph({ data, title = "Live CPU / RAM" }) {
  return (
    <Card title={title}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis hide />
            <YAxis domain={[0, 100]} stroke="#fff" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px"
              }}
            />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              name="CPU %"
            />
            <Line
              type="monotone"
              dataKey="ram"
              stroke="#818cf8"
              strokeWidth={2}
              dot={false}
              name="RAM %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
