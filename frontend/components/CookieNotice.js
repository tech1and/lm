import { useState, useEffect } from 'react';

export default function CookieNotice() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'true') setAccepted(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-t border-gray-200"
      style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }}
    >
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white">
          Мы используем куки и аналитику для улучшения работы сайта.
        </p>
        <button
          onClick={handleAccept}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
        >
          Принять
        </button>
      </div>
    </div>
  );
}