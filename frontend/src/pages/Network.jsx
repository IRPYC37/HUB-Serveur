import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import API_URL from "../config";

export default function Network() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const response = await fetch(`${API_URL}/api/network`);
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
  const waitingPorts = connections.filter((c) => c.state === "TIME_WAIT");

  return (
    <div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Forcer l'alignement et la gestion du texte long */
        .truncate-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <h1 className="text-3xl font-bold mb-8">Connections Réseau</h1>
        <div></div>
        <Card>
          <p className="text-xs text-white/50 mb-2">Connections Total</p>
          <p className="text-3xl font-bold">{connections.length}</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <p className="text-xs text-white/50 mb-2">Connections Actives</p>
          <p className="text-3xl font-bold text-green-400">{activeConnections.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-white/50 mb-2">Ports en écoute</p>
          <p className="text-3xl font-bold text-neon-blue">{listeningPorts.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-white/50 mb-2">Ports en attente</p>
          <p className="text-3xl font-bold text-orange-300">{waitingPorts.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="space-y-2 max-h-96 overflow-y-auto max-h-[320px] no-scrollbar">
            {activeConnections.map((conn, i) => (
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
                  <p>À Distance: {conn.peerAddress}:{conn.peerPort}</p>
                </div>
              </div>
            ))}
            {activeConnections.length === 0 && (
              <p className="text-white/40 text-center py-8">Aucune connection active</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-2 max-h-96 overflow-y-auto max-h-[320px] no-scrollbar">
            {listeningPorts.map((conn, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{conn.protocol}</span>
                  <span className="text-xs text-neon-blue">{conn.state}</span>
                </div>
                <div className="text-xs text-white/60">
                  <p>Adresse: {conn.localAddress}:{conn.localPort}</p>
                  {conn.process && <p>Processus: {conn.process}</p>}
                </div>
              </div>
            ))}
            {listeningPorts.length === 0 && (
              <p className="text-white/40 text-center py-8">Aucun port en écoute</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-2 max-h-96 overflow-y-auto max-h-[320px] no-scrollbar">
            {waitingPorts.map((conn, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{conn.protocol}</span>
                  <span className="text-xs text-orange-300">{conn.state}</span>
                </div>
                <div className="text-xs text-white/60">
                  <p>Adresse: {conn.localAddress}:{conn.localPort}</p>
                  {conn.process && <p>Processus: {conn.process}</p>}
                </div>
              </div>
            ))}
            {listeningPorts.length === 0 && (
              <p className="text-white/40 text-center py-8">Aucun port en attente</p>
            )}
          </div>
        </Card>


      </div>
    </div>
  );
}
