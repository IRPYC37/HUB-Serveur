import { useState, useRef, useEffect } from "react";
import API_URL from "../../config";

export default function SystemConsole() {
  const [tabs, setTabs] = useState([
    { id: 1, name: "Session 1", history: [], path: "C:\\>", isConnected: false }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [input, setInput] = useState("");
  
  const socketsRef = useRef({});
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (!socketsRef.current[activeTabId]) {
      createNewSocket(activeTabId);
    }
  }, [activeTabId]);

  const createNewSocket = (tabId) => {
    const wsBaseUrl = API_URL.replace(/^http/, 'ws');
    const socket = new WebSocket(`${wsBaseUrl}/ws`);

    socket.onopen = () => updateTabState(tabId, { isConnected: true });

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "output") {
          const pathMatch = msg.content.match(/([a-zA-Z]:\\[^>]+>)/g);
          let newPath = null;
          let content = msg.content;

          if (pathMatch) {
            newPath = pathMatch[pathMatch.length - 1];
            content = msg.content.replace(newPath, "").trim();
          }

          setTabs(prev => prev.map(tab => {
            if (tab.id === tabId) {
              return {
                ...tab,
                path: newPath || tab.path,
                history: content ? [...tab.history, { type: "out", content }] : tab.history
              };
            }
            return tab;
          }));
        }
      } catch (e) { console.error("Erreur WS:", e); }
    };

    socket.onclose = () => updateTabState(tabId, { isConnected: false });
    socketsRef.current[tabId] = socket;
  };

  const updateTabState = (id, data) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const addTab = () => {
    const newId = Date.now();
    const newTab = { id: newId, name: `Session ${tabs.length + 1}`, history: [], path: "C:\\>", isConnected: false };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    socketsRef.current[id]?.close();
    delete socketsRef.current[id];
    const remainingTabs = tabs.filter(t => t.id !== id);
    setTabs(remainingTabs);
    if (activeTabId === id) setActiveTabId(remainingTabs[0].id);
  };

  const handleKeyDown = (e) => {
    const socket = socketsRef.current[activeTabId];
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      socket?.send(JSON.stringify({ signal: "SIGINT" }));
      updateTabState(activeTabId, { history: [...activeTab.history, { type: "out", content: "^C" }] });
      return;
    }
    if (e.key === "Enter" && input.trim()) {
      if (input.toLowerCase() === "cls") {
        updateTabState(activeTabId, { history: [] });
      } else {
        socket?.send(JSON.stringify({ command: input.trim() }));
      }
      setInput("");
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeTab?.history]);

  return (
    <div className="bg-black/90 rounded-lg border border-white/5 h-[455px] flex flex-col overflow-hidden font-mono text-[11px]" onClick={() => inputRef.current?.focus()}>
      
      {/* BARRE D'ONGLETS */}
      <div className="flex items-center bg-white/5 border-b border-white/10 p-1 gap-1">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer transition-all border-t-2 ${
              activeTabId === tab.id 
                ? "bg-black text-neon-blue border-neon-blue font-bold" 
                : "text-white/40 border-transparent hover:bg-white/5"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${tab.isConnected ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-red-500 animate-pulse"}`} />
            <span className="truncate max-w-[100px] uppercase tracking-tighter">{tab.name}</span>
            {tabs.length > 1 && (
              <button onClick={(e) => closeTab(e, tab.id)} className="ml-2 opacity-0 group-hover:opacity-100 hover:text-red-500 font-bold">×</button>
            )}
          </div>
        ))}
        <button onClick={addTab} className="px-3 py-1 text-white/20 hover:text-neon-blue font-bold text-lg transition-colors">+</button>
      </div>

      {/* TITRE FIXE EN FRANÇAIS (Sorti du flux scrollable) */}
      <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex justify-between items-center text-[9px] font-bold tracking-widest">
        <span className="text-white/30 uppercase italic">
          {activeTab?.name} — Invite de commandes Windows
        </span>
        <span className={activeTab?.isConnected ? "text-green-500/50" : "text-red-500/50"}>
          {activeTab?.isConnected ? "CONNEXION STABLE" : "RECONNEXION EN COURS..."}
        </span>
      </div>

      {/* HISTORIQUE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar bg-black/20" ref={scrollRef}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Forcer l'alignement et la gestion du texte long */
        .truncate-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>

        {activeTab?.history.map((line, i) => (
          <pre key={i} className="whitespace-pre-wrap break-all text-white/80 leading-relaxed font-mono">
            {line.content}
          </pre>
        ))}
      </div>

      {/* PROMPT DE SAISIE FIXE EN BAS */}
      <div className="flex items-center gap-2 border-t border-white/10 p-4 bg-black">
        <span className="text-neon-blue font-bold whitespace-nowrap">{activeTab?.path}</span>
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck="false"
          className="bg-transparent border-none outline-none text-white flex-1 p-0 focus:ring-0 placeholder:text-white/10"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
}