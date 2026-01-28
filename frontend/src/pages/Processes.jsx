import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import API_URL from "../config";

export default function Processes() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/processes`);
        const json = await response.json();
        setProcesses(json);
      } catch (error) {
        console.error("Failed to fetch processes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
    const interval = setInterval(fetchProcesses, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Active Processes</h1>

      <Card title={`Top ${processes.length} Processes by CPU Usage`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-white/50 font-medium">PID</th>
                <th className="text-left py-3 px-2 text-white/50 font-medium">Name</th>
                <th className="text-right py-3 px-2 text-white/50 font-medium">CPU %</th>
                <th className="text-right py-3 px-2 text-white/50 font-medium">Memory %</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr
                  key={process.pid}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-2 text-white/60">{process.pid}</td>
                  <td className="py-3 px-2 font-medium">{process.name}</td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`font-semibold ${
                        parseFloat(process.cpu) > 50
                          ? "text-red-400"
                          : parseFloat(process.cpu) > 20
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {process.cpu}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-white/60">
                    {process.mem}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-xs text-white/50 mb-2">Total Processes</p>
          <p className="text-3xl font-bold">{processes.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-white/50 mb-2">High CPU (&gt;20%)</p>
          <p className="text-3xl font-bold text-yellow-400">
            {processes.filter((p) => parseFloat(p.cpu) > 20).length}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-white/50 mb-2">Critical (&gt;50%)</p>
          <p className="text-3xl font-bold text-red-400">
            {processes.filter((p) => parseFloat(p.cpu) > 50).length}
          </p>
        </Card>
      </div>
    </div>
  );
}
