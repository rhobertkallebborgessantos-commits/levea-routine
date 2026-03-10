import { Home, Utensils, Leaf, TrendingUp, Trophy } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Início" },
  { to: "/meals", icon: Utensils, label: "Refeições" },
  { to: "/tea", icon: Leaf, label: "Chás" },
  { to: "/progress", icon: TrendingUp, label: "Progresso" },
  { to: "/achievements", icon: Trophy, label: "Conquistas" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground"
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
