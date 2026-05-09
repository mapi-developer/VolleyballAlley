"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  disabled?: boolean;
}

export const FormField = ({ label, icon: Icon, children, disabled }: FormFieldProps) => (
  <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
      <Icon size={14} />
      {label} {disabled && "(Locked < 24h)"}
    </label>
    {children}
  </div>
);