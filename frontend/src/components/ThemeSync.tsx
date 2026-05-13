"use client";

import { useEffect } from 'react';

export default function ThemeSync() {
  useEffect(() => {
    // Function to check Telegram's theme and apply it to our HTML tag
    const updateTheme = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const colorScheme = window.Telegram.WebApp.colorScheme;
        
        if (colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Run once on load
    updateTheme();

    // Listen for live theme changes (if user toggles it while app is open)
    window.Telegram?.WebApp?.onEvent('themeChanged', updateTheme);

    return () => {
      window.Telegram?.WebApp?.offEvent('themeChanged', updateTheme);
    };
  }, []);

  return null; // This component doesn't render anything visually
}