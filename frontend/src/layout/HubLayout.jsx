import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/", label: "Overview", icon: "📊" },
  { to: "/system", label: "System", icon: "💻" },
  { to: "/advanced", label: "Advanced", icon: "📈" },
  { to: "/processes", label: "Processes", icon: "⚙️" },
  { to: "/network", label: "Network", icon: "🌐" },
  { to: "/docker", label: "Docker", icon: "🐳" },
];

export default function HubLayout({ children }) {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-black/40 backdrop-blur p-6 border-r border-white/5">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-neon-blue">NEXUS HUB</h1>
          <p className="text-xs text-white/50 mt-1">System Monitor</p>
        </div>

        <nav className="space-y-2 mb-10">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 ${
                  isActive
                    ? "bg-white/10 text-neon-blue shadow-soft"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/5 rounded-lg p-4 mb-3">
            <p className="text-xs text-white/50">Logged in as</p>
            <p className="text-sm font-medium">{auth.username}</p>
            <p className="text-xs text-neon-blue">{auth.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
}
