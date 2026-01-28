import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Card from "../components/ui/Card";
import API_URL from "../config";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        auth.login(data.token, data.role, data.username);
        navigate("/");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neon-blue mb-2">NEXUS HUB</h1>
          <p className="text-white/50">System Monitor</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Username</label>
              <input
                name="username"
                type="text"
                className="input-field"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Password</label>
              <input
                name="password"
                type="password"
                className="input-field"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-white/5 rounded-lg text-xs text-white/60">
            <p className="font-semibold mb-2">Default credentials:</p>
            <p>Admin: <span className="text-neon-blue">admin / admin123</span></p>
            <p>Viewer: <span className="text-neon-blue">viewer / viewer123</span></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
