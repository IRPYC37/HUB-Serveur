import express from "express";
import cors from "cors";
import si from "systeminformation";
import { WebSocketServer } from "ws";
import { users } from "./auth/users.js";
import { generateToken, authMiddleware, requireRole } from "./auth/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

// ============ AUTH ============
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Simple password check (in production, use bcrypt.compare)
  const passwordMatch = password === "admin123" && user.role === "admin" ||
                        password === "viewer123" && user.role === "viewer";
  
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    token: generateToken(user),
    role: user.role,
    username: user.username
  });
});

// ============ SYSTEM STATS ============
app.get("/api/system", async (_, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const disks = await si.fsSize();

    res.json({
      cpu: cpu.currentLoad.toFixed(1),
      ram: ((mem.used / mem.total) * 100).toFixed(1),
      disks: disks.map(d => ({
        fs: d.fs,
        mount: d.mount,
        use: d.use.toFixed(1),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADVANCED MONITORING ============
app.get("/api/advanced", async (_, res) => {
  try {
    const cpuLoad = await si.currentLoad();
    const cpuTemp = await si.cpuTemperature();
    const disksIO = await si.disksIO();

    res.json({
      cpu: {
        load: cpuLoad.currentLoad.toFixed(1),
        user: cpuLoad.currentLoadUser.toFixed(1),
        system: cpuLoad.currentLoadSystem.toFixed(1),
      },
      temperature: cpuTemp.main ?? null,
      io: {
        read: (disksIO.rIO / 1024 / 1024).toFixed(2),
        write: (disksIO.wIO / 1024 / 1024).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROCESSES ============
app.get("/api/processes", async (_, res) => {
  try {
    const data = await si.processes();
    res.json(
      data.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 25)
        .map(p => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu.toFixed(1),
          mem: p.mem.toFixed(1),
        }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ NETWORK ============
app.get("/api/network", async (_, res) => {
  try {
    const connections = await si.networkConnections();
    res.json(connections.slice(0, 50));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DOCKER ============
app.get("/api/docker", async (_, res) => {
  try {
    const containers = await si.dockerContainers();
    res.json(containers);
  } catch {
    res.json([]);
  }
});

// Protected route example
app.post("/api/docker/:id/start", authMiddleware, requireRole("admin"), async (req, res) => {
  res.json({ message: "Container start not implemented yet" });
});

// ============ SERVER ============
const server = app.listen(3001, () => {
  console.log("\n🚀 Nexus Hub Backend running on http://localhost:3001");
  console.log("\n👤 Default credentials:");
  console.log("   Admin: admin / admin123");
  console.log("   Viewer: viewer / viewer123\n");
});

// ============ WEBSOCKET ============
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("✓ WebSocket client connected");

  const interval = setInterval(async () => {
    try {
      const cpu = await si.currentLoad();
      const mem = await si.mem();
      const cpuTemp = await si.cpuTemperature();

      ws.send(JSON.stringify({
        cpu: cpu.currentLoad.toFixed(1),
        ram: ((mem.used / mem.total) * 100).toFixed(1),
        temp: cpuTemp.main ?? null,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error("WebSocket error:", error);
    }
  }, 1000);

  ws.on("close", () => {
    clearInterval(interval);
    console.log("✗ WebSocket client disconnected");
  });
});
