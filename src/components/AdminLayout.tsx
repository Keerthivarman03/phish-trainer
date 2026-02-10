import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BarChart3, FolderOpen, LogOut, ShieldAlert, Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { to: "/admin", label: "Campaign Operations", icon: FolderOpen },
  { to: "/admin/analytics", label: "Intelligence & Data", icon: BarChart3 },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-blue-500 font-mono">
        <p>INITIALIZING SECURE ENVIRONMENT...</p>
      </div>
    );
  }

  // Common Sidebar Content
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800">
      <div className="flex items-center gap-3 border-b border-zinc-800 p-6">
        <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
          <ShieldAlert className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <span className="block font-bold text-white tracking-tight">PHISH COMMAND</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Secure Access</span>
        </div>
      </div>

      <div className="p-4 flex items-center gap-3 mb-2 mx-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-zinc-200 truncate">{user?.email}</p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Online
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 mt-2">Modules</p>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              location.pathname === item.to
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
            )}
          >
            <item.icon className={cn("h-4 w-4", location.pathname === item.to ? "text-blue-400" : "text-zinc-500")} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-900/10"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Terminate Session
        </Button>
      </div>
    </div>
  );

  return (
    <div className="dark min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-blue-500/30 flex">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-zinc-950 to-zinc-950 fixed" />

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed z-50 p-4 w-full flex justify-between items-center bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-blue-500" />
          <span className="font-bold text-white">PHISH COMMAND</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="border-zinc-700 bg-zinc-800 text-zinc-300">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-zinc-950 border-r border-zinc-800">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 md:pl-72 relative z-0">
        <div className="max-w-7xl mx-auto p-6 pt-20 md:pt-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
