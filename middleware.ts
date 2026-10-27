import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from './auth.config'

const { auth } = NextAuth(authConfig)

const rules: Record<string, string> = {
  '/student': 'STUDENT',
  '/teacher': 'TEACHER',
  '/admin': 'ADMIN',
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const prefix = Object.keys(rules).find((p) => pathname.startsWith(p))
  if (!prefix) return NextResponse.next()

  const user = req.auth?.user
  if (!user) return NextResponse.redirect(new URL('/login', req.nextUrl))
  if (user.role !== rules[prefix]) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
  return NextResponse.next()
})

export const config = { matcher: ['/student/:path*', '/teacher/:path*', '/admin/:path*'] }