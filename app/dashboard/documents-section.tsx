"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import Link from "next/link";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";

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
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {doc.downloads}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {doc.views}
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
  const recentDocuments = MOCK_DOCUMENTS.slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Recent Documents</h2>
        <Link href="/repository">
          <Button variant="outline">View All</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentDocuments.map((doc, index) => (
          <DocumentCard key={doc.id} doc={doc} delay={index * 0.1} />
        ))}
      </div>
    </div>
);
}