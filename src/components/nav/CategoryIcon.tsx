import {
  Accessibility,
  Bus,
  Building2,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { PlaceCategory } from "@/types/campus";

const map = {
  academic: GraduationCap,
  food: Utensils,
  emergency: HeartPulse,
  transport: Bus,
  sports: Dumbbell,
  administration: Building2,
  accessibility: Accessibility,
  residence: Home,
  recreation: Sparkles,
} satisfies Record<PlaceCategory, typeof GraduationCap>;

export function CategoryIcon({
  category,
  className = "h-4 w-4",
}: {
  category: PlaceCategory;
  className?: string;
}) {
  const Icon = map[category] ?? GraduationCap;
  return <Icon className={className} aria-hidden />;
}

export function categoryLabel(category: PlaceCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export const categories: PlaceCategory[] = [
  "academic",
  "food",
  "emergency",
  "transport",
  "sports",
  "administration",
  "accessibility",
  "residence",
  "recreation",
];
