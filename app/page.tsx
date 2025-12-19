"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Mail, Lock, Eye, EyeOff, BookOpen, Users, Shield, Sparkles, GraduationCap, Building2, Star } from "lucide-react"

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Handle redirect after authentication state is determined
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && isAuthenticated && mounted) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Invalid email or password")
      setLoading(false)
    }
  }

  // Enhanced loading spinner component
  const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="text-center relative z-10">
        <div className="relative">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 overflow-hidden rounded-2xl bg-white backdrop-blur-sm border border-slate-200 shadow-2xl">
            <Image
              src="/LSPULogo.png"
              alt="LSPU Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-transparent border-t-slate-400 rounded-2xl animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-xl text-slate-700 font-medium">{message}</p>
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )

  if (isLoading || !mounted) {
    return <LoadingSpinner message="Loading..." />
  }

  if (isAuthenticated && mounted) {
    return <LoadingSpinner message="Redirecting to dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
        
        {/* Floating icons */}
        <div className="absolute top-20 left-[10%] text-blue-300/40 animate-float">
          <BookOpen className="w-12 h-12" />
        </div>
        <div className="absolute top-40 right-[15%] text-indigo-300/40 animate-float-delayed">
          <GraduationCap className="w-10 h-10" />
        </div>
        <div className="absolute bottom-32 left-[20%] text-blue-300/40 animate-float">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="absolute bottom-48 right-[10%] text-indigo-300/40 animate-float-delayed">
          <Sparkles className="w-10 h-10" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10 relative z-10">
        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-5rem)]">
          
          {/* Left side - Branding & Info */}
          <div className="order-2 lg:order-1 space-y-8">
            {/* Logo and Title */}
            <div className="text-center animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden border-2 border-white bg-white">
                    <Image
                      src="/LSPULogo.png"
                      alt="LSPU Logo"
                      width={100}
                      height={100}
                      className="object-contain p-1"
                      priority
                    />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight uppercase" style={{ color: '#2B4385' }}>
                Knowledge Management
                <span className="block">
                  Information System
                </span>
              </h1>
              <p className="text-lg md:text-xl text-black font-bold">
                Laguna State Polytechnic University
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid sm:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-black" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Document Hub</h3>
                <p className="text-sm text-slate-500">Centralized repository for all academic documents</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Collaboration</h3>
                <p className="text-sm text-slate-500">Work together across departments seamlessly</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-black" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Secure Access</h3>
                <p className="text-sm text-slate-500">Role-based permissions for data protection</p>
              </div>
            </div>

            {/* Vision/Mission - Collapsible on mobile */}
            <div className="hidden lg:block space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-lg">
                <div>
                  <h3 className="font-semibold text-black mb-2">Vision</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    LSPU is a center of technological innovation that promotes interdisciplinary learning, sustainable utilization of resources, collaboration and partnership with the community and stakeholders.
                  </p>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-lg">
                <div>
                  <h3 className="font-semibold text-black mb-2">Mission</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    LSPU, driven by progressive leadership, is a premier institution providing technology-mediated agriculture, fisheries and other related disciplines significantly contributing to the growth and development of the region and nation.
                  </p>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-lg">
                <div>
                  <h3 className="font-semibold text-black mb-2">Quality Policy</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    LSPU delivers quality education through responsive instruction, distinctive research, sustainable extension and production services. Thus, we commit to continually improve to meet applicable requirements to provide quality, efficient and effective services to the university stakeholder's highest level of satisfaction through an excellent management system imbued with utmost integrity, professionalism and innovation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Card */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <Card className="animate-fade-in shadow-2xl w-full max-w-md border-0 bg-white/80 backdrop-blur-md overflow-hidden">
              <CardHeader className="space-y-3 pb-4 pt-8">
                <div className="flex justify-center">
                  <div className="w-14 h-14 flex items-center justify-center">
                    <Lock className="w-9 h-9 text-black" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center text-slate-800">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-slate-500">
                  Sign in to access your knowledge repository
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Email Address
                    </Label>
                    <div className={`relative transition-all duration-200 ${focusedInput === 'email' ? 'scale-[1.02]' : ''}`}>
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedInput === 'email' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@lspu.edu.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        required
                        className="pl-12 h-12 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium">
                      Password
                    </Label>
                    <div className={`relative transition-all duration-200 ${focusedInput === 'password' ? 'scale-[1.02]' : ''}`}>
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${focusedInput === 'password' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        required
                        className="pl-12 pr-12 h-12 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-shake">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90" 
                    style={{ backgroundColor: '#2B4385' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Mobile Vision/Mission */}
        <div className="lg:hidden mt-8 space-y-4 animate-fade-in">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
            <h3 className="font-semibold text-black mb-2">
              Vision
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              LSPU is a center of technological innovation that promotes interdisciplinary learning, sustainable utilization of resources, collaboration and partnership with the community and stakeholders.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
            <h3 className="font-semibold text-black mb-2">
              Mission
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              LSPU, driven by progressive leadership, is a premier institution providing technology-mediated agriculture, fisheries and other related disciplines.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
            <h3 className="font-semibold text-black mb-2">
              Quality Policy
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              LSPU delivers quality education through responsive instruction, distinctive research, sustainable extension and production services. Thus, we commit to continually improve to meet applicable requirements to provide quality, efficient and effective services to the university stakeholder's highest level of satisfaction through an excellent management system imbued with utmost integrity, professionalism and innovation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
