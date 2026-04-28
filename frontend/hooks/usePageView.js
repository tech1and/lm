import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export function usePageView() {
  const router = useRouter();
  const lastTrackTimeRef = useRef(0);
  const TRACK_DELAY = 300; // Минимальная задержка между трекингами (мс)

  useEffect(() => {
    const handleRouteChange = (url) => {
      const now = Date.now();

      // Debounce: пропускаем только если прошло достаточно времени
      if (now - lastTrackTimeRef.current < TRACK_DELAY) {
        return;
      }
      lastTrackTimeRef.current = now;

      // Google Analytics
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'page_view', {
          page_path: url,
        });
      }

      // Яндекс.Метрика
      if (typeof window.ym !== 'undefined' && process.env.NEXT_PUBLIC_YANDEX_METRICA_ID) {
        window.ym(process.env.NEXT_PUBLIC_YANDEX_METRICA_ID, 'hit', url);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);
}
