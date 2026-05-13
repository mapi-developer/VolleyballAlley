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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up transition-colors duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4 mx-auto">
          <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
        </div>
        
        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-center text-gray-500 dark:text-zinc-400 mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-100 font-bold rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md shadow-red-500/30 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}