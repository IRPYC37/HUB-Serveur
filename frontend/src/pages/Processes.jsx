import { useEffect, useState, useMemo } from "react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import API_URL from "../config";

export default function Processes() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'cpu', direction: 'desc' });

  const userRole = localStorage.getItem("role"); 
  const token = localStorage.getItem("token");

  const fetchProcesses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/processes`);
      const json = await response.json();
      setProcesses(json.filter(p => p.pid !== 0));
    } catch (error) {
      console.error("Failed to fetch processes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedProcesses = useMemo(() => {
    let result = [...processes];
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.pid.toString().includes(searchTerm)
      );
    }
    result.sort((a, b) => {
      const aValue = sortConfig.key === 'name' ? a[sortConfig.key] : parseFloat(a[sortConfig.key]);
      const bValue = sortConfig.key === 'name' ? b[sortConfig.key] : parseFloat(b[sortConfig.key]);
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [processes, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleKillProcess = async (pid, name) => {
    if (!window.confirm(`Terminer ${name} (PID: ${pid}) ?`)) return;
    setActionLoading(pid);
    try {
      const response = await fetch(`${API_URL}/api/processes/kill/${pid}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) fetchProcesses();
    } catch (error) {
      alert("Erreur réseau.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 space-y-6">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Forcer l'alignement et la gestion du texte long */
        .truncate-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Gestionnaire de processus</h1>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/30 group-focus-within:text-neon-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Rechercher..."
            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg focus:ring-1 focus:ring-neon-blue focus:border-neon-blue block w-full md:w-80 pl-10 p-2.5 outline-none backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card title={`${filteredAndSortedProcesses.length} processus`}>
        <div className="overflow-y-auto max-h-[400px] no-scrollbar">
          {/* table-layout: fixed est la clé pour l'alignement strict */}
          <table className="w-full text-sm border-separate border-spacing-0 table-fixed">
            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
              <tr className="text-left">
                <th onClick={() => requestSort('pid')} className="w-[15%] py-3 px-3 text-white/50 border-b border-white/10 cursor-pointer hover:text-white transition-colors">
                  PID {sortConfig.key === 'pid' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('name')} className="w-[50%] py-3 px-2 text-white/50 border-b border-white/10 cursor-pointer hover:text-white transition-colors">
                  NOM {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('cpu')} className="w-[15%] py-3 px-2 text-right text-white/50 border-b border-white/10 cursor-pointer hover:text-white transition-colors">
                  CPU {sortConfig.key === 'cpu' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                {userRole === "admin" && (
                  <th className="w-[20%] py-3 px-3 text-right text-white/50 border-b border-white/10">ACTION</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProcesses.map((process) => (
                <tr key={process.pid} className="border-b border-white/5 hover:bg-white/5 group">
                  <td className="py-4 px-3 font-mono text-white/40">{process.pid}</td>
                  <td className="py-4 px-2 font-medium text-white truncate-cell" title={process.name}>
                    {process.name}
                  </td>
                  <td className="py-4 px-2 text-right font-mono text-neon-blue">{process.cpu}%</td>
                  {userRole === "admin" && (
                    <td className="py-4 px-3 text-right">
                      <button 
                        disabled={actionLoading === process.pid}
                        onClick={() => handleKillProcess(process.pid, process.name)}
                        className={`px-3 py-1 rounded text-xs transition-all border ${
                          actionLoading === process.pid 
                            ? "bg-gray-500 opacity-50" 
                            : "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white"
                        }`}
                      >
                        {actionLoading === process.pid ? "..." : "Arrêter"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}