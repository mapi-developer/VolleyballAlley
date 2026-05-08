import WebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';

export function useTelegram() {
    const [webApp, setWebApp] = useState<typeof WebApp | null>(null);

    useEffect(() => {
        // Ensure this only runs on the client side
        if (typeof window !== 'undefined' && WebApp) {
            WebApp.ready(); // Tells Telegram the app is fully loaded
            WebApp.expand(); // Expands the Mini App to full height
            setWebApp(WebApp);
        }
    }, []);

    return {
        webApp,
        user: webApp?.initDataUnsafe?.user,
        initData: webApp?.initData,
    };
}