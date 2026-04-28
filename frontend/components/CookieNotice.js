import { useState, useEffect, useRef } from 'react';

export default function CookieNotice() {
  const [accepted, setAccepted] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'true') setAccepted(true);
  }, []);

  const handleAccept = () => {
    // Предотвращаем множественные вызовы
    if (accepted) return;

    localStorage.setItem('cookie-consent', 'true');
    setAccepted(true);
  };

  // Не рендерим ничего при первой загрузке на SSR
  if (typeof window === 'undefined') return null;

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 m-6">
      <div className="w-sm rounded-2xl bg-white custom-shadow-1 transition dark:bg-neutral-800">
        <div className="relative p-6">
          <div className="mt-4">
            Мы используем куки и аналитику для улучшения работы сайта.
          </div>
        </div>
        <div className="rounded-b-2xl bg-gray-50 p-5 dark:bg-white/5">
          <button
            onClick={handleAccept}
            className="flex w-full items-center justify-center rounded-xl! bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <span className="ms-2">Принять</span>
          </button>
        </div>
      </div>
    </div>
  );
}
