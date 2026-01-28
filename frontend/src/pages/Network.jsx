import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";

export default function Network() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/network");
        const json = await response.json();
        setConnections(json);
      } catch (error) {
        console.error("Failed to fetch network data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetwork();
    const interval = setInterval(fetchNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  const activeConnections = connections.filter((c) => c.state === "ESTABLISHED");
  const listeningPorts = connections.filter((c) => c.state === "LISTEN");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Network Connections</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <p className="text-xs text-white/50 mb-2">Total Connections</p>
          <p className="text-3xl font-bold">{connections.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-white/50 mb-2">Established</p>
          <p className="text-3xl font-bold text-green-400">{activeConnections.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-white/50 mb-2">Listening Ports</p>
          <p className="text-3xl font-bold text-neon-blue">{listeningPorts.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Active Connections">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeConnections.slice(0, 20).map((conn, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{conn.protocol}</span>
                  <span className="text-xs text-green-400">{conn.state}</span>
                </div>
                <div className="text-xs text-white/60">
                  <p>Local: {conn.localAddress}:{conn.localPort}</p>
                  <p>Remote: {conn.peerAddress}:{conn.peerPort}</p>
                </div>
              </div>
            ))}
            {activeConnections.length === 0 && (
              <p className="text-white/40 text-center py-8">No active connections</p>
            )}
          </div>
        </Card>

        <Card title="Listening Ports">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {listeningPorts.slice(0, 20).map((conn, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{conn.protocol}</span>
                  <span className="text-xs text-neon-blue">{conn.state}</span>
                </div>
                <div className="text-xs text-white/60">
                  <p>Address: {conn.localAddress}:{conn.localPort}</p>
                  {conn.process && <p>Process: {conn.process}</p>}
                </div>
              </div>
            ))}
            {listeningPorts.length === 0 && (
              <p className="text-white/40 text-center py-8">No listening ports</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
