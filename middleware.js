// middleware.js (project root এ, যেখানে package.json আছে)
import { NextResponse } from 'next/server';

// পাবলিক রাউট - যেখানে লগইন ছাড়া যাওয়া যাবে
const publicRoutes = [
  '/',
  '/auth/forgot-password',
  '/auth/register',
];

// প্রটেক্টেড রাউট - যেখানে লগইন করতে হবে
const protectedRoutes = [
  '/dashboard',
  '/Bookings',
  '/shippings',
  '/warehouse',
  '/users',
  '/all-tracking',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // টোকেন চেক করুন
  const token = request.cookies.get('authToken')?.value || request.cookies.get('token')?.value;
  const isLoggedIn = !!token;
  
  // চেক করুন রুটটি প্রটেক্টেড কিনা
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // লগইন না করা থাকলে প্রটেক্টেড রুটে যেতে দেবেন না
  if (!isLoggedIn && isProtectedRoute) {
    console.log(`🔒 Redirecting to login from: ${pathname}`);
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // NOTE: আগে এখানে "লগইন করা থাকলে / থেকে /dashboard এ পাঠানো" হতো।
  // কিন্তু middleware শুধু cookie পড়ে আর client-side auth check localStorage/
  // cookie মিলিয়ে দেখে — দুটো desync হলে (stale cookie) এই redirect আর client-এর
  // router.push('/') একে অপরের সাথে অনন্ত loop তৈরি করত (/ ⇄ /dashboard)।
  // logged-in ইউজারকে dashboard এ পাঠানোর কাজটা এখন login page নিজেই client-side এ
  // করে, তাই এই server-side redirect সরিয়ে দেওয়া হলো — এতে loop অসম্ভব হয়ে যায়।

  return NextResponse.next();
}

// Middleware disabled for static export (output: 'export')
// Middleware is only supported with 'standalone' or 'server' output modes
/*
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
};
*/