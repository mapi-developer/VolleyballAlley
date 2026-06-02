"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

export const FormField = ({ label, icon: Icon, children, disabled }: { label: string; icon: LucideIcon; children: React.ReactNode; disabled?: boolean; }) => (
  <div className={`space-y-2 ${disabled ? 'opacity-50' : ''}`}>
    <label className="flex items-center gap-2 text-[11px] font-black text-app-text-secondary uppercase tracking-widest px-1 transition-colors">
      <Icon size={14} /> {label} {disabled && "(Locked)"}
    </label>
    {children}
  </div>
);