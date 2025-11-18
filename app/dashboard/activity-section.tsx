"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "@/lib/types";
import AuthService from "@/lib/services/auth-service";

const ActivityItem = ({ activity, delay }: { activity: Activity; delay?: number }) => {
  const style = delay !== undefined ? { animationDelay: `${delay}s` } : {};
  return (
    <div
      key={activity.id}
      className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0 animate-fade-in"
      style={style}
    >
      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.description}</p>
        <p className="text-xs text-muted-foreground">
          {activity.user} • {activity.timestamp.toLocaleString()}
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
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem key={activity.id} activity={activity} delay={index * 0.1} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity to display.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}