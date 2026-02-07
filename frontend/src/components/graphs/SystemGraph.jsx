import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import Card from "../ui/Card";

export default function SystemGraph({ data = [], title = "Live CPU / RAM / Temp" }) {
  const hasData = useMemo(() => Array.isArray(data) && data.length > 0, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-xs text-white/40 mb-2 font-mono">
            {new Date(payload[0].payload.timestamp).toLocaleTimeString()}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 text-sm font-mono">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white/70 min-w-[40px]">{entry.name}:</span>
              <span className="font-bold text-right" style={{ color: entry.color }}>
                {entry.value}
                {/* Condition pour l'unité selon la donnée */}
                {entry.dataKey === "temp" || entry.dataKey === "temperature" ? "°C" : "%"}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card title={title} rounded={true}>
      <div className="h-64 w-full relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-lg z-10">
            <p className="text-sm text-white/30 animate-pulse">Waiting for realtime data...</p>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hasData ? data : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.05)" 
              vertical={false} 
            />
            <XAxis dataKey="timestamp" hide={true} />
            <YAxis 
              domain={[0, 100]} 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={10}
              tickCount={6}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }}
            />
            
            {/* CPU - Bleu Néon */}
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              name="CPU"
              isAnimationActive={false}
            />
            
            {/* RAM - Indigo */}
            <Line
              type="monotone"
              dataKey="ram"
              stroke="#818cf8"
              strokeWidth={2}
              dot={false}
              name="RAM"
              isAnimationActive={false}
            />

            {/* Température - Vert Émeraude / Orange / Rouge */}
            <Line
              type="monotone"
              dataKey="temp" // Vérifiez si votre hook utilise 'temp' ou 'temperature'
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Temp"
              isAnimationActive={false}
              connectNulls={true} // Évite les trous dans la ligne si le capteur rate une lecture
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}