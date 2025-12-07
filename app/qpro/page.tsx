"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { TargetBoardPanel } from "@/components/qpro/target-board-panel"
import { ActionZonePanel } from "@/components/qpro/action-zone-panel"

interface Unit {
  id: string
  name: string
  code: string
}

export default function QPROPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedQuarter, setSelectedQuarter] = useState(1)
  const [selectedUnitId, setSelectedUnitId] = useState<string>("")
  const [units, setUnits] = useState<Unit[]>([])
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [analysisRefreshTrigger, setAnalysisRefreshTrigger] = useState(0)
  
  // Get selected unit name for filtering strategic plan
  const selectedUnit = units.find(u => u.id === selectedUnitId)
  const selectedUnitName = selectedUnit?.name || ""

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/")
    }
    if (!authLoading && user && user.role !== "ADMIN" && user.role !== "FACULTY") {
      router.push("/dashboard")
    }
  }, [authLoading, isAuthenticated, user, router])

  // Fetch units with debug logging
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem('access_token')
        console.log("[QPRO] Fetching units with token:", token ? 'Present' : 'Missing')
        
        const response = await fetch("/api/units", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log("[QPRO] Response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("[QPRO] Units fetched:", data.units)
          setUnits(data.units || [])
          
          // Auto-select user's unit if not admin
          if (user?.role !== "ADMIN" && user?.unitId) {
            setSelectedUnitId(user.unitId)
          } else if (data.units && data.units.length > 0) {
            setSelectedUnitId(data.units[0].id)
          }
        } else {
          const errorData = await response.json()
          console.error("[QPRO] Units fetch failed. Status:", response.status, "Error:", errorData)
        }
      } catch (error) {
        console.error("[QPRO] Error fetching units:", error)
      } finally {
        setUnitsLoading(false)
      }
    }

    if (user) {
      fetchUnits()
    }
  }, [user])

  const handleAnalysisComplete = () => {
    // Trigger refresh of target board to update statuses
    setAnalysisRefreshTrigger(prev => prev + 1)
  }

  if (authLoading || unitsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "FACULTY")) {
    return null
  }

  const years = [2025, 2026, 2027, 2028, 2029]
  const quarters = [1, 2, 3, 4]
  const isAdminUser = user.role === "ADMIN"

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quarterly Physical Report of Operations</h1>
            </div>

            {/* Filter Bar - "Context Bar" */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Year:</label>
                <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quarter Tabs - Pills style */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Quarter:</label>
                <Tabs value={selectedQuarter.toString()} onValueChange={(val) => setSelectedQuarter(parseInt(val))}>
                  <TabsList>
                    {quarters.map((q) => (
                      <TabsTrigger key={q} value={q.toString()} className="px-4">
                        Q{q}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Unit Selector */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium whitespace-nowrap">Unit:</label>
                <Select 
                  value={selectedUnitId} 
                  onValueChange={setSelectedUnitId}
                  disabled={!isAdminUser && !!user.unitId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select unit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isAdminUser && user.unitId && (
                  <span className="text-xs text-muted-foreground ml-2">(Locked to your unit)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard - Split View */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Target Board */}
          <div className="space-y-4">
            <Card className="p-6">
              <TargetBoardPanel 
                year={selectedYear}
                quarter={selectedQuarter}
                unitId={selectedUnitId}
                unitName={selectedUnitName}
                refreshTrigger={analysisRefreshTrigger}
              />
            </Card>
          </div>

          {/* Right Panel: Action Zone */}
          <div className="space-y-4">
            <Card className="p-6">
              <ActionZonePanel 
                year={selectedYear}
                quarter={selectedQuarter}
                unitId={selectedUnitId}
                unitName={selectedUnitName}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
