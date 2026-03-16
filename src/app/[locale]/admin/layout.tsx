'use client';

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Users, FileText, Settings, LogOut, Package, Gift, Truck, Loader2, ShieldAlert, BookOpen, Star, ShieldCheck, Wrench } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (!adminData) {
          router.push('/');
          return;
        }

        setAdminEmail(session.user.email || '');
        setIsVerified(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname.endsWith('/admin');
    }
    return pathname.includes(path);
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, current: isActive('/admin') },
    { name: 'Products', href: '/admin/products', icon: Package, current: isActive('/admin/products') },
    { name: 'Product Tools', href: '/admin/products/tools', icon: Wrench, current: isActive('/admin/products/tools') },
    { name: 'Categories', href: '/admin/categories', icon: LayoutDashboard, current: isActive('/admin/categories') },
    { name: 'Mystery Boxes', href: '/admin/mystery-boxes', icon: Gift, current: isActive('/admin/mystery-boxes') },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, current: isActive('/admin/orders') },
    { name: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingBag, current: isActive('/admin/abandoned-carts') },
    { name: 'Coupons', href: '/admin/coupons', icon: Gift, current: isActive('/admin/coupons') },
    { name: 'Loyalty Points', href: '/admin/loyalty', icon: Star, current: isActive('/admin/loyalty') },
    { name: 'Customers', href: '/admin/customers', icon: Users, current: isActive('/admin/customers') },
    { name: 'Reviews', href: '/admin/reviews', icon: Star, current: isActive('/admin/reviews') },
    { name: 'Shipping', href: '/admin/shipping', icon: Truck, current: isActive('/admin/shipping') },
    { name: 'Content', href: '/admin/content', icon: FileText, current: isActive('/admin/content') },
    { name: 'Beauty Tips', href: '/admin/content/beauty-tips', icon: BookOpen, current: isActive('/admin/content/beauty-tips') },
    { name: 'Admins', href: '/admin/admins', icon: ShieldCheck, current: isActive('/admin/admins') },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: isActive('/admin/settings') },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col items-center">
          <Link href="/" className="relative h-12 w-24">
            <Image 
              src="/images/logo.png" 
              alt="Glossy" 
              fill 
              className="object-contain" 
            />
          </Link>
          <span className="text-[10px] tracking-[0.2em] text-gray-400 block text-center mt-2 font-medium">ADMIN DIRECTORY</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors
                ${item.current 
                  ? 'bg-[var(--color-luxury-black)] text-white border-l-4 border-[var(--color-rose-gold)]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-luxury-black)] border-l-4 border-transparent'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-6 border-t border-gray-100">
          <div className="mb-3 text-xs text-gray-400 truncate" title={adminEmail}>
            {adminEmail}
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <Link href="/" className="relative h-10 w-20">
            <Image 
              src="/images/logo.png" 
              alt="Glossy" 
              fill 
              className="object-contain" 
            />
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSignOut}
              title="Sign Out"
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut size={20} />
            </button>
            <button title="Dashboard Menus" aria-label="Dashboard Menus" className="text-gray-500 hover:text-[var(--color-luxury-black)]">
              <LayoutDashboard size={24} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-gray-500">
                <Loader2 className="animate-spin w-10 h-10 opacity-50" />
                <p className="uppercase tracking-widest text-sm font-medium">Verifying Access...</p>
              </div>
            </div>
          ) : !isVerified ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-red-500">
                <ShieldAlert className="w-12 h-12" />
                <p className="text-lg font-medium">Access Denied</p>
                <p className="text-sm text-gray-500">You do not have admin privileges.</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
