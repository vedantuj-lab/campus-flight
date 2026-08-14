import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { destinations } from "@/lib/campus/search";
import { useNavigator } from "@/lib/state";
import { CategoryIcon, categories, categoryLabel } from "@/components/nav/CategoryIcon";
import { crowdTone } from "@/components/nav/tone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/places")({
  head: () => ({
    meta: [
      { title: "Campus Places — Campus3D Navigator" },
      { name: "description", content: "Browse academic, food, emergency, sports and transport places across campus." },
      { property: "og:title", content: "Campus Places — Campus3D Navigator" },
      { property: "og:description", content: "Every campus place with hours, crowd level and accessibility." },
    ],
  }),
  component: PlacesPage,
});

function PlacesPage() {
  const { selectDestination, crowdFor } = useNavigator();
  const navigate = useNavigate();
  const [cat, setCat] = useState<string>("all");
  const list = destinations.filter((d) => (cat === "all" ? true : d.category === cat));

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <h1 className="text-xl font-semibold">Campus places</h1>
      <p className="text-sm text-muted-foreground">{destinations.length} indexed destinations</p>
      <div className="my-4 flex flex-wrap gap-2">
        {["all", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              cat === c ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c === "all" ? "All" : categoryLabel(c as never)}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => {
          const crowd = crowdFor(d.buildingId);
          return (
            <article key={d.id} className="glass animate-fade-in rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/60 text-primary">
                  <CategoryIcon category={d.category} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{d.name}</h2>
                  <p className="truncate text-[11px] text-muted-foreground">{d.subtitle}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{d.hours || "Hours vary"}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className={crowdTone(crowd.level)}>
                  {crowd.level} crowd
                </Badge>
                {d.accessible && (
                  <Badge variant="outline" className="border-success/40 text-success">
                    ♿ Accessible
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  selectDestination(d);
                  navigate({ to: "/app" });
                }}
              >
                Navigate
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
