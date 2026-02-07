export default function Card({ title, children, className = "", live = false }) {
  return (
    <div
      className={`
        bg-glass backdrop-blur-glass rounded-2xl p-6
        border border-white/5 shadow-soft
        transition-all duration-300
        hover:scale-[1.01] hover:border-neon-blue/40
        ${className}
      `}
    >
      {title && (
        <div className="flex items-center gap-3 mb-4">
          {live && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          <h3 className="text-xs tracking-widest uppercase text-neon-blue">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}