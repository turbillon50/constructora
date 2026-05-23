/**
 * Mock API layer para el demo MORÁN standalone.
 *
 * Intercepta window.fetch para cualquier path que coincida con /api/* y
 * responde con datos seed (lib/demo/seed-data). Implementa los endpoints
 * que la PWA consume para que toda la navegación funcione sin backend.
 *
 * Endpoints no listados aquí responden { ok: true } o [] como fallback
 * no-op para que ningún componente truene buscando una respuesta.
 */
import {
  DEMO_ACTIVITY,
  DEMO_ADMIN,
  DEMO_CONTENT,
  DEMO_DOCUMENTS,
  DEMO_LOGS,
  DEMO_MATERIALS,
  DEMO_NOTIFICATIONS,
  DEMO_PERMISSIONS,
  DEMO_PROJECTS,
  DEMO_USERS,
  buildDashboardSummary,
} from "./seed-data";

type Handler = (req: {
  method: string;
  pathname: string;
  search: URLSearchParams;
  body: unknown;
  pathParams: Record<string, string>;
}) => unknown;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

const routes: Route[] = [];

function register(method: string, pattern: string, handler: Handler): void {
  const paramNames: string[] = [];
  const regexSrc =
    "^" +
    pattern.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    }) +
    "$";
  routes.push({ method, pattern: new RegExp(regexSrc), paramNames, handler });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// ============================================================
// AUTH / USER PROFILE
// ============================================================
const ADMIN_WITH_STATUS = { ...DEMO_ADMIN, approvalStatus: "approved" as const };
register("GET", "/api/auth/clerk-me", () => ADMIN_WITH_STATUS);
register("POST", "/api/auth/clerk-me", () => ADMIN_WITH_STATUS);
register("POST", "/api/auth/clerk-register", () => ({ ok: true, user: ADMIN_WITH_STATUS }));
register("GET", "/api/auth/me-permissions", () => DEMO_PERMISSIONS);
register("POST", "/api/auth/admin-access", () => ({ ok: true }));
register("POST", "/api/auth/invite-login", () => ({ ok: true, ticket: "demo-ticket" }));
register("POST", "/api/auth/forgot-password", () => ({ ok: true, sent: true }));
register("POST", "/api/auth/reset-password", () => ({ ok: true }));
register("POST", "/api/auth/logout", () => ({ ok: true }));

// ============================================================
// USERS
// ============================================================
register("GET", "/api/users", () => DEMO_USERS);
register("GET", "/api/users/me", () => DEMO_ADMIN);
register("PATCH", "/api/users/me", ({ body }) => ({ ...DEMO_ADMIN, ...(body as object) }));
register("GET", "/api/users/:id", ({ pathParams }) => {
  const u = DEMO_USERS.find((u) => u.id === Number(pathParams.id));
  return u ?? { error: "not_found" };
});
register("PATCH", "/api/users/:id", ({ pathParams, body }) => {
  const u = DEMO_USERS.find((u) => u.id === Number(pathParams.id));
  return u ? { ...u, ...(body as object) } : { error: "not_found" };
});
register("POST", "/api/users/:id/approve", () => ({ ok: true }));
register("POST", "/api/users/:id/reject", () => ({ ok: true }));
register("POST", "/api/users/:id/send-password-reset", () => ({ ok: true, sent: true }));

