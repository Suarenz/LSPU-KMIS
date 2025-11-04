"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle redirect after authentication state is determined
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router])

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setError("")
     setLoading(true)

     const result = await login(email, password)
     if (result.success) {
       // Redirect immediately without waiting for full authentication state
       router.push("/dashboard")
     } else {
       setError(result.error || "Invalid email or password")
       setLoading(false)
     }
   }
 
   // Show loading state if authentication is still loading
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
 
   // If already authenticated, show loading state while redirecting
   if (isAuthenticated && !isLoading) {
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
           <p className="text-lg text-muted-foreground">Redirecting to dashboard...</p>
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
            <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
              <Image
                src="/LSPULogo.png"
                alt="LSPU Logo"
                width={96}
                height={96}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent mb-2 text-balance leading-tight">
            Knowledge Management Information System
          </h1>
          <p className="text-lg text-muted-foreground text-balance">Laguna State Polytechnic University</p>
        </div>

        <div className="flex justify-center">
          {/* Login Card */}
          <Card className="animate-fade-in shadow-xl w-full max-w-md border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Sign In to Your Account</CardTitle>
              <CardDescription className="text-center">Access the knowledge repository and collaboration tools</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@lspu.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
