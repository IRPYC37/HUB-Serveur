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
  const [error, setError] = useState(null);
  const realtimeData = useRealtimeSeries(60);
  console.log(realtimeData);
  useEffect(() => {
    const controller = new AbortController();

    const fetchAdvanced = async () => {
      try {
        const response = await fetch(`${API_URL}/api/advanced`, { 
          signal: controller.signal 
        });
        
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        
        const json = await response.json();
        setAdvancedData(json);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch advanced data:", err);
          setError(err.message);
        }
      }
    };

    fetchAdvanced();
    const interval = setInterval(fetchAdvanced, 2000);

    return () => {
      clearInterval(interval);
      controller.abort(); // Annule la requête si l'utilisateur quitte la page
    };
  }, []);

  if (error && !advancedData) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-mono">⚠️ Error: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm underline">Retry</button>
      </div>
    );
  }

  if (!advancedData) return <Loader />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Advanced Monitoring</h1>

      <div className="mb-6">
        <SystemGraph data={realtimeData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Detailed */}
        <Card title="CPU Detailed">
          <div className="space-y-4">
            <div>
              <Gauge value={advancedData?.cpu?.load || 0} max={100} />
              <Stat label="Total Load" value={advancedData?.cpu?.load || '0.0'} unit="%" />
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/50">User</span>
                <span>{advancedData?.cpu?.user ?? '0.0'}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">System</span>
                <span>{advancedData?.cpu?.system ?? '0.0'}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Temperature */}
        <Card title="Temperature">
          <div className="space-y-4">
            <Gauge
              value={advancedData?.temperature || 0}
              max={100}
              color={
                advancedData?.temperature > 80 ? "bg-red-500" : 
                advancedData?.temperature > 60 ? "bg-yellow-500" : "bg-green-500"
              }
            />
            <Stat
              label="CPU Temperature"
              value={advancedData?.temperature ?? "N/A"}
              unit={advancedData?.temperature ? "°C" : ""}
            />
            {!advancedData?.temperature && (
              <p className="text-xs text-white/40 mt-2">
                Temperature monitoring not available
              </p>
            )}
          </div>
        </Card>



        {/* Disk I/O */}
        <Card title="Disk I/O">
          <div className="space-y-4">
            <Stat label="Read" value={advancedData?.io?.read || '0.00'} unit="MB/s" />
            <div className="pt-4 border-t border-white/10">
              <Stat label="Write" value={advancedData?.io?.write || '0.00'} unit="MB/s" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics Summary */}
      <div className="mt-6">
        <Card title="Performance Metrics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBox label="CPU Load" value={`${advancedData?.cpu?.load || 0}%`} color="text-neon-blue" />
            <MetricBox label="User Time" value={`${advancedData?.cpu?.user || 0}%`} color="text-neon-violet" />
            <MetricBox label="System Time" value={`${advancedData?.cpu?.system || 0}%`} color="text-yellow-400" />
            <MetricBox 
              label="I/O Total" 
              value={`${(parseFloat(advancedData?.io?.read || 0) + parseFloat(advancedData?.io?.write || 0)).toFixed(2)} MB/s`} 
              color="text-green-400" 
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// Petit composant interne pour éviter la répétition
function MetricBox({ label, value, color }) {
  return (
    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}