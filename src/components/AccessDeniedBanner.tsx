'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, X } from 'lucide-react';

export default function AccessDeniedBanner() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('denied') === 'true') {
      setShow(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShow(false), 5000);
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top">
      <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
        <ShieldAlert size={20} className="flex-shrink-0" />
        <p className="text-sm font-medium">Access Denied. You do not have admin privileges.</p>
        <button 
          onClick={() => setShow(false)} 
          className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
