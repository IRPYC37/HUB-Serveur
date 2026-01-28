import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Stat from "../components/ui/Stat";
import Gauge from "../components/ui/Gauge";
import SystemGraph from "../components/graphs/SystemGraph";
import useRealtimeSeries from "../hooks/useRealtimeSeries";
import Loader from "../components/ui/Loader";
import API_URL from "../config";

export default function Advanced() {
  const [advancedData, setAdvancedData] = useState(null);
  const realtimeData = useRealtimeSeries(60); // 60 points

  useEffect(() => {
    const fetchAdvanced = async () => {
      try {
        const response = await fetch(`${API_URL}/api/advanced`);
        const json = await response.json();
        setAdvancedData(json);
      } catch (error) {
        console.error("Failed to fetch advanced data:", error);
      }
    };

    fetchAdvanced();
    const interval = setInterval(fetchAdvanced, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!advancedData) return <Loader />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Advanced Monitoring</h1>

      <div className="mb-6">
        <SystemGraph data={realtimeData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="CPU Detailed">
          <div className="space-y-4">
            <div>
              <Gauge value={advancedData.cpu.load} max={100} />
              <Stat label="Total Load" value={advancedData.cpu.load} unit="%" />
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/50">User</span>
                <span>{advancedData.cpu.user}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">System</span>
                <span>{advancedData.cpu.system}%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Temperature">
          <div className="space-y-4">
            <Gauge
              value={advancedData.temperature || 0}
              max={100}
              color={
                advancedData.temperature > 80
                  ? "bg-red-500"
                  : advancedData.temperature > 60
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }
            />
            <Stat
              label="CPU Temperature"
              value={advancedData.temperature ?? "N/A"}
              unit={advancedData.temperature ? "°C" : ""}
            />
            {!advancedData.temperature && (
              <p className="text-xs text-white/40 mt-2">
                Temperature monitoring not available on this system
              </p>
            )}
          </div>
        </Card>

        <Card title="Disk I/O">
          <div className="space-y-4">
            <Stat label="Read" value={advancedData.io.read} unit="MB/s" />
            <div className="pt-4 border-t border-white/10">
              <Stat label="Write" value={advancedData.io.write} unit="MB/s" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Performance Metrics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 mb-1">CPU Load</p>
              <p className="text-2xl font-bold text-neon-blue">{advancedData.cpu.load}%</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 mb-1">User Time</p>
              <p className="text-2xl font-bold text-neon-violet">{advancedData.cpu.user}%</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 mb-1">System Time</p>
              <p className="text-2xl font-bold text-yellow-400">{advancedData.cpu.system}%</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-white/50 mb-1">I/O Total</p>
              <p className="text-2xl font-bold text-green-400">
                {(parseFloat(advancedData.io.read) + parseFloat(advancedData.io.write)).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
