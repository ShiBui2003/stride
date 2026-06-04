// Route protection — guards all app routes, gates onboarding before home access
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';
  const isOnboardingPage = pathname === '/onboarding';
  // onboarding_complete is set in auth metadata after profile creation (see onboarding/page.tsx)
  const onboardingComplete = !!user?.user_metadata?.onboarding_complete;

  // No session → must log in first (onboarding requires auth too)
  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authenticated but profile not yet created → send to onboarding
  if (user && !onboardingComplete && !isOnboardingPage && !isLoginPage) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Fully onboarded user landing on login or onboarding → skip to home
  if (user && onboardingComplete && (isLoginPage || isOnboardingPage)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Match actual app route URLs (route groups like (app) are never in the URL)
  matcher: [
    '/(home|map|run|leaderboard|profile|notifications)(.*)',
    '/login',
    '/onboarding',
  ],
};
