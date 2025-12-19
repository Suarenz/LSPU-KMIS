"use client"

import { useEffect, memo, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Download, Eye, FileText, BookOpen, Search, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ClientOnly } from "@/components/client-only-wrapper"

// Lazy load non-critical sections for better initial load performance
const StatsSection = lazy(() => import('./stats-section'));
const QuickActionsSection = lazy(() => import('./quick-actions-section'));
const DocumentsSection = lazy(() => import('./documents-section'));
const ActivitySection = lazy(() => import('./activity-section'));

// Memoized loading component to prevent unnecessary re-renders
const LoadingSpinner = memo(() => (
  <div className="min-h-[70vh] bg-background flex items-center justify-center w-full">
    <div className="text-center">
      <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 overflow-hidden">
        <Image
          src="/LSPULogo.png"
          alt="LSPU Logo"
          width={64}
          height={64}
          className="w-16 h-16 object-contain animate-spin"
          priority
        />
      </div>
      <p className="text-lg text-muted-foreground">Loading dashboard...</p>
    </div>
  </div>
));

// Simple loading placeholder for lazy-loaded sections
const SectionLoader = () => (
  <div className="animate-pulse w-full">
    <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
      <div className="h-24 bg-muted rounded border border-border/50"></div>
      <div className="h-24 bg-muted rounded border border-border/50"></div>
      <div className="h-24 bg-muted rounded border border-border/50"></div>
      <div className="h-24 bg-muted rounded border border-border/50"></div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router])

  // Redirect immediately if not authenticated
  if (!isAuthenticated) {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <Image
              src="/LSPULogo.png"
              alt="LSPU Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain animate-spin"
            />
          </div>
          <p className="text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while user data is being fetched
  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen w-full" style={{ backgroundColor: '#F3F4F6' }}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Stats Grid - Critical section, loaded immediately */}
          <div className="mb-8">
            <Suspense fallback={<SectionLoader />}>
              <StatsSection />
            </Suspense>
          </div>

          {/* Quick Actions - Non-critical section, lazy loaded */}
          <div className="mb-8">
            <Suspense fallback={<SectionLoader />}>
              <QuickActionsSection />
            </Suspense>
          </div>

          {/* Recent Documents - Non-critical section, lazy loaded */}
          <div className="mb-8">
            <Suspense fallback={<SectionLoader />}>
              <DocumentsSection />
            </Suspense>
          </div>

          {/* Recent Activity - Non-critical section, lazy loaded */}
          <div>
            <Suspense fallback={<SectionLoader />}>
              <ActivitySection />
            </Suspense>
          </div>
        </main>
      </div>
    </ClientOnly>
 )
}
