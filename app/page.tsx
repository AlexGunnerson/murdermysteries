"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Brain, Trophy, Target } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.1),transparent_50%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            {isAuthenticated && (
              <div className="mb-4 flex items-center justify-center gap-4">
                <p className="text-gray-400">
                  Welcome back, <span className="text-amber-400 font-semibold">{session?.user?.name || session?.user?.email}</span>!
                </p>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-500 hover:text-gray-300 underline"
                >
                  Sign Out
                </button>
              </div>
            )}
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              MurderMysteries.AI
            </h1>
            <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Step into the shoes of a detective. Question AI-powered suspects,
              gather evidence, and solve intricate murder cases.
            </p>
            <div className="flex gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link href="/game/case01">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg">
                      Play Now
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="bg-transparent border-amber-600 text-amber-400 hover:bg-amber-950 px-8 py-6 text-lg"
                    >
                      My Cases
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg">
                      Start Investigation
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="bg-transparent border-amber-600 text-amber-400 hover:bg-amber-950 px-8 py-6 text-lg"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 hover:border-amber-600 transition-colors">
              <div className="h-12 w-12 bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-400 mb-2">
                AI-Powered NPCs
              </h3>
              <p className="text-gray-400">
                Question suspects with realistic AI dialogue that responds
                dynamically to your investigation.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 hover:border-amber-600 transition-colors">
              <div className="h-12 w-12 bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-400 mb-2">
                Deep Investigation
              </h3>
              <p className="text-gray-400">
                Explore crime scenes, analyze evidence, and uncover hidden
                connections between suspects.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 hover:border-amber-600 transition-colors">
              <div className="h-12 w-12 bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-400 mb-2">
                Strategic Investigation
              </h3>
              <p className="text-gray-400">
                Plan your investigation carefully. Each action reveals new clues
                and unlocks deeper mysteries.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 hover:border-amber-600 transition-colors">
              <div className="h-12 w-12 bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-400 mb-2">
                Test Your Theories
              </h3>
              <p className="text-gray-400">
                Submit theories as you progress, validate your deductions, and
                unlock new leads.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-24">
            <h2 className="text-4xl font-bold text-center mb-12 text-amber-400">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-amber-900/30 border border-amber-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-amber-400">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">
                  Start Your Case
                </h3>
                <p className="text-gray-400">
                  Begin with an introductory briefing and access to the crime
                  scene and key witnesses.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-amber-900/30 border border-amber-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-amber-400">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">
                  Investigate & Deduce
                </h3>
                <p className="text-gray-400">
                  Question suspects, examine scenes, and review records. Every
                  discovery rewards you with more points.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-amber-900/30 border border-amber-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-amber-400">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">
                  Solve the Murder
                </h3>
                <p className="text-gray-400">
                  When you&apos;re ready, submit your final accusation. Can you
                  bring the killer to justice?
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-24 text-center">
            <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-700/50 rounded-xl p-12">
              <h2 className="text-3xl font-bold mb-4 text-amber-400">
                {isAuthenticated ? 'Your Investigation Awaits' : 'Ready to Crack the Case?'}
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {isAuthenticated 
                  ? 'Jump into your next case and put your detective skills to the test.'
                  : 'Join detectives worldwide in solving AI-powered murder mysteries. Your investigation awaits.'}
              </p>
              {isAuthenticated ? (
                <Link href="/game/case01">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 text-xl">
                    Start Playing
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 text-xl">
                    Begin Your First Case
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>© 2025 MurderMysteries.AI - All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}

