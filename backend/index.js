import express from "express";
import cors from "cors";
import si from "systeminformation";
import { WebSocketServer } from "ws";
import { users } from "./auth/users.js";
import { generateToken, authMiddleware, requireRole } from "./auth/auth.js";
import { exec, spawn } from "child_process"; // Ajout de spawn ici

const app = express();

// ============ INITIALISATION SERVEUR & WSS ============
// On les crée en premier pour éviter les erreurs d'initialisation (TDZ)
const server = app.listen(3001, "0.0.0.0", () => {
  console.log("\n🚀 Nexus Hub Backend running on http://0.0.0.0:3001");
  console.log("\n👤 Default credentials:");
  console.log("   Admin: admin / admin123");
  console.log("   Viewer: viewer / viewer123\n");
});

const wss = new WebSocketServer({ server, path: "/ws" });

// Configuration CORS pour le domaine
const allowedOrigins = [
  "http://localhost:5173",                // Développement local (Vite)
  "http://localhost:3000",                // Développement local (React/Next)
  "http://localhost:3001",                // Backend local
  "https://hub.cyprienfournier.com",      // Frontend HUB Production
  "https://hub-api.cyprienfournier.com"   // Backend HUB Production
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (origin && origin.endsWith(".cyprienfournier.com")) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: origin not allowed"));
    }
  },
  credentials: true
}));

app.use(express.json());

// ============ ROUTE RACINE (HEALTH CHECK) ============
app.get("/", (req, res) => {
  res.json({
    message: "Nexus Hub Backend API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/login",
      system: "/api/system",
      advanced: "/api/advanced",
      processes: "/api/processes",
      network: "/api/network",
      docker: "/api/docker"
    }
  });
});

// ============ AUTH ============
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

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
    const [cpuLoad, cpuTemp, disksIO] = await Promise.allSettled([
      si.currentLoad(),
      si.cpuTemperature(),
      si.disksIO()
    ]);

    const val = (p) => p.status === 'fulfilled' ? p.value : null;
    const cpu = val(cpuLoad);
    const io = val(disksIO);

    res.json({
      cpu: {
        load: cpu?.currentLoad?.toFixed(1) ?? "0.0",
        user: cpu?.currentLoadUser?.toFixed(1) ?? "0.0",
        system: cpu?.currentLoadSystem?.toFixed(1) ?? "0.0",
      },
      temperature: val(cpuTemp)?.main ?? null,
      io: {
        read: io?.rIO ? (io.rIO / 1024 / 1024).toFixed(2) : "0.00",
        write: io?.wIO ? (io.wIO / 1024 / 1024).toFixed(2) : "0.00",
      },
    });
  } catch (error) {
    console.error("Advanced Route Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ============ PROCESSES ============
app.get("/api/processes", async (_, res) => {
  try {
    const data = await si.processes();
    res.json(
      data.list
        .sort((a, b) => b.cpu - a.cpu)
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

// ============ KILL PROCESS (Windows Optimized) ============
app.post("/api/processes/kill/:pid", authMiddleware, requireRole("admin"), async (req, res) => {
  const { pid } = req.params;
  const numericPid = parseInt(pid);

  if (isNaN(numericPid) || numericPid === 0) {
    return res.status(400).json({ error: "Invalid PID" });
  }

  exec(`taskkill /F /T /PID ${numericPid}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: "Failed to kill", details: stderr });
    }
    res.json({ message: `Process ${numericPid} killed` });
  });
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

// ============ GESTION UNIQUE DES WEBSOCKETS (MULTIPLEXAGE) ============
wss.on("connection", (ws, req) => {

  // 0. Check du token d'auth (optionnel)
  // 1. Authentification via Token dans la Query String
  const url = new URL(req.url, `http://${req.headers.host}`);

  console.log("✓ Nouveau client connecté (Terminal + Stats)");

  // 1. INITIALISATION DU SHELL PERSISTANT
  const shell = spawn("cmd.exe", ["/k", "chcp 65001 > nul"]);

  const sendToWs = (data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "output", content: data.toString() }));
    }
  };

  shell.stdout.on("data", sendToWs);
  shell.stderr.on("data", sendToWs);

  // 2. LOGIQUE MONITORING (STATS)
  const statsInterval = setInterval(async () => {
    try {
      if (ws.readyState === ws.OPEN) {
        const [cpu, mem, cpuTemp] = await Promise.all([
          si.currentLoad(),
          si.mem(),
          si.cpuTemperature()
        ]);

        ws.send(JSON.stringify({
          type: "stats",
          cpu: cpu.currentLoad.toFixed(1),
          ram: ((mem.used / mem.total) * 100).toFixed(1),
          temp: cpuTemp.main ?? null,
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.error("Erreur Stats WS:", error);
    }
  }, 1000);

  // 3. RÉCEPTION DES MESSAGES (COMMANDES + SIGNAUX)
  ws.on("message", (message) => {
    try {
      const parsed = JSON.parse(message);
      
      // --- GESTION DU CTRL+C (SIGINT) ---
      if (parsed.signal === "SIGINT") {
        console.log("⚡ Signal Ctrl+C reçu pour PID:", shell.pid);
        
        // 1. On tente de tuer les processus enfants (ex: ping, node script)
        // On ajoute "|| exit 0" pour éviter que exec ne renvoie une erreur si rien n'est à tuer
        const killCmd = `taskkill /F /T /FI "PPID eq ${shell.pid}" /FI "IMAGENAME ne cmd.exe" || exit 0`;
        
        exec(killCmd, (err) => {
          // 2. On envoie un break physique (Ctrl+C ascii \x03) au shell
          shell.stdin.write("\x03");
          
          // 3. On force un retour à la ligne pour ré-afficher le prompt proprement
          shell.stdin.write("\n");
          
          if (err) console.log("Taskkill: No sub-processes found.");
        });
        return;
      }

      // --- ENVOI DE COMMANDE ---
      if (parsed.command) {
        shell.stdin.write(parsed.command + "\n");
      }
    } catch (err) {
      console.error("Erreur parsing message WS:", err);
    }
  });

  // 4. NETTOYAGE COMPLET
  ws.on("close", () => {
    clearInterval(statsInterval);
    shell.kill(); 
    console.log("✗ Session fermée (Shell tué + Interval stoppé)");
  });

  ws.on("error", (err) => console.error("WS Socket Error:", err));
});

// Protected route example
app.post("/api/docker/:id/start", authMiddleware, requireRole("admin"), async (req, res) => {
  res.json({ message: "Container start not implemented yet" });
});

