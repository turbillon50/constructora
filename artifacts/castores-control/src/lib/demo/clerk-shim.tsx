/**
 * Shim de @clerk/react para el modo demo standalone.
 *
 * Cuando VITE_DEMO_MODE=true, vite.config.ts aliasa "@clerk/react" a este
 * archivo. Provee implementaciones noop de los hooks/componentes que la app
 * consume directamente del SDK, así no necesitamos un ClerkProvider real ni
 * publishable key.
 *
 * El "usuario Clerk" siempre está signed-in como el admin demo seedeado en
 * lib/demo/mock-api.
 */
import type { ReactNode } from "react";

const DEMO_USER_ID = "user_demo_admin";
const DEMO_EMAIL = "admin@moran.demo";

const DEMO_USER = {
  id: DEMO_USER_ID,
  primaryEmailAddress: { emailAddress: DEMO_EMAIL },
  emailAddresses: [{ emailAddress: DEMO_EMAIL, id: "ea_demo" }],
  firstName: "Admin",
  lastName: "Demo",
  fullName: "Admin Demo",
  imageUrl: "",
};

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignedIn({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignedOut(_: { children: ReactNode }) {
  return null;
}

export function SignIn() {
  return null;
}

export function SignUp() {
  return null;
}

export function RedirectToSignIn() {
  return null;
}

export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: DEMO_USER,
  };
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: DEMO_USER_ID,
    sessionId: "sess_demo",
    getToken: async () => "demo-token",
    signOut: async () => {
      // En demo no se cierra sesión real; recargamos para resetear estado.
      window.location.href = "/";
    },
  };
}

export function useClerk() {
  return {
    signOut: async () => {
      window.location.href = "/";
    },
    openSignIn: () => {},
    openSignUp: () => {},
    setActive: async () => {},
  };
}

export function useSession() {
  return {
    isLoaded: true,
    isSignedIn: true,
    session: { id: "sess_demo", user: DEMO_USER },
  };
}
