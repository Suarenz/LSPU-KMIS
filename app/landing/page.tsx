"use client"

import type React from "react"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Shield, Users, TrendingUp } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const features = [
    {
      title: "Centralized Repository",
      description: "Access research, policies, and teaching materials in one place",
      icon: Search,
      color: "primary",
    },
    {
      title: "Collaboration Tools",
      description: "Forums, discussions, and knowledge sharing",
      icon: Users,
      color: "secondary",
    },
    {
      title: "Secure & Compliant",
      description: "RA 10173 Data Privacy Act compliant",
      icon: Shield,
      color: "accent",
    },
    {
      title: "Analytics & Insights",
      description: "Track usage and measure impact",
      icon: TrendingUp,
      color: "primary",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
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
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-primary/20">
              <Image
                src="/LSPULogo.png"
                alt="LSPU Logo"
                width={96}
                height={96}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent mb-2 text-balance">
            LSPU Knowledge Management Information System
          </h1>
          <p className="text-lg text-muted-foreground text-balance">Laguna State Polytechnic University</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Features */}
          <div className="space-y-4 animate-fade-in">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${feature.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          {/* CTA Card */}
          <Card className="animate-fade-in shadow-xl border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>Access the knowledge repository and collaboration tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Sign in with your LSPU credentials to access the knowledge management information system.
                </p>
                <Link href="/">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Sign In to LSPU KMIS</Button>
                </Link>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium mb-2 text-primary flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 0 000 2v3a1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Key Benefits:
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                    <li>Centralized access to institutional knowledge</li>
                    <li>Enhanced collaboration and knowledge sharing</li>
                    <li>Compliance with RA 10173 Data Privacy Act</li>
                    <li>Data-driven insights and analytics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* University Info */}
        <div className="mt-16 text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">About LSPU</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Laguna State Polytechnic University is a premier state university in the Province of Laguna, 
            committed to providing quality education and fostering innovation. The Knowledge Management 
            Information System supports our mission to advance learning, research, and community engagement.
          </p>
        </div>
      </div>
    </div>
  )
}