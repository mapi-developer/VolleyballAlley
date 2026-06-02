import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen, title, message, confirmText = "Yes, delete", cancelText = "No, Keep It", onConfirm, onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in transition-opacity">
      <div className="bg-app-bg rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up transition-colors duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-app-error-bg mb-4 mx-auto transition-colors">
          <AlertTriangle className="text-app-error transition-colors" size={24} />
        </div>
        
        <h3 className="text-lg font-bold text-center text-app-text-primary mb-2 transition-colors">{title}</h3>
        <p className="text-sm text-center text-app-text-secondary mb-6 transition-colors">{message}</p>
        
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-app-inset hover:bg-app-active text-app-text-primary font-bold rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-app-error text-white font-bold rounded-xl shadow-md active:scale-95 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}