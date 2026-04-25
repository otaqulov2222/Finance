import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Agar foydalanuvchi tizimga kirmagan bo'lsa va login sahifasida bo'lmasa
  if (!isLoggedIn && !isLoginPage && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Agar foydalanuvchi tizimga kirgan bo'lsa va login sahifasiga kirmoqchi bo'lsa
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
