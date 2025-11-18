import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "@/lib/auth/session-provider"
import { PostHogProvider } from "@/lib/analytics/posthog-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MurderMysteries.AI - Solve the Case",
  description: "An immersive AI-powered murder mystery game",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}

