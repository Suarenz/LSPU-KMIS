"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "@/lib/types";
import AuthService from "@/lib/services/auth-service";
import { Upload, Pencil, Trash2, Eye, Download } from "lucide-react";

// Helper function to format dates in a readable way
const formatDate = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get icon based on activity type
const getActivityIcon = (description: string) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('upload') || lowerDesc.includes('added')) {
    return { icon: Upload, color: '#2B4385', bgColor: 'rgba(43, 67, 133, 0.1)' };
  }
  if (lowerDesc.includes('edit') || lowerDesc.includes('update') || lowerDesc.includes('modified')) {
    return { icon: Pencil, color: '#C04E3A', bgColor: 'rgba(192, 78, 58, 0.1)' };
  }
  if (lowerDesc.includes('delete') || lowerDesc.includes('removed')) {
    return { icon: Trash2, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
  }
  if (lowerDesc.includes('view')) {
    return { icon: Eye, color: '#2E8B57', bgColor: 'rgba(46, 139, 87, 0.1)' };
  }
  if (lowerDesc.includes('download')) {
    return { icon: Download, color: '#2B4385', bgColor: 'rgba(43, 67, 133, 0.1)' };
  }
  return { icon: Upload, color: '#2B4385', bgColor: 'rgba(43, 67, 133, 0.1)' };
};

const ActivityItem = ({ activity, delay }: { activity: Activity; delay?: number }) => {
  const style = delay !== undefined ? { animationDelay: `${delay}s` } : {};
  const { icon: Icon, color, bgColor } = getActivityIcon(activity.description);
  
  return (
    <div
      key={activity.id}
      className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0 animate-fade-in"
      style={style}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: bgColor}}>
        <Icon className="w-4 h-4" style={{color}} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">
          {activity.user} • {formatDate(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default function ActivitySection() {
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
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
          setRecentActivity(data.recentActivity || []);
        } else if (response.status === 401) {
          // If we get a 401 (unauthorized) error, the token might have expired
          console.error('Authentication token expired, logging out user');
          // Log out the user since token is no longer valid
          await AuthService.logout();
        } else if (response.status === 403) {
          // If we get a 403 (forbidden) error, user doesn't have permission
          console.error('User does not have permission to access recent activity');
          // Set empty array for users without permission
          setRecentActivity([]);
        } else {
          console.error('Failed to fetch recent activity:', response.status);
          // Set empty array if API call fails
          setRecentActivity([]);
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        // Set empty array if there's an error
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Recent Activity</h2>
        <Card className="border-0 bg-white">
          <CardContent className="pt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Recent Activity</h2>
      <Card className="border-0 bg-white">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem key={activity.id} activity={activity} delay={index * 0.1} />
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity to display.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}