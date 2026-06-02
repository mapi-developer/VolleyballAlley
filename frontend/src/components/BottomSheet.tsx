"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsAnimating(true);
        document.body.style.overflow = 'hidden';
      }, 10); 
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
        setDragY(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    if (deltaY > 0) setDragY(deltaY);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 120) onClose(); else setDragY(0);
  };

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-hidden">
      {/* Unified backdrop overlay */}
      <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      
      <div 
        className={`relative w-full max-w-md bg-app-bg rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh] transition-transform ${isDragging ? 'duration-0' : 'duration-300'} ease-out transform transition-colors duration-200`}
        style={{ transform: `translateY(${isAnimating ? `${dragY}px` : '100%'})` }}
      >
        <div className="w-full cursor-grab active:cursor-grabbing touch-none" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="flex justify-center py-3">
            {/* Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-app-active rounded-full transition-colors" />
          </div>

          <div className="px-6 pb-4 flex items-center justify-between border-b border-app-active transition-colors">
            <h3 className="text-xl font-bold text-app-text-primary select-none transition-colors">{title}</h3>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 bg-app-inset rounded-full text-app-text-secondary active:scale-90 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-12">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BottomSheet;