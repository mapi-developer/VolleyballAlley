'use client';

import { useEffect, useState } from 'react';
import type { WebApp as WebAppType } from '@twa-dev/types';

export function useTelegram() {
  const [webApp, setWebApp] = useState<WebAppType | null>(null);

  useEffect(() => {
    // Dynamically import the SDK only on the client side
    const initTelegram = async () => {
      const WebApp = (await import('@twa-dev/sdk')).default;
      WebApp.ready();
      WebApp.expand();
      setWebApp(WebApp);
    };

    if (typeof window !== 'undefined') {
      initTelegram();
    }
  }, []);

  return {
    webApp,
    user: webApp?.initDataUnsafe?.user,
    initData: webApp?.initData,
  };
}