// ============================================================
// PROJECTS
// ============================================================
register("GET", "/api/projects", () => DEMO_PROJECTS);
register("GET", "/api/projects/:id", ({ pathParams }) => {
  const p = DEMO_PROJECTS.find((p) => p.id === Number(pathParams.id));
  return p ?? { error: "not_found" };
});
register("GET", "/api/projects/:id/progress", ({ pathParams }) => {
  const p = DEMO_PROJECTS.find((p) => p.id === Number(pathParams.id));
  if (!p) return { error: "not_found" };
  return {
    projectId: p.id,
    progressPct: p.progressPct,
    budgetTotal: p.budgetTotal,
    budgetSpent: p.budgetSpent,
    budgetPct: Math.round((p.budgetSpent / p.budgetTotal) * 100),
    daysElapsed: Math.floor(
      (Date.now() - new Date(p.startDate).getTime()) / 86_400_000,
    ),
    daysRemaining: Math.max(
      0,
      Math.floor(
        (new Date(p.targetDate).getTime() - Date.now()) / 86_400_000,
      ),
    ),
  };
});
register("POST", "/api/projects", ({ body }) => {
  const created = { id: Date.now(), ...(body as object) };
  return created;
});
register("PATCH", "/api/projects/:id", ({ pathParams, body }) => {
  const p = DEMO_PROJECTS.find((p) => p.id === Number(pathParams.id));
  return p ? { ...p, ...(body as object) } : { error: "not_found" };
});
register("DELETE", "/api/projects/:id", () => ({ ok: true }));
register("GET", "/api/projects/:id/assignments", () => [
  { userId: 2, role: "supervisor" },
  { userId: 4, role: "client" },
]);
register("POST", "/api/projects/:id/assignments", () => ({ ok: true }));
register("DELETE", "/api/projects/:id/assignments/:userId", () => ({ ok: true }));

// ============================================================
// LOGS (bitácora)
// ============================================================
register("GET", "/api/logs", ({ search }) => {
  const projectId = search.get("projectId");
  if (projectId) {
    return DEMO_LOGS.filter((l) => l.projectId === Number(projectId));
  }
  return DEMO_LOGS;
});
register("GET", "/api/logs/:id", ({ pathParams }) => {
  const l = DEMO_LOGS.find((l) => l.id === Number(pathParams.id));
  return l ?? { error: "not_found" };
});
register("POST", "/api/logs", ({ body }) => ({
  id: Date.now(),
  ...(body as object),
  createdAt: new Date().toISOString(),
}));
register("PATCH", "/api/logs/:id", ({ pathParams, body }) => {
  const l = DEMO_LOGS.find((l) => l.id === Number(pathParams.id));
  return l ? { ...l, ...(body as object) } : { error: "not_found" };
});
register("DELETE", "/api/logs/:id", () => ({ ok: true }));
register("POST", "/api/logs/:id/signatures", () => ({ ok: true }));

// ============================================================
// MATERIALS
// ============================================================
register("GET", "/api/materials", ({ search }) => {
  const projectId = search.get("projectId");
  const status = search.get("status");
  let result = DEMO_MATERIALS;
  if (projectId) result = result.filter((m) => m.projectId === Number(projectId));
  if (status) result = result.filter((m) => m.status === status);
  return result;
});
register("GET", "/api/materials/:id", ({ pathParams }) => {
  const m = DEMO_MATERIALS.find((m) => m.id === Number(pathParams.id));
  return m ?? { error: "not_found" };
});
register("GET", "/api/materials/alerts", () =>
  DEMO_MATERIALS.filter((m) => m.status === "pending").map((m) => ({
    materialId: m.id,
    projectId: m.projectId,
    projectName: m.projectName,
    materialName: m.name,
    alertType: "pending_approval",
    severity: (m.totalCost ?? 0) > 500000 ? "high" : "medium",
    message: `Pendiente: ${m.name} ($${(m.totalCost ?? 0).toLocaleString("es-MX")})`,
    createdAt: m.createdAt,
  })),
);
register("GET", "/api/materials/stats", () => {
  const approved = DEMO_MATERIALS.filter((m) => m.status === "approved");
  const pending = DEMO_MATERIALS.filter((m) => m.status === "pending");
  return {
    totalCount: DEMO_MATERIALS.length,
    approvedCount: approved.length,
    pendingCount: pending.length,
    approvedTotal: approved.reduce((s, m) => s + m.totalCost, 0),
    pendingTotal: pending.reduce((s, m) => s + m.totalCost, 0),
  };
});
register("POST", "/api/materials", ({ body }) => ({
  id: Date.now(),
  ...(body as object),
  status: "pending",
  createdAt: new Date().toISOString(),
}));
register("PATCH", "/api/materials/:id", ({ pathParams, body }) => {
  const m = DEMO_MATERIALS.find((m) => m.id === Number(pathParams.id));
  return m ? { ...m, ...(body as object) } : { error: "not_found" };
});
register("DELETE", "/api/materials/:id", () => ({ ok: true }));
register("POST", "/api/materials/:id/approve", () => ({ ok: true, status: "approved" }));
register("POST", "/api/materials/:id/reject", () => ({ ok: true, status: "rejected" }));

