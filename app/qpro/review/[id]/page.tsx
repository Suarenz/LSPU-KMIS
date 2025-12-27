'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ChevronLeft } from 'lucide-react';
import ReviewQProModal from '@/components/qpro/review-qpro-modal';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const analysisId = params.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleCloseModal = () => {
    // Go back to the previous page or QPRO page
    router.back();
  };

  const handleApproveSuccess = () => {
    console.log('[Review Page] handleApproveSuccess called - redirecting to QPRO page...');
    // Redirect to QPRO dashboard after successful approval
    // This avoids reloading the same analysis which is now APPROVED
    router.push('/qpro');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Review QPRO Analysis
              </h1>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={handleCloseModal}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            {analysisId ? (
              <div className="w-full">
                {/* Render review modal as full page */}
                <ReviewQProModal
                  isOpen={true}
                  onClose={handleCloseModal}
                  analysisId={analysisId}
                  onApprove={handleApproveSuccess}
                  forceFullPage={true}
                />
              </div>
            ) : (
              <Card>
                <div className="flex items-start gap-3 p-6">
                  <p className="font-medium text-red-900">Invalid Analysis ID</p>
                  <p className="text-sm text-red-700 mt-1">
                    No analysis ID was provided
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
