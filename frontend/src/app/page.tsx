'use client'

import { useTelegram } from '@/hooks/useTelegram';
import { useEffect } from 'react';

export default function Home() {
    const { user, webApp, initData } = useTelegram();

    // Optional: Log initData to console so you can copy it for backend testing later
    useEffect(() => {
        if (initData) {
            console.log("Telegram initData:", initData);
        }
    }, [initData]);

    return (
        <main className="min-h-screen bg-gray-50 p-4 font-sans text-gray-900">
            <header className="mb-6 mt-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-blue-600">
                    Sports Events
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage your games easily.</p>
            </header>

            {/* User Greeting Card */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                {user ? (
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                            {user.first_name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">
                                Welcome, {user.first_name}!
                            </h2>
                            <p className="text-sm text-gray-500">Ready to hit the court?</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-slate-200 h-12 w-12"></div>
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    </div>
                )}
            </section>

            {/* Placeholder for Event Feed */}
            <section>
                <h3 className="font-bold text-gray-800 mb-3">Upcoming Events</h3>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl h-48 flex items-center justify-center text-gray-400">
                    Event feed will load here...
                </div>
            </section>
        </main>
    );
}