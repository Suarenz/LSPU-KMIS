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
  const isZero = stat.value === "0";
  
  return (
    <Card
      key={stat.title}
      className="animate-fade-in hover:shadow-lg transition-shadow border-0 bg-white h-full"
      style={style}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 max-w-[70%] truncate">{stat.title}</CardTitle>
        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
          {Icon ? (
            <Icon className={`w-5 h-5 ${stat.color}`} aria-hidden="true" style={{minWidth: '20px', minHeight: '20px'}} />
          ) : (
            <div className="w-5 h-5 bg-gray-200 rounded-sm flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 3a2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
              </svg>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isZero ? (
          <div className="text-lg text-gray-400 font-medium">No data yet</div>
        ) : (
          <div className="text-3xl font-bold text-gray-900 truncate">{stat.value}</div>
        )}
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
          // If no token is available, set default stats and stop loading
          setStats([
            {
              title: "Total Documents",
              value: "0",
              icon: FileText,
              color: "#2B4385",
              bgColor: "rgba(43, 67, 133, 0.1)",
            },
            {
              title: "Total Users",
              value: "0",
              icon: Users,
              color: "#2E8B57",
              bgColor: "rgba(46, 139, 87, 0.1)",
            },
            {
              title: "Total Downloads",
              value: "0",
              icon: Download,
              color: "#C04E3A",
              bgColor: "rgba(192, 78, 58, 0.1)",
            },
            {
              title: "Total Views",
              value: "0",
              icon: Eye,
              color: "#2B4385",
              bgColor: "rgba(43, 67, 133, 0.1)",
            },
          ]);
          setLoading(false);
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
              color: "#2B4385",
              bgColor: "rgba(43, 67, 133, 0.1)",
            },
            {
              title: "Total Users",
              value: data.totalUsers.toLocaleString(),
              icon: Users,
              color: "#2E8B57",
              bgColor: "rgba(46, 139, 87, 0.1)",
            },
            {
              title: "Total Downloads",
              value: data.totalDownloads.toLocaleString(),
              icon: Download,
              color: "#C04E3A",
              bgColor: "rgba(192, 78, 58, 0.1)",
            },
            {
              title: "Total Views",
              value: data.totalViews.toLocaleString(),
              icon: Eye,
              color: "#2B4385",
              bgColor: "rgba(43, 67, 133, 0.1)",
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
              color: "#2B4385",
              bgColor: "rgba(43, 67, 133, 0.1)",
            },
            {
              title: "Your Downloads",
              value: "0",
              icon: Download,
              color: "#2E8B57",
              bgColor: "rgba(46, 139, 87, 0.1)",
            },
            {
              title: "Your Views",
              value: "0",
              icon: Eye,
              color: "#C04E3A",
              bgColor: "rgba(192, 78, 58, 0.1)",
            },
            {
              title: "Access Level",
              value: userData?.role || "User",
              icon: Users,
              color: "#2B4385",
              bgColor: "rgba(43, 67, 133, 0.1)",
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
              color: "#2B4385",
              bgColor: "rgba(43, 67, 133, 0.1)",
            },
            {
              title: "Total Users",
              value: "0",
              icon: Users,
              color: "#2E8B57",
              bgColor: "rgba(46, 139, 87, 0.1)",
            },
            {
              title: "Total Downloads",
              value: "0",
              icon: Download,
              color: "#C04E3A",
              bgColor: "rgba(192, 78, 58, 0.1)",
            },
            {
              title: "Total Views",
              value: "0",
              icon: Eye,
              color: "#2B4385",
              bgColor: "rgba(43, 67, 133, 0.1)",
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
            color: "#2B4385",
            bgColor: "rgba(43, 67, 133, 0.1)",
          },
          {
            title: "Total Users",
            value: "0",
            icon: Users,
            color: "#2E8B57",
            bgColor: "rgba(46, 139, 87, 0.1)",
          },
          {
            title: "Total Downloads",
            value: "0",
            icon: Download,
            color: "#C04E3A",
            bgColor: "rgba(192, 78, 58, 0.1)",
          },
          {
            title: "Total Views",
            value: "0",
            icon: Eye,
            color: "#2B4385",
            bgColor: "rgba(43, 67, 133, 0.1)",
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
          <Card key={index} className="border-0 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Loading...</CardTitle>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gray-100 rounded w-3/4 h-8"></div>
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
