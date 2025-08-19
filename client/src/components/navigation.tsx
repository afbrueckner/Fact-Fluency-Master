import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Eye, Route, Gamepad2, ClipboardCheck, Star, Home } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/quick-looks", label: "Quick Looks", icon: Eye },
    { href: "/learning-path", label: "Learning Path", icon: Route },
    { href: "/games", label: "Math Games", icon: Gamepad2 },
    { href: "/assessment", label: "Assessment", icon: ClipboardCheck },
    { href: "/student-rewards", label: "My Avatar & Rewards", icon: Star },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}