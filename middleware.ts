import { type NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // TEMPORARY: Disable auth protection for demo/development
  // Define protected and auth routes
  // const isProtectedRoute = path.startsWith('/game') || path.startsWith('/dashboard')
  const isAuthRoute = path.startsWith('/auth/login') || path.startsWith('/auth/signup')

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // TEMPORARILY COMMENTED OUT FOR UI DEMO:
  // Redirect unauthenticated users to login for protected routes
  // if (isProtectedRoute && !token) {
  //   const loginUrl = new URL('/auth/login', request.url)
  //   loginUrl.searchParams.set('callbackUrl', path)
  //   return NextResponse.redirect(loginUrl)
  // }

  // Update Supabase session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (except /api/auth)
     */
    '/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

