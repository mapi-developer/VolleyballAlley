'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, webApp, initData } = useTelegram();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // When initData is available, check-in with the backend [cite: 186]
    if (initData) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, { 
        method: 'GET',
        headers: {
          'x-telegram-init-data': initData 
        }
      })
      .then(res => {
        if (res.ok) setIsRegistered(true);
      })
      .catch(err => console.error("Registration check failed", err));
    }
  }, [initData]);

  if (!webApp) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Initializing Telegram...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 font-sans text-gray-900">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-600">
          Sports Events
        </h1>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
              {user.first_name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="font-semibold text-lg">Welcome, {user.first_name}!</h2>
              <p className="text-sm text-gray-500">
                {isRegistered ? "You are connected." : "Connecting to server..."}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Please open this app via Telegram.</p>
        )}
      </section>
    </main>
  );
}