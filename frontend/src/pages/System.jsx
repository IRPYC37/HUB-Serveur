import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import API_URL from "../config";

export default function System() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/system`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch system data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">System Information</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="CPU">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/50">Current Load</p>
              <p className="text-2xl font-bold">{data?.cpu}%</p>
            </div>
          </div>
        </Card>

        <Card title="Memory">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/50">RAM Usage</p>
              <p className="text-2xl font-bold">{data?.ram}%</p>
            </div>
          </div>
        </Card>

        <Card title="Storage" className="md:col-span-2">
          <div className="space-y-3">
            {data?.disks?.map((disk, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{disk.fs}</p>
                  <p className="text-xs text-white/50">{disk.mount}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{disk.use}%</p>
                  <p className="text-xs text-white/50">used</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
