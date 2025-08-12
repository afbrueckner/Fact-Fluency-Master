import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-home" },
    { path: "/learning-path", label: "Learning Path", icon: "fas fa-route" },
    { path: "/quick-looks", label: "Quick Looks", icon: "fas fa-eye" },
    { path: "/games", label: "Games", icon: "fas fa-gamepad" },
    { path: "/assessment", label: "Assessment", icon: "fas fa-chart-line" },
  ];

  return (
    <nav className="bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "py-3 px-2 border-b-2 text-sm font-medium whitespace-nowrap transition-opacity",
                location === item.path
                  ? "border-white"
                  : "border-transparent hover:border-white opacity-75 hover:opacity-100"
              )}
            >
              <i className={`${item.icon} mr-2`}></i>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
