export default function Card({ title, children, className = "" }) {
  return (
    <div
      className={`
        bg-glass backdrop-blur-glass rounded-2xl p-6
        border border-white/5 shadow-soft
        transition-all duration-300
        hover:scale-[1.02] hover:border-neon-blue/40
        ${className}
      `}
    >
      {title && (
        <h3 className="text-xs tracking-widest uppercase text-neon-blue mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
