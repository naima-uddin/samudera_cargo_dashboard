'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/common/sidebar';
import SiteSettingsProvider from '@/components/context/SiteSettingsProvider';

export default function LayoutClient({ children }) {
  const pathname = usePathname();

  // Show sidebar only on protected routes (not on login page)
  const isLoginPage = pathname === '/' || pathname === '/auth/forgot-password' || pathname === '/auth/register';

  return (
    <SiteSettingsProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        {!isLoginPage && <Sidebar />}
        <main className={`relative ${!isLoginPage ? 'flex-1 min-w-0' : 'w-full'} h-screen overflow-y-auto overflow-x-hidden ${!isLoginPage ? 'p-3 sm:p-5' : ''}`}>
          {children}
        </main>
      </div>
    </SiteSettingsProvider>
  );
}
