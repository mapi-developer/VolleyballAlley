import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheetLayout({ isOpen, onClose, title, children }: BottomSheetLayoutProps) {
  // Prevent background scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Background overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Sheet Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl flex flex-col max-h-[90vh] shadow-2xl animate-slide-up">
        {/* Top Handle / Drag indicator */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-4 pb-12 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}