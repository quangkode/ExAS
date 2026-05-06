export default function StatCard({ icon, label, value, unit, color = 'green', subtitle }) {
  const colorMap = {
    green: 'from-green-500 to-green-600 shadow-green-200',
    teal: 'from-teal-500 to-teal-600 shadow-teal-200',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200',
    blue: 'from-blue-500 to-blue-600 shadow-blue-200',
    red: 'from-red-500 to-red-600 shadow-red-200',
  };

  const iconBgMap = {
    green: 'bg-green-400/30',
    teal: 'bg-teal-400/30',
    amber: 'bg-amber-400/30',
    blue: 'bg-blue-400/30',
    red: 'bg-red-400/30',
  };

  return (
    <div className={`stat-card relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorMap[color]} p-5 text-white shadow-lg`}>
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-white/5" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${iconBgMap[color]} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <p className="text-sm text-white/80 font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold">{value}</span>
          {unit && <span className="text-sm text-white/70">{unit}</span>}
        </div>
        {subtitle && (
          <p className="text-xs text-white/60 mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
