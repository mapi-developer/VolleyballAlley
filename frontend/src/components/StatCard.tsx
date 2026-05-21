import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-app-inset p-4 rounded-2xl shadow-sm border border-app-active flex flex-col items-center justify-center text-center w-full transition-colors">
      {icon && <div className="mb-2 text-app-accent">{icon}</div>}
      <span className="text-2xl font-bold text-app-text-primary">{value}</span>
      <span className="text-xs text-app-text-secondary uppercase tracking-wider mt-1 font-medium">{title}</span>
    </div>
  );
}