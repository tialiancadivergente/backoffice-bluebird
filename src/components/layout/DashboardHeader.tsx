import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border/50 flex items-center justify-end px-8 bg-background/50 backdrop-blur-md sticky top-0 z-10">
      <ThemeToggle />
    </header>
  );
}
