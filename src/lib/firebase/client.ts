/**
 * Firebase wiring.
 *
 * No keys are bundled with the demo. When the four public web-app values below
 * are provided through Vite env vars the app is considered "Firebase ready" and
 * `createFirestoreRepository()` can be implemented on top of the same
 * `CampusRepository` interface the local repository already satisfies:
 *
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_AUTH_DOMAIN
 */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  databaseURL?: string;
}

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const firebaseConfig: { [K in keyof FirebaseWebConfig]: string | undefined } = {
  apiKey: env["VITE_FIREBASE_API_KEY"],
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: env["VITE_FIREBASE_PROJECT_ID"],
  appId: env["VITE_FIREBASE_APP_ID"],
  databaseURL: env["VITE_FIREBASE_DATABASE_URL"],
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

export const persistenceLabel = () =>
  isFirebaseConfigured() ? "Firestore" : "Local demo store (Firestore-ready)";
