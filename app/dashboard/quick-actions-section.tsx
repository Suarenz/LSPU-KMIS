"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Search, MessageSquare } from "lucide-react";
import Link from "next/link";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  delay?: number;
}

const QuickActionCard = ({ action, delay }: { action: QuickActionProps; delay?: number }) => {
  const Icon = action.icon;
  const style = delay !== undefined ? { animationDelay: `${delay}s` } : {};
  return (
    <Link key={action.title} href={action.href}>
      <Card
        className="animate-fade-in hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
        style={style}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-${action.color}/10 rounded-lg flex items-center justify-center`}>
              <Icon className={`w-6 h-6 text-${action.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default function QuickActionsSection() {
  const quickActions = [
    {
      title: "Browse Repository",
      description: "Explore documents and resources",
      icon: BookOpen,
      href: "/repository",
      color: "primary",
    },
    {
      title: "Search Knowledge",
      description: "Find what you need quickly",
      icon: Search,
      href: "/search",
      color: "secondary",
    },
    {
      title: "Join Discussions",
      description: "Collaborate with community",
      icon: MessageSquare,
      href: "/forums",
      color: "accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {quickActions.map((action, index) => (
        <QuickActionCard key={action.title} action={action} delay={index * 0.1} />
      ))}
    </div>
  );
}