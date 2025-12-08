"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, FileText, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InsightFeed } from "./insight-feed"
import { QPROResultsWithAggregation } from "@/components/qpro-results-with-aggregation"
import AuthService from "@/lib/services/auth-service"
import type { QPROWithAggregationResults } from "@/lib/types"

interface ActionZonePanelProps {
  year: number
  quarter: number
  unitId: string
  unitName: string
  onAnalysisComplete: () => void
}

export function ActionZonePanel({ year, quarter, unitId, unitName, onAnalysisComplete }: ActionZonePanelProps) {
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [results, setResults] = useState<QPROWithAggregationResults | null>(null)
  const [useAggregation, setUseAggregation] = useState(true)
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return
      if (!unitId) {
        toast({
          title: "Unit Required",
          description: "Please select a unit before uploading.",
          variant: "destructive",
        })
        return
      }

      const file = acceptedFiles[0]
      
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ]
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file.",
          variant: "destructive",
        })
        return
      }

      setUploading(true)
      setAnalyzing(true)

      try {
        // Get authentication token
        const token = await AuthService.getAccessToken()
        if (!token) {
          throw new Error("Authentication required. Please log in again.")
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("unitId", unitId)
        formData.append("year", year.toString())
        formData.append("quarter", quarter.toString())
        formData.append("documentTitle", file.name)

        // Use new unified endpoint that includes aggregation
        const endpoint = useAggregation ? "/api/qpro-with-aggregation" : "/api/analyze-qpro"
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        const result = await response.json()
        
        setAnalysisId(result.analysis.id)
        
        // Store aggregation results if using new endpoint
        if (useAggregation && result.aggregation) {
          setResults(result)
        }
        
        setUploading(false)

        toast({
          title: "Analysis Complete!",
          description: useAggregation 
            ? "Your QPRO report has been analyzed with metrics and aggregations."
            : "Your QPRO report has been analyzed successfully.",
        })

        onAnalysisComplete()
      } catch (error: any) {
        console.error("Upload error:", error)
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload and analyze the document.",
          variant: "destructive",
        })
        setUploading(false)
        setAnalyzing(false)
      } finally {
        setAnalyzing(false)
      }
    },
    [unitId, year, quarter, toast, onAnalysisComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="space-y-6">
      {/* Smart Upload Area */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" />
          Upload QPRO Report
        </h2>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-muted/50"}
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {analyzing ? "Analyzing your QPRO report..." : "Uploading..."}
              </p>
            </div>
          ) : analysisId ? (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <p className="text-sm font-medium">Upload Complete!</p>
              <p className="text-xs text-muted-foreground">
                Drop another file to analyze a different report
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium mb-1">
                  {isDragActive ? "Drop your QPRO report here" : "Drop your QPRO Report here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports .docx and .pdf files
                </p>
              </div>
              <Button variant="outline" size="sm" type="button">
                Or Click to Browse
              </Button>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          <p>
            📌 Tip: The AI will extract activities from your report and match them against the
            strategic plan targets for Q{quarter} {year}.
          </p>
        </div>
      </div>

      {/* AI Insight Feed or Aggregation Results */}
      {results ? (
        <div className="pt-6 border-t">
          <QPROResultsWithAggregation results={results} />
        </div>
      ) : analysisId && !useAggregation ? (
        <div className="pt-6 border-t">
          <InsightFeed analysisId={analysisId} year={year} quarter={quarter} />
        </div>
      ) : null}

      {!analysisId && !uploading && (
        <div className="pt-6 border-t">
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-sm">Upload a QPRO report to see AI-powered insights</p>
            <p className="text-xs mt-1">
              Activity matching • Gap analysis • Strategic recommendations
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
