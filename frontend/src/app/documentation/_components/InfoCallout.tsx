// src/app/documentation/_components/InfoCallout.tsx
import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface InfoCalloutProps {
  type?: 'info' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export function InfoCallout({ type = 'info', title, children }: InfoCalloutProps) {
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-100 text-blue-800',
      icon: <Info className="text-blue-500 shrink-0" size={20} />,
      titleColor: 'text-blue-900',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="text-amber-600 shrink-0" size={20} />,
      titleColor: 'text-amber-900',
    }
  };

  const activeStyle = styles[type];

  return (
    <div className={`border rounded-xl p-5 my-6 flex gap-4 ${activeStyle.container}`}>
      {activeStyle.icon}
      <div className="space-y-1 flex-1">
        {title && <h4 className={`m-0 font-bold text-sm leading-none ${activeStyle.titleColor}`}>{title}</h4>}
        <div className="text-sm m-0 leading-relaxed text-current">{children}</div>
      </div>
    </div>
  );
}