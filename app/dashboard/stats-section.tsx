"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Download, Eye } from "lucide-react";
import AuthService from "@/lib/services/auth-service";

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
      className="animate-fade-in hover:shadow-lg transition-shadow border-border/50 h-full"
      style={style}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground max-w-[70%] truncate">{stat.title}</CardTitle>
        <div className="flex-shrink-0">
          {Icon ? (
            <Icon className="w-5 h-5 text-black" aria-hidden="true" style={{minWidth: '20px', minHeight: '20px'}} />
          ) : (
            <div className="w-5 h-5 bg-muted-foreground/20 rounded-sm flex items-center justify-center">
              <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 3a2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
              </svg>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold truncate">{stat.value}</div>
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
        // Get the access token to ensure it's still valid
        const token = await AuthService.getAccessToken();
        if (!token) {
          // If no token is available, don't make the API call
          return;
        }

        const response = await fetch('/api/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
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
        } else if (response.status === 401) {
          // If we get a 401 (unauthorized) error, the token might have expired
          console.error('Authentication token expired, logging out user');
          // Log out the user since token is no longer valid
          await AuthService.logout();
        } else if (response.status === 403) {
          // If we get a 403 (forbidden) error, user doesn't have permission
          console.error('User does not have permission to access stats');
          // Get user role to display in access level
          const userData = await AuthService.getCurrentUser();
          // Set default stats for users without permission
          setStats([
            {
              title: "Your Documents",
              value: "0",
              icon: FileText,
              color: "text-primary",
              bgColor: "bg-primary/10",
            },
            {
              title: "Your Downloads",
              value: "0",
              icon: Download,
              color: "text-secondary",
              bgColor: "bg-secondary/10",
            },
            {
              title: "Your Views",
              value: "0",
              icon: Eye,
              color: "text-accent",
              bgColor: "bg-accent/10",
            },
            {
              title: "Access Level",
              value: userData?.role || "User",
              icon: Users,
              color: "text-primary",
              bgColor: "bg-primary/10",
            },
          ]);
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
          <Card key={index} className="border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
                <div className="w-5 h-5 bg-muted-foreground/20 rounded-sm flex items-center justify-center" style={{minWidth: '20px', minHeight: '20px'}}>
                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 0 01-2 2z"></path>
                  </svg>
                </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} stat={stat} delay={index * 0.1} />
      ))}
    </div>
  );
}
