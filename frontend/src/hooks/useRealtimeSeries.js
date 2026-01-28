import { useEffect, useState } from "react";

export default function useRealtimeSeries(maxPoints = 30) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

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
