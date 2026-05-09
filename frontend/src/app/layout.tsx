"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  
  const isOrganizer = true; 

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
    }
  }, []);
  
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="min-h-full flex flex-col pt-16 pb-24 bg-zinc-50">
        <Header user={user} />
        <main className="flex-1 px-4">
          {children}
        </main>
        <Footer isOrganizer={isOrganizer} />
      </body>
    </html>
  );
}