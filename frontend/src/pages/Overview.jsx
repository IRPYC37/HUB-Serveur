import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Stat from "../components/ui/Stat";
import Gauge from "../components/ui/Gauge";
import useRealtimeSeries from "../hooks/useRealtimeSeries";

export default function Overview() {
  const realtimeData = useRealtimeSeries();
  const latestData = realtimeData[realtimeData.length - 1];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">System Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="CPU Usage">
          <Gauge value={latestData?.cpu || 0} max={100} />
          <Stat label="Current Load" value={latestData?.cpu || 0} unit="%" />
        </Card>

        <Card title="Memory Usage">
          <Gauge value={latestData?.ram || 0} max={100} color="bg-neon-violet" />
          <Stat label="RAM Used" value={latestData?.ram || 0} unit="%" />
        </Card>

        <Card title="Temperature">
          <Gauge 
            value={latestData?.temp || 0} 
            max={100} 
            color={latestData?.temp > 80 ? "bg-red-500" : "bg-green-500"} 
          />
          <Stat 
            label="CPU Temp" 
            value={latestData?.temp || "N/A"} 
            unit={latestData?.temp ? "°C" : ""} 
          />
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        <Card title="System Status">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-white/50">Status</p>
              <p className="text-lg font-semibold text-green-400">● Online</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Uptime</p>
              <p className="text-lg font-semibold">24h 35m</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Load Avg</p>
              <p className="text-lg font-semibold">{latestData?.cpu || 0}%</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Connected</p>
              <p className="text-lg font-semibold text-neon-blue">WebSocket</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
