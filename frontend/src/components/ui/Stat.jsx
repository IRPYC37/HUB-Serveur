export default function Stat({ label, value, unit }) {
  return (
    <div>
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-3xl font-semibold">
        {value}
        {unit && <span className="text-sm text-white/40 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
