"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [telegramId, setTelegramId] = useState<string>("Loading...");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setTelegramId(tg.initDataUnsafe.user.id.toString());
    } else {
      setTelegramId("Not found (Open in Telegram)");
    }
  }, []);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-md border border-gray-100 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-lg font-bold text-gray-900 mb-1">SDK Verified</h2>
        <p className="text-sm text-gray-500 mb-6">Your Telegram Identity has been captured.</p>
        
        <div className="bg-zinc-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">My Telegram ID</p>
          <code className="text-xl font-mono text-blue-600 tracking-tighter">
            {telegramId}
          </code>
        </div>
      </div>
    </div>
  );
}