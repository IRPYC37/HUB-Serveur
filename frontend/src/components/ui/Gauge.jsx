export default function Gauge({ value, max, color = "bg-neon-blue" }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
      <div
        className={`h-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
