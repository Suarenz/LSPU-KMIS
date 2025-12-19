"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2, FileText, FileSpreadsheet, FileImage, File } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Document } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import AuthService from "@/lib/services/auth-service";

// Helper to get file icon based on extension
const getFileIcon = (title: string) => {
  const ext = title.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'doc':
    case 'docx':
      return { icon: FileText, color: '#2B4385' };
    case 'xls':
    case 'xlsx':
      return { icon: FileSpreadsheet, color: '#2E8B57' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return { icon: FileImage, color: '#C04E3A' };
    case 'pdf':
      return { icon: FileText, color: '#EF4444' };
    default:
      return { icon: File, color: '#6B7280' };
  }
};

// Helper to get clean title without extension
const getCleanTitle = (title: string) => {
  const parts = title.split('.');
  if (parts.length > 1) {
    parts.pop(); // Remove extension
    return parts.join('.');
  }
  return title;
};

const DocumentCard = ({ doc, delay }: { doc: any; delay?: number }) => {
  const style = delay !== undefined ? { animationDelay: `${delay}s` } : {};
  const { icon: FileIcon, color } = getFileIcon(doc.title);
  const cleanTitle = getCleanTitle(doc.title);
  
  return (
    <Card
      key={doc.id}
      className="animate-fade-in hover:shadow-lg transition-shadow border-0 bg-white"
      style={style}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-gray-50" style={{ color }}>
            <FileIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle 
              className="text-lg line-clamp-1 text-gray-900" 
              title={doc.title}
            >
              {cleanTitle}
            </CardTitle>
            <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1" style={{minWidth: '40px'}}>
            <Download className="w-4 h-4" style={{color: '#2B4385'}} aria-hidden="true" />
            <span>{doc.downloadsCount || doc.downloads || 0}</span>
          </div>
          <div className="flex items-center gap-1" style={{minWidth: '40px'}}>
            <Eye className="w-4 h-4" style={{color: '#2E8B57'}} aria-hidden="true" />
            <span>{doc.viewsCount || doc.views || 0}</span>
          </div>
          <div className="ml-auto">
            <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(43, 67, 133, 0.1)', color: '#2B4385' }}>{doc.category}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DocumentsSection() {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        // First, verify that we have a valid authentication state
        if (!user) {
          // If not authenticated, don't make the API call
          return;
        }

        // Get the access token to ensure it's still valid
        const token = await AuthService.getAccessToken();
        if (!token) {
          // If no token is available despite being authenticated, log out the user
          await AuthService.logout();
          return;
        }

        // Get recent documents from the API
        const response = await fetch(`/api/documents?page=1&limit=4&sort=uploadedAt&order=desc`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRecentDocuments(data.documents || []);
        } else if (response.status === 401) {
          // If we get a 401 (unauthorized) error, the token might have expired
          console.error('Authentication token expired, logging out user');
          // Log out the user since token is no longer valid
          await AuthService.logout();
        } else {
          console.error('Failed to fetch recent documents:', response.status);
          setRecentDocuments([]);
        }
      } catch (error) {
        console.error('Error fetching recent documents:', error);
        setRecentDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecentDocuments();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mb-4" style={{color: '#2B4385'}} />
        <p className="text-gray-500">Loading recent documents...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Recent Documents</h2>
        <Link href="/repository">
          <Button 
            variant="outline" 
            style={{ borderColor: '#2B4385', color: '#2B4385' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2B4385';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#2B4385';
            }}
          >
            View All
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentDocuments.length > 0 ? (
          recentDocuments.map((doc, index) => (
            <DocumentCard key={doc.id} doc={doc} delay={index * 0.1} />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500 bg-white rounded-xl">
            No recent documents available
          </div>
        )}
      </div>
    </div>
  );
}