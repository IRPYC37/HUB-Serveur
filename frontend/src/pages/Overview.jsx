import { useMemo } from "react";
import Card from "../components/ui/Card";
import Stat from "../components/ui/Stat";
import Gauge from "../components/ui/Gauge";
import useRealtimeSeries from "../hooks/useRealtimeSeries";

export default function Overview() {
  // On récupère l'historique (par défaut 60 points via le hook)
  const realtimeData = useRealtimeSeries(60);
  
  // On récupère le dernier point reçu
  const latestData = realtimeData[realtimeData.length - 1];

  /**
   * Calcul de la moyenne glissante du CPU
   * Cela permet de différencier le "Current Load" (instantané)
   * du "Load Avg" (moyenne sur la durée des points stockés)
   */
  const cpuAverage = useMemo(() => {
    if (!realtimeData || realtimeData.length === 0) return "0.0";
    
    const sum = realtimeData.reduce((acc, curr) => {
      // Sécurité : s'assurer que curr.cpu est un nombre
      const val = parseFloat(curr.cpu);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    
    return (sum / realtimeData.length).toFixed(1);
  }, [realtimeData]);

  // Déterminer la couleur de la température dynamiquement
  const getTempColor = (temp) => {
    if (!temp) return "bg-green-500";
    if (temp > 75) return "bg-red-500";
    if (temp > 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 text-white">System Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CPU Usage Card */}
        <Card title="Utilisation CPU">
          <div className="flex flex-col items-center">
            <Gauge value={latestData?.cpu || 0} max={100} color="bg-neon-blue" />
            <Stat 
              label="Charge CPU" 
              value={latestData?.cpu || "0.0"} 
              unit="%" 
            />
          </div>
        </Card>

        {/* Memory Usage Card */}
        <Card title="Utilisation RAM">
          <div className="flex flex-col items-center">
            <Gauge value={latestData?.ram || 0} max={100} color="bg-neon-violet" />
            <Stat 
              label="RAM Utilisation" 
              value={latestData?.ram || "0.0"} 
              unit="%" 
            />
          </div>
        </Card>

        {/* Temperature Card */}
        <Card title="Température CPU">
          <div className="flex flex-col items-center">
            <Gauge 
              value={latestData?.temp || 0} 
              max={100} 
              color={getTempColor(latestData?.temp)} 
            />
            <Stat 
              label="CPU Temp" 
              value={latestData?.temp || "N/A"} 
              unit={latestData?.temp ? "°C" : ""} 
            />
          </div>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        <Card title="Divers">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div>
              <p className="text-xs text-white/50 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-lg font-semibold text-green-400 font-mono tracking-tight">En ligne</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-white/50 mb-1">En ligne depuis</p>
              <p className="text-lg font-semibold text-white">24h 35m</p>
            </div>

            <div>
              <p className="text-xs text-white/50 mb-1">Charge CPU Moyenne (60s)</p>
              {/* On utilise ici la moyenne calculée cpuAverage */}
              <p className="text-lg font-semibold text-neon-blue font-mono">
                {cpuAverage}%
              </p>
            </div>

            <div>
              <p className="text-xs text-white/50 mb-1">Source</p>
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-4 h-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-lg font-semibold">WebSocket</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}