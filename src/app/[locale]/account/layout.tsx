'use client';

import { Link, useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { User, Package, Heart, Settings, Wallet, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppStore } from '@/store';
import { createClient } from '@/utils/supabase/client';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Account');
  const { logout } = useAppStore();
  const supabase = createClient();
  
  const isActive = (path: string) => pathname.includes(path);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/login');
  };

  const navigation = [
    { name: t('overview'), href: '/account', icon: User, current: isActive('/account') && !isActive('/orders') && !isActive('/wishlist') && !isActive('/settings') && !isActive('/wallet') },
    { name: t('orders'), href: '/account/orders', icon: Package, current: isActive('/orders') },
    { name: t('wallet'), href: '/account/wallet', icon: Wallet, current: isActive('/wallet') },
    { name: t('wishlist'), href: '/account/wishlist', icon: Heart, current: isActive('/wishlist') },
    { name: t('settings'), href: '/account/settings', icon: Settings, current: isActive('/settings') },
  ];

  return (
    <div className="bg-white dark:bg-[#1a1a1a] min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {!isActive('/account') && <h1 className="text-3xl font-serif mb-8 text-[var(--color-luxury-black)]">{t('title')}</h1>}

        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation - Hidden on main account overview to allow full-width luxury card */}
          {!isActive('/account') && (
            <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-2 bg-white p-6 border border-gray-100 shadow-sm rounded-[1.5rem] sticky top-24">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 border border-transparent text-sm font-bold transition-all rounded-xl
                    ${item.current 
                      ? 'bg-[var(--color-luxury-black)] text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-50 hover:border-gray-100 hover:text-[var(--color-luxury-black)]'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 ${item.current ? 'text-[var(--color-rose-gold)]' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              ))}
              
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 border border-transparent text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors rounded-xl mt-4"
              >
                <LogOut className="h-5 w-5 text-red-500" />
                {t('signOut')}
              </button>
            </nav>
          </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="min-h-[500px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
