import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";

export default function Docker() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocker = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/docker");
        const json = await response.json();
        setContainers(json);
      } catch (error) {
        console.error("Failed to fetch docker data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocker();
    const interval = setInterval(fetchDocker, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  const runningContainers = containers.filter((c) => c.state === "running");
  const stoppedContainers = containers.filter((c) => c.state !== "running");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Docker Containers</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <p className="text-xs text-white/50 mb-2">Total Containers</p>
          <p className="text-3xl font-bold">{containers.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-white/50 mb-2">Running</p>
          <p className="text-3xl font-bold text-green-400">{runningContainers.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-white/50 mb-2">Stopped</p>
          <p className="text-3xl font-bold text-red-400">{stoppedContainers.length}</p>
        </Card>
      </div>

      {containers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-white/40 mb-2">No Docker containers found</p>
            <p className="text-xs text-white/30">
              Make sure Docker is installed and running on your system
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {containers.map((container) => (
            <Card key={container.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{container.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        container.state === "running"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {container.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-white/50 text-xs">Image</p>
                      <p className="font-medium">{container.image}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Created</p>
                      <p className="font-medium">{container.created || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">Ports</p>
                      <p className="font-medium">
                        {container.ports?.length > 0 ? container.ports.join(", ") : "None"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">ID</p>
                      <p className="font-medium text-xs">{container.id.substring(0, 12)}</p>
                    </div>
                  </div>
                </div>

                {/* Placeholder for future actions */}
                {/* <div className="ml-4">
                  <button className="px-3 py-1 bg-white/10 rounded text-xs">
                    Actions
                  </button>
                </div> */}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
