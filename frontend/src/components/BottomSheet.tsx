"use client";

import React, { useEffect, useState, useRef } from 'react';
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
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

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

  // Gesture Logic for the Top Bar
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    
    // Only allow dragging downwards (positive delta)
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    // Threshold: if dragged more than 120px, close; otherwise snap back.
    if (dragY > 120) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden">
      {/* 1. Animated Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* 2. Animated & Draggable Sheet Content */}
      <div 
        className={`relative w-full max-w-md bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh] transition-transform ${
          isDragging ? 'duration-0' : 'duration-300' 
        } ease-out transform`}
        style={{ 
          transform: `translateY(${isAnimating ? `${dragY}px` : '100%'})` 
        }}
      >
        {/* ENTIRE TOP BAR GESTURE ZONE */}
        <div 
          className="w-full cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Visual Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>

          {/* Header/Title Area - Now also draggable */}
          <div className="px-6 pb-4 flex items-center justify-between border-b border-gray-50">
            <h3 className="text-xl font-bold text-gray-900 select-none">{title}</h3>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag trigger when clicking X
                onClose();
              }}
              className="p-2 bg-zinc-50 rounded-full text-gray-400 active:scale-90 transition-transform"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;