// ============================================================
// MATERIAL NOTES
// ============================================================
register("GET", "/api/material-notes", () => []);
register("POST", "/api/material-notes", ({ body }) => ({
  id: Date.now(),
  ...(body as object),
  createdAt: new Date().toISOString(),
}));
register("PATCH", "/api/material-notes/:id", ({ body }) => ({ id: 0, ...(body as object) }));
register("DELETE", "/api/material-notes/:id", () => ({ ok: true }));

// ============================================================
// DOCUMENTS
// ============================================================
register("GET", "/api/documents", ({ search }) => {
  const projectId = search.get("projectId");
  return projectId
    ? DEMO_DOCUMENTS.filter((d) => d.projectId === Number(projectId))
    : DEMO_DOCUMENTS;
});
register("POST", "/api/documents", ({ body }) => ({
  id: Date.now(),
  ...(body as object),
  createdAt: new Date().toISOString(),
}));
register("DELETE", "/api/documents/:id", () => ({ ok: true }));

// ============================================================
// REPORTS
// ============================================================
register("GET", "/api/reports", () => []);
register("POST", "/api/reports", ({ body }) => ({
  id: Date.now(),
  ...(body as object),
  generatedAt: new Date().toISOString(),
  status: "ready",
}));

// ============================================================
// DASHBOARD
// ============================================================
register("GET", "/api/dashboard", () => buildDashboardSummary());
register("GET", "/api/dashboard/summary", () => buildDashboardSummary());
register("GET", "/api/dashboard/activity", ({ search }) => {
  const limit = Number(search.get("limit") ?? 20);
  return DEMO_ACTIVITY.slice(0, limit);
});

// ============================================================
// NOTIFICATIONS
// ============================================================
register("GET", "/api/notifications", () => DEMO_NOTIFICATIONS);
register("GET", "/api/notifications/unread-count", () => ({
  unread: DEMO_NOTIFICATIONS.filter((n) => !n.isRead).length,
}));
register("POST", "/api/notifications/:id/read", () => ({ ok: true }));
register("POST", "/api/notifications/read-all", () => ({ ok: true }));
register("POST", "/api/notifications/send", () => ({ ok: true, sent: 1 }));

// ============================================================
// CONTENT (FAQ, terms, privacy, announcements)
// ============================================================
register("GET", "/api/content", ({ search }) => {
  const type = search.get("type") as keyof typeof DEMO_CONTENT;
  return DEMO_CONTENT[type] ?? [];
});
register("POST", "/api/content", ({ body }) => ({
  id: Date.now(),
  ...(body as object),
  createdAt: new Date().toISOString(),
}));
register("PATCH", "/api/content/:id", ({ body }) => ({ id: 0, ...(body as object) }));
register("DELETE", "/api/content/:id", () => ({ ok: true }));

// ============================================================
// ROLES / PERMISSIONS
// ============================================================
register("GET", "/api/roles", () => [
  { role: "admin", permissions: DEMO_PERMISSIONS.permissions },
  { role: "supervisor", permissions: {} },
  { role: "client", permissions: {} },
  { role: "worker", permissions: {} },
  { role: "proveedor", permissions: {} },
]);
register("PATCH", "/api/roles/:role", () => ({ ok: true }));

