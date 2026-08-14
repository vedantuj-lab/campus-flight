import { isFirebaseConfigured } from "@/lib/firebase/client";
import type { CollectionName } from "@/lib/firebase/schema";

/**
 * Storage contract shared by the demo store and a future Firestore adapter.
 * Each `CollectionName` maps to one Firestore collection; the local adapter
 * keeps the whole collection in a single browser-storage entry.
 */
export interface CampusRepository {
  kind: "local" | "firestore";
  read<T>(collection: CollectionName, fallback: T): T;
  write<T>(collection: CollectionName, value: T): void;
  clear(collection: CollectionName): void;
}

const KEY = (collection: CollectionName) => `c3d:${collection}`;

class LocalCampusRepository implements CampusRepository {
  kind = "local" as const;

  read<T>(collection: CollectionName, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(KEY(collection));
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  write<T>(collection: CollectionName, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY(collection), JSON.stringify(value));
    } catch {
      /* storage full or blocked — the app keeps working from memory */
    }
  }

  clear(collection: CollectionName): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(KEY(collection));
    } catch {
      /* ignore */
    }
  }
}

let repository: CampusRepository | null = null;

export function getRepository(): CampusRepository {
  if (!repository) repository = new LocalCampusRepository();
  return repository;
}

export const usingFirestore = () => isFirebaseConfigured();
