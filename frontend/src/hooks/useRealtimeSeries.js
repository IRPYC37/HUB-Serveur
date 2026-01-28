import { useEffect, useState } from "react";
import API_URL from "../config";

export default function useRealtimeSeries(maxPoints = 30) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Convertir l'URL API en WebSocket URL
    const wsURL = API_URL.replace(/^http/, "ws");
    const ws = new WebSocket(wsURL);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        setData((prev) =>
          [...prev, { time: Date.now(), ...parsed }].slice(-maxPoints)
        );
      } catch (error) {
        console.error("WebSocket parse error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => ws.close();
  }, [maxPoints]);

  return data;
}
