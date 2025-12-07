'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AuthService from '@/lib/services/auth-service';

interface QPROAnalysis {
  id: string;
  documentTitle: string;
  analysisResult: string;
  createdAt: string;
  document: {
    fileName: string;
  };
}

export default function QPROAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<QPROAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // Load existing analyses when component mounts
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const token = await AuthService.getAccessToken();
      const response = await fetch('/api/qpro-analyses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAnalyses(data.analyses || []);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Set default title based on filename
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('qproFile', file);
    formData.append('title', title || file.name);

    try {
      const response = await fetch('/api/analyze-qpro', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      console.log('Analysis response:', data);
      console.log('Analysis result:', data.analysis?.analysisResult);
      
      // Set the analysis result - handle both object and string formats
      if (data.analysis) {
        const analysisText = data.analysis.analysisResult || data.analysis;
        setAnalysis(typeof analysisText === 'string' ? analysisText : JSON.stringify(analysisText, null, 2));
      }
      
      // Refresh the list of analyses
      fetchAnalyses();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisSelect = (analysisId: string) => {
    setSelectedAnalysis(analysisId === selectedAnalysis ? null : analysisId);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>QPRO Analysis Engine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Upload accomplished PDO forms</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                disabled={loading}
                aria-label="Upload accomplished PDO forms"
              />
              <span className="text-sm text-muted-foreground">Upload accomplished PDO forms</span>
            </div>
            
            <Button onClick={handleSubmit} disabled={!file || loading} className="w-full">
              {loading ? 'Analyzing...' : 'Analyze QPRO'}
            </Button>
          </div>
          
          {/* Current analysis result */}
          {analysis && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Analysis Results:</h3>
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>
          )}
          
          {/* Previously analyzed documents */}
          <div className="mt-8">
            <h3 className="font-semibold mb-3">Previous Analyses</h3>
            {analyses.length > 0 ? (
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnalysis === analysis.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnalysisSelect(analysis.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{analysis.documentTitle}</div>
                        <div className="text-sm text-gray-50">{analysis.document.fileName}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {selectedAnalysis === analysis.id && (
                      <div className="mt-3 p-3 bg-white border rounded">
                        <h4 className="font-medium mb-2">Analysis:</h4>
                        <div className="whitespace-pre-wrap text-sm">{analysis.analysisResult}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No previous analyses found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}