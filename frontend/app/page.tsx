"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-emerald-500/3 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">FinanceTracker</span>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-800" />
          ) : isAuthenticated ? (
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center lg:py-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>AI-Powered Finance Insights</span>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white lg:text-7xl">
          Take Control of Your{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Finances
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 lg:text-xl">
          Track your income, manage expenses, and achieve your financial goals with our intuitive 
          and powerful finance tracking application.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Start Tracking Free
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              I Already Have an Account
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left backdrop-blur-sm transition-all hover:border-emerald-500/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Track Everything</h3>
            <p className="text-sm text-zinc-400">
              Monitor all your income and expenses across multiple accounts with detailed categorization.
            </p>
          </div>

          <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left backdrop-blur-sm transition-all hover:border-emerald-500/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Visual Analytics</h3>
            <p className="text-sm text-zinc-400">
              Beautiful charts and graphs to help you understand your spending patterns at a glance.
            </p>
          </div>

          <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left backdrop-blur-sm transition-all hover:border-emerald-500/30 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">AI Insights</h3>
            <p className="text-sm text-zinc-400">
              Smart recommendations and predictions powered by artificial intelligence.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
