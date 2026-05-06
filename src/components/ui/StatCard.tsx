import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color?: 'green' | 'teal' | 'amber' | 'red' | 'purple' | 'blue';
  subtitle?: string;
  onClick?: () => void;
}

const colorMap = {
  green: 'from-green-500 to-green-600 shadow-green-200/50',
  teal: 'from-teal-500 to-teal-600 shadow-teal-200/50',
  amber: 'from-amber-500 to-amber-600 shadow-amber-200/50',
  red: 'from-red-500 to-red-600 shadow-red-200/50',
  purple: 'from-purple-500 to-purple-600 shadow-purple-200/50',
  blue: 'from-blue-500 to-blue-600 shadow-blue-200/50',
};

export default function StatCard({ icon, label, value, unit, color = 'green', subtitle, onClick }: Props) {
  return (
    <div onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl p-5 shadow-lg shadow-gray-100/50 border border-gray-100/80 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}>
      {/* Decorative gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[color]}`} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-800">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </span>
            {unit && <span className="text-sm text-gray-400 font-medium">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
