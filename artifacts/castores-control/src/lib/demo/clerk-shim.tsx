/**
 * Shim de @clerk/react para modo demo standalone.
 *
 * Estrategia: cada hook devuelve un Proxy. Propiedades conocidas tienen
 * valores reales (isLoaded=true, isSignedIn=true, user object). Cualquier
 * otro acceso devuelve una función no-op async para que las llamadas
 * dinámicas como `clerk.openSignIn()`, `user.reload()`, etc. no truenen
 * con "TypeError: e is not a function".
 */
import type { ReactNode } from "react";

const DEMO_USER_ID = "user_demo_admin";
const DEMO_EMAIL = "admin@moran.demo";

const noopAsync = async (..._args: unknown[]) => null;
const noopSync = (..._args: unknown[]) => undefined;

/** Crea un proxy que devuelve valores conocidos y cae a noop para el resto. */
function demoProxy<T extends Record<string, unknown>>(base: T): T {
  return new Proxy(base, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      if (prop === Symbol.iterator || prop === "then" || prop === "constructor") {
        return undefined;
      }
      if (typeof prop === "string" && prop.startsWith("__react")) {
        return undefined;
      }
      // Acceso desconocido → función no-op async (cubre signOut, reload,
      // update, openSignIn, openSignUp, setActive, getToken, etc.)
      return noopAsync;
    },
  }) as T;
}

const DEMO_USER = demoProxy({
  id: DEMO_USER_ID,
  primaryEmailAddress: demoProxy({
    emailAddress: DEMO_EMAIL,
    id: "ea_demo",
    verification: demoProxy({ status: "verified" }),
  }),
  emailAddresses: [
    demoProxy({ emailAddress: DEMO_EMAIL, id: "ea_demo" }),
  ] as unknown as readonly unknown[],
  firstName: "Admin",
  lastName: "Demo",
  fullName: "Admin Demo",
  imageUrl: "",
  username: "admin.demo",
  publicMetadata: {},
  unsafeMetadata: {},
  phoneNumbers: [] as unknown[],
  externalAccounts: [] as unknown[],
  externalId: null,
  createdAt: new Date("2026-01-15T10:00:00.000Z"),
  updatedAt: new Date("2026-01-15T10:00:00.000Z"),
  lastSignInAt: new Date(),
});

// ===========================================================================
// Components
// ===========================================================================

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignedIn({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignedOut(_props: { children: ReactNode }) {
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

export function RedirectToSignUp() {
  return null;
}

export function ClerkLoaded({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function ClerkLoading(_props: { children: ReactNode }) {
  return null;
}

export function UserButton() {
  return null;
}

export function UserProfile() {
  return null;
}

export function OrganizationSwitcher() {
  return null;
}

export function Protect({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// ===========================================================================
// Hooks
// ===========================================================================

export function useUser() {
  return demoProxy({
    isLoaded: true,
    isSignedIn: true,
    user: DEMO_USER,
  });
}

export function useAuth() {
  return demoProxy({
    isLoaded: true,
    isSignedIn: true,
    userId: DEMO_USER_ID,
    sessionId: "sess_demo",
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: () => true,
    getToken: async (..._args: unknown[]) => "demo-token",
    signOut: async (..._args: unknown[]) => {
      try {
        localStorage.removeItem("castores_real_user");
      } catch { /* ignore */ }
      window.location.href = "/";
    },
  });
}

export function useClerk() {
  return demoProxy({
    loaded: true,
    user: DEMO_USER,
    session: demoProxy({ id: "sess_demo", user: DEMO_USER }),
    openSignIn: noopSync,
    openSignUp: noopSync,
    openUserProfile: noopSync,
    openOrganizationProfile: noopSync,
    closeSignIn: noopSync,
    closeSignUp: noopSync,
    setActive: noopAsync,
    signOut: async (..._args: unknown[]) => {
      try {
        localStorage.removeItem("castores_real_user");
      } catch { /* ignore */ }
      window.location.href = "/";
    },
    redirectToSignIn: noopSync,
    redirectToSignUp: noopSync,
    redirectToUserProfile: noopSync,
    redirectToHomeUrl: noopSync,
    navigate: noopSync,
  });
}

export function useSession() {
  return demoProxy({
    isLoaded: true,
    isSignedIn: true,
    session: demoProxy({ id: "sess_demo", user: DEMO_USER }),
  });
}

export function useSessionList() {
  return demoProxy({
    isLoaded: true,
    sessions: [] as unknown[],
    setActive: noopAsync,
  });
}

export function useOrganization() {
  return demoProxy({
    isLoaded: true,
    organization: null,
    membership: null,
  });
}

export function useOrganizationList() {
  return demoProxy({
    isLoaded: true,
    organizationList: [] as unknown[],
    userMemberships: { data: [] as unknown[], isLoading: false },
  });
}

export function useSignIn() {
  return demoProxy({
    isLoaded: true,
    signIn: demoProxy({
      status: null,
      create: noopAsync,
      attemptFirstFactor: noopAsync,
      prepareFirstFactor: noopAsync,
      attemptSecondFactor: noopAsync,
      prepareSecondFactor: noopAsync,
    }),
    setActive: noopAsync,
  });
}
