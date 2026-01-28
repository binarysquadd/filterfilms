export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Mandala-inspired loader */}
        <div className="w-20 h-20 border-4 border-gold/20 rounded-full" />
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-gold rounded-full animate-spin" />
        <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-maroon rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="absolute inset-4 w-12 h-12 border-4 border-transparent border-t-gold-light rounded-full animate-spin" style={{ animationDuration: '2s' }} />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-gold rounded-full pulse-glow" />
        </div>
      </div>
    </div>
  );
};
