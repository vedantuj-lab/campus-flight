import { Bell, Gamepad2, Menu, Satellite, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useNavigator, userGeo } from "@/lib/state";
import { SearchBar } from "@/components/nav/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { user, gpsLive, gpsMessage, demoMode, toggleDemoMode, indoorMode } = useNavigator();
  const geo = userGeo(user);
  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-3 rounded-none border-x-0 border-t-0 px-3 py-2.5 lg:px-5">
      <Link to="/app" className="lg:hidden" aria-label="Campus3D home">
        <Menu className="h-5 w-5" aria-hidden />
      </Link>
      <div className="min-w-0 flex-1">
        <SearchBar />
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full animate-pulse-ring rounded-full ${gpsLive ? "bg-success" : "bg-primary"}`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${gpsLive ? "bg-success" : "bg-primary"}`}
            />
          </span>
          <span className="text-[11px] leading-tight">
            <span className="block font-medium">
              {gpsLive ? "Live GPS" : indoorMode ? "Indoor positioning" : "Demo position"}
            </span>
            <span className="block text-muted-foreground">
              ±{user.accuracy.toFixed(1)} m · {geo.latitude.toFixed(5)}, {geo.longitude.toFixed(5)}
            </span>
          </span>
        </div>
        <Button
          variant={demoMode ? "default" : "outline"}
          size="sm"
          onClick={toggleDemoMode}
          className="gap-1.5"
        >
          <Gamepad2 className="h-4 w-4" aria-hidden />
          Demo mode
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-4.5 w-4.5" aria-hidden />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warning" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Campus alerts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="text-xs font-medium">🚧 Central walkway resurfacing</span>
            <span className="text-[11px] text-muted-foreground">Routes rerouted via Block A</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="text-xs font-medium">🍽️ Canteen crowd is high</span>
            <span className="text-[11px] text-muted-foreground">92% occupancy right now</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex-col items-start gap-0.5">
            <span className="text-xs font-medium">🛗 CE Block elevator online</span>
            <span className="text-[11px] text-muted-foreground">Accessible routes restored</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge variant="outline" className="hidden gap-1.5 border-primary/40 text-primary xl:flex">
        <Satellite className="h-3 w-3" aria-hidden />
        {gpsMessage}
      </Badge>

      <Link to="/app/profile" aria-label="Profile">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/60">
          <UserRound className="h-4 w-4" aria-hidden />
        </span>
      </Link>
    </header>
  );
}
