import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheetLayout({ isOpen, onClose, title, children }: BottomSheetLayoutProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { 
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-app-bg rounded-t-3xl flex flex-col max-h-[90vh] shadow-2xl animate-slide-up transition-colors duration-200">
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 bg-app-active rounded-full cursor-pointer transition-colors" />
        </div>

        <div className="flex justify-between items-center px-6 py-3 border-b border-app-active transition-colors">
          <h2 className="text-xl font-bold text-app-text-primary transition-colors">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-app-inset rounded-full text-app-text-secondary hover:bg-app-active transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 pb-12 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}