export default function Loader() {
  return (
    <div className="flex gap-2 justify-center items-center py-8">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-3 h-3 bg-neon-blue rounded-full animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}
