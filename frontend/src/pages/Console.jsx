import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import API_URL from "../config";
import SystemConsole from "../components/console/SystemConsole";

export default function Console() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (loading) return <Loader />;

  if (userRole !== "admin") {
    return (
      <div className="p-8 text-center text-white/50">
        Accès restreint. Seuls les administrateurs peuvent accéder à la console.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Terminaux Multi-Sessions</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card rounded={true}>
          <SystemConsole />
        </Card>
      </div>
    </div>
  );
}