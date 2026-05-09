"use client"; // Required for useEffect and window access

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Check if we are inside Telegram
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      // 2. Extract real user data from Telegram
      const telegramUser = tg.initDataUnsafe?.user;
      if (telegramUser) {
        setUser(telegramUser);
      } else {
        // 3. Browser fallback for local development
        setUser({ first_name: "Matvei", photo_url: "" });
      }
    }
  }, []);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col pt-16 bg-zinc-50">
        <Header user={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}