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
import { Mail, Lock } from "lucide-react"

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
       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center">
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
       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-blue-200 bg-white">
              <Image
                src="/LSPULogo.png"
                alt="LSPU Logo"
                width={96}
                height={96}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-2 text-balance leading-tight">
            Knowledge Management Information System
          </h1>
          <p className="text-lg text-muted-foreground text-balance">Laguna State Polytechnic University</p>
        </div>
 
        <div className="flex justify-center">
          {/* Login Card */}
          <Card className="animate-fade-in shadow-xl w-full max-w-md border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                Sign In to Your Account
              </CardTitle>
              <CardDescription className="text-center">Access the knowledge repository and collaboration tools</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@lspu.edu.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>}
                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
        
        {/* LSPU Mission, Vision, and Quality Policy */}
        <div className="mt-16 max-w-4xl mx-auto text-center space-y-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Vision</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              LSPU is a center of technological innovation that promotes interdisciplinary learning, sustainable utilization of resources, collaboration and partnership with the community and stakeholders
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Mission</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              LSPU, driven by progressive leadership, is a premier institution providing technology-mediated agriculture, fisheries and other related and emerging disciplines significantly contributing to the growth and development of the region and nation.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Quality Policy</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              LSPU delivers quality education through responsive instruction, distinctive research, sustainable extension and production services. Thus, we commit to continually improve to meet applicable requirements to provide quality, efficient and effective services to the university stakeholder's highest level of satisfaction through an excellent management system imbued with utmost integrity, professionalism and innovation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
