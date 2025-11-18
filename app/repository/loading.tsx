"use client";

import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import Image from "next/image";
import { ClientOnly } from "@/components/client-only-wrapper";

export default function Loading() {
  return (
    <ClientOnly>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 lg:hidden"></div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Knowledge Repository</h1>
                  <p className="text-muted-foreground">Browse and access institutional knowledge resources</p>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="mb-6 animate-fade-in">
            <div className="p-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground bg-muted rounded-full"></div>
                <div className="pl-10 h-10 w-full bg-muted rounded-md"></div>
              </div>
              <div className="w-full md:w-48 h-10 bg-muted rounded-md"></div>
              <div className="w-full md:w-48 h-10 bg-muted rounded-md"></div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-16 bg-muted rounded text-xs self-end"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-6 w-12 text-xs" />
                      <Skeleton className="h-6 w-16 text-xs" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4"></div>
                          <Skeleton className="h-4 w-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4"></div>
                          <Skeleton className="h-4 w-6" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-10 text-xs" />
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
