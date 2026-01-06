import { useEffect, type ReactNode } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ListChecks, LogOut } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (
      !isAuthenticated &&
      location.pathname !== "/login" &&
      location.pathname !== "/signup"
    ) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Public pages don't need the layout
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">LeetCode Tracker</h1>
              <nav className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant={
                      location.pathname === "/dashboard" ? "default" : "ghost"
                    }
                    className="gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/trackers">
                  <Button
                    variant={
                      location.pathname === "/trackers" ? "default" : "ghost"
                    }
                    className="gap-2"
                  >
                    <ListChecks className="h-4 w-4" />
                    Trackers
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
