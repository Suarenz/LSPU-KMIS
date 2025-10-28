"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Download, Eye } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay?: number;
}

const StatCard = ({ stat, delay }: { stat: StatCardProps; delay: number }) => {
  const Icon = stat.icon;
  const style = { animationDelay: `${delay}s` };
  return (
    <Card
      key={stat.title}
      className="animate-fade-in hover:shadow-lg transition-shadow"
      style={style}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
        <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${stat.color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
      </CardContent>
    </Card>
  );
};

export default function StatsSection() {
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          const newStats = [
            {
              title: "Total Documents",
              value: data.totalDocuments.toLocaleString(),
              icon: FileText,
              color: "text-primary",
              bgColor: "bg-primary/10",
            },
            {
              title: "Total Users",
              value: data.totalUsers.toLocaleString(),
              icon: Users,
              color: "text-secondary",
              bgColor: "bg-secondary/10",
            },
            {
              title: "Total Downloads",
              value: data.totalDownloads.toLocaleString(),
              icon: Download,
              color: "text-accent",
              bgColor: "bg-accent/10",
            },
            {
              title: "Total Views",
              value: data.totalViews.toLocaleString(),
              icon: Eye,
              color: "text-primary",
              bgColor: "bg-primary/10",
            },
          ];
          setStats(newStats);
        } else {
          console.error('Failed to fetch stats:', response.status);
          // Set default stats if API call fails
          setStats([
            {
              title: "Total Documents",
              value: "0",
              icon: FileText,
              color: "text-primary",
              bgColor: "bg-primary/10",
            },
            {
              title: "Total Users",
              value: "0",
              icon: Users,
              color: "text-secondary",
              bgColor: "bg-secondary/10",
            },
            {
              title: "Total Downloads",
              value: "0",
              icon: Download,
              color: "text-accent",
              bgColor: "bg-accent/10",
            },
            {
              title: "Total Views",
              value: "0",
              icon: Eye,
              color: "text-primary",
              bgColor: "bg-primary/10",
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default stats if there's an error
        setStats([
          {
            title: "Total Documents",
            value: "0",
            icon: FileText,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            title: "Total Users",
            value: "0",
            icon: Users,
            color: "text-secondary",
            bgColor: "bg-secondary/10",
          },
          {
            title: "Total Downloads",
            value: "0",
            icon: Download,
            color: "text-accent",
            bgColor: "bg-accent/10",
          },
          {
            title: "Total Views",
            value: "0",
            icon: Eye,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-muted rounded w-3/4 h-6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} stat={stat} delay={index * 0.1} />
      ))}
    </div>
  );
}