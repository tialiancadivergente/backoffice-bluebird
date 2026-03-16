import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LayoutDashboard, Target } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Target, label: "Lead Capture", href: "/lead-capture" },
];

const sidebarVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
};

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col relative shrink-0"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-bold text-xl tracking-tight text-sidebar-primary"
            >
              CORE.
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent/20 transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              cn(
71:                 "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
72:                 isActive
73:                   ? "bg-sidebar-accent/15 text-sidebar-foreground"
74:                   : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-accent" : "group-hover:text-accent"
                  )}
                />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-accent">A</span>
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@core.app</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
