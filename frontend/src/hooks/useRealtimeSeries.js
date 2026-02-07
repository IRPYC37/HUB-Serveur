import { useEffect, useState } from "react";
import API_URL from "../config";

export default function useRealtimeSeries(maxPoints = 30) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // 1. Conversion de l'URL API en WebSocket URL avec le chemin /ws
    const wsURL = `${API_URL.replace(/^http/, "ws")}/ws`;
    const ws = new WebSocket(wsURL);

    ws.onopen = () => {
      console.log("✓ Monitoring WebSocket connecté");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // 2. FILTRAGE : On ne traite que les messages de type "stats"
        // On ignore les messages de type "output" (terminal)
        if (msg.type === "stats") {
          setData((prevData) => {
            const newData = [...prevData, msg];
            // On garde uniquement les derniers points définis par maxPoints
            if (newData.length > maxPoints) {
              return newData.slice(newData.length - maxPoints);
            }
            return newData;
          });
        }
      } catch (error) {
        // On ignore les messages qui ne sont pas du JSON (ex: flux texte brut du terminal)
      }
    };

    ws.onerror = (error) => {
      console.error("✗ WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("✗ Monitoring WebSocket déconnecté");
    };

    // Nettoyage à la destruction du composant
    return () => ws.close();
  }, [maxPoints]);

  return data;
}