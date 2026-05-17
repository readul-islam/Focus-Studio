import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: any;
  subtitle?: string | React.ReactNode;
  icon?: LucideIcon;
  bgColor?: string;
  subtitleBgColor?: string;
  titleColor?: string;
}

export function StatCard({ title, value, subtitle, bgColor = 'bg-white', subtitleBgColor = '', titleColor = '#0A0D14' }: StatCardProps) {
  return (
    <div className={`p-5 ${bgColor} border-0 md:border-r border-dashed last:border-0`}>
      <div className="space-y-2.5 flex flex-col justify-between gap-2 h-full">
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <div>
            <h3 className="text-base font-semibold text-gray-900" style={{ color: titleColor }}>
              {value}
            </h3>
          </div>
        </div>
        {subtitle && (
          <div
            className={`text-xs rounded-full py-1.5 px-3 inline-flex items-center w-full !text-[#0A0D14]`}
            style={{ background: subtitleBgColor }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