// ============================================================
// INVITATIONS
// ============================================================
register("GET", "/api/invitations", () => []);
register("POST", "/api/invitations", ({ body }) => ({
  id: Date.now(),
  code: "DEMO" + Math.random().toString(36).slice(2, 6).toUpperCase(),
  ...(body as object),
  createdAt: new Date().toISOString(),
}));
register("POST", "/api/invitations/validate", () => ({ ok: true, valid: true }));
register("DELETE", "/api/invitations/:id", () => ({ ok: true }));

// ============================================================
// PUSH
// ============================================================
register("GET", "/api/push/public-key", () => ({ publicKey: "" }));
register("GET", "/api/push/status", () => ({ subscribed: false }));
register("POST", "/api/push/subscribe", () => ({ ok: true }));
register("POST", "/api/push/unsubscribe", () => ({ ok: true }));

// ============================================================
// AUDIT
// ============================================================
register("GET", "/api/audit", () => []);
register("GET", "/api/audit/users", () => []);

// ============================================================
// ATTENDANCE (Geocheck)
// ============================================================
register("GET", "/api/attendance/workers", () => []);
register("GET", "/api/attendance", () => []);
register("GET", "/api/attendance/checks", () => []);
register("POST", "/api/attendance/check", () => ({ ok: true }));

// ============================================================
// HEALTH
// ============================================================
register("GET", "/api/healthz", () => ({
  ok: true,
  demoMode: true,
  databaseConfigured: false,
  clerkConfigured: false,
}));

// ============================================================
// CATCH-ALL: noop
// ============================================================
register("GET", "/api/.*", () => []);
register("POST", "/api/.*", () => ({ ok: true }));
register("PATCH", "/api/.*", () => ({ ok: true }));
register("PUT", "/api/.*", () => ({ ok: true }));
register("DELETE", "/api/.*", () => ({ ok: true }));

function findRoute(
  method: string,
  pathname: string,
): { route: Route; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    const m = pathname.match(route.pattern);
    if (m) {
      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      return { route, params };
    }
  }
  return null;
}

async function handle(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  let urlStr: string;
  let method: string;
  let body: unknown = undefined;

  if (typeof input === "string") {
    urlStr = input;
    method = (init?.method ?? "GET").toUpperCase();
  } else if (input instanceof URL) {
    urlStr = input.toString();
    method = (init?.method ?? "GET").toUpperCase();
  } else {
    urlStr = input.url;
    method = input.method.toUpperCase();
  }

  const url = new URL(urlStr, window.location.origin);

  // Sólo interceptamos requests al mismo origen o relativos a /api/
  const isSameOrigin = url.origin === window.location.origin;
  const isApiPath = url.pathname.startsWith("/api/");

  if (!isApiPath) return null;
  if (!isSameOrigin) {
    // Si hay VITE_API_BASE_URL apuntando a otro host pero estamos en demo,
    // igual interceptamos /api/* (no debería usarse en demo, pero defensivo)
    if (!urlStr.includes("/api/")) return null;
  }

  // Extraer body si lo hay
  if (init?.body) {
    if (typeof init.body === "string") {
      try { body = JSON.parse(init.body); } catch { body = init.body; }
    }
  } else if (input instanceof Request) {
    try { body = await input.clone().json(); } catch { body = undefined; }
  }

  const match = findRoute(method, url.pathname);
  if (!match) {
    return jsonResponse({ ok: true, demoMode: true, hint: "no_handler" });
  }

  try {
    const result = await match.route.handler({
      method,
      pathname: url.pathname,
      search: url.searchParams,
      body,
      pathParams: match.params,
    });
    return jsonResponse(result ?? { ok: true });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, 500);
  }
}

let installed = false;

export function installDemoApi(): void {
  if (installed) return;
  installed = true;

  const origFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const mocked = await handle(input, init);
    if (mocked) return mocked;
    return origFetch(input as RequestInfo, init);
  };

  // eslint-disable-next-line no-console
  console.info(
    "%c[DEMO MODE]%c Mock API instalado — todas las llamadas a /api/* responden con datos seed.",
    "background:#000;color:#fff;padding:2px 6px;border-radius:3px;font-weight:bold;",
    "color:#666;",
  );
}
