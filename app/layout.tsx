import type { Metadata } from "next"
import { Inter, Patrick_Hand, Courier_Prime, Caveat, Herr_Von_Muellerhoff, Playfair_Display, Reenie_Beanie } from "next/font/google"
import { SessionProvider } from "@/lib/auth/session-provider"
import { PostHogProvider } from "@/lib/analytics/posthog-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const patrickHand = Patrick_Hand({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-patrick-hand'
})
const courierPrime = Courier_Prime({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-courier-prime'
})
const caveat = Caveat({ 
  weight: ['400', '600'],
  subsets: ["latin"],
  variable: '--font-caveat'
})
const herrVonMuellerhoff = Herr_Von_Muellerhoff({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-herr-von-muellerhoff'
})
const playfairDisplay = Playfair_Display({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-playfair-display'
})
const reenieBeanie = Reenie_Beanie({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-reenie-beanie'
})

export const metadata: Metadata = {
  title: "MurderMysteries.AI - Solve the Case",
  description: "An immersive AI-powered murder mystery game",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${patrickHand.variable} ${courierPrime.variable} ${caveat.variable} ${herrVonMuellerhoff.variable} ${playfairDisplay.variable} ${reenieBeanie.variable}`}>
        <PostHogProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}

