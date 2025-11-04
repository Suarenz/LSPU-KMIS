"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Document } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const DocumentCard = ({ doc, delay }: { doc: any; delay?: number }) => {
  const style = delay !== undefined ? { animationDelay: `${delay}s` } : {};
  return (
    <Card
      key={doc.id}
      className="animate-fade-in hover:shadow-lg transition-shadow"
      style={style}
    >
      <CardHeader>
        <CardTitle className="text-lg line-clamp-1">{doc.title}</CardTitle>
        <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" style={{minWidth: '40px'}}>
            <Download className="w-4 h-4 text-black" aria-hidden="true" style={{minWidth: '16px', minHeight: '16px'}} />
            <span>{doc.downloadsCount || doc.downloads || 0}</span>
          </div>
          <div className="flex items-center gap-1" style={{minWidth: '40px'}}>
            <Eye className="w-4 h-4 text-black" aria-hidden="true" style={{minWidth: '16px', minHeight: '16px'}} />
            <span>{doc.viewsCount || doc.views || 0}</span>
          </div>
          <div className="ml-auto">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{doc.category}</span>
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
        // Get recent documents from the API
        const response = await fetch(`/api/documents?page=1&limit=4&sort=uploadedAt&order=desc`);
        if (response.ok) {
          const data = await response.json();
          setRecentDocuments(data.documents || []);
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
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading recent documents...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Recent Documents</h2>
        <Link href="/repository">
          <Button variant="outline">View All</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentDocuments.length > 0 ? (
          recentDocuments.map((doc, index) => (
            <DocumentCard key={doc.id} doc={doc} delay={index * 0.1} />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No recent documents available
          </div>
        )}
      </div>
    </div>
  );
}