import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { destinationById } from "@/lib/campus/search";
import { useNavigator } from "@/lib/state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Campus3D Navigator" },
      {
        name: "description",
        content: "Your saved campus destinations, one tap from a live 3D route.",
      },
      { property: "og:title", content: "Favorites — Campus3D Navigator" },
      {
        property: "og:description",
        content: "Frequent destinations saved for instant navigation.",
      },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, toggleFavorite, selectDestination, recents } = useNavigator();
  const navigate = useNavigate();

  const row = (id: string, fav: boolean) => {
    const d = destinationById(id);
    if (!d) return null;
    return (
      <article key={id} className="glass flex items-center gap-3 rounded-2xl p-4">
        <Star
          className={`h-4 w-4 ${fav ? "fill-warning text-warning" : "text-muted-foreground"}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{d.name}</h3>
          <p className="truncate text-[11px] text-muted-foreground">{d.subtitle}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            selectDestination(d);
            navigate({ to: "/app" });
          }}
        >
          Navigate
        </Button>
        <Button size="sm" variant="ghost" onClick={() => toggleFavorite(id)}>
          {fav ? "Remove" : "Save"}
        </Button>
      </article>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <h1 className="text-xl font-semibold">⭐ Frequent destinations</h1>
      <div className="mt-4 space-y-2">{favorites.map((f) => row(f, true))}</div>
      <h2 className="mt-8 text-sm font-semibold text-muted-foreground">Recent</h2>
      <div className="mt-2 space-y-2">{recents.map((r) => row(r, favorites.includes(r)))}</div>
    </div>
  );
}
