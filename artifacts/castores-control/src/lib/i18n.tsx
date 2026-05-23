/**
 * i18n minimal sin dependencias externas.
 *
 * Sólo traduce las strings de chrome de la app (sidebar, header, botones
 * comunes, FAQ titles, footer). Las páginas internas mantienen su texto
 * en español. Es suficiente para que un demo en inglés se vea coherente
 * en la navegación principal.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "es" | "en";
const STORAGE_KEY = "moran_locale";

type Dict = Record<string, string>;

const DICT: Record<Locale, Dict> = {
  es: {
    "app.title": "Morán Control",
    "app.subtitle": "Sistema de gestión de obra",
    "nav.dashboard": "Inicio",
    "nav.projects": "Obras",
    "nav.bitacora": "Bitácora",
    "nav.materials": "Materiales",
    "nav.documents": "Documentos",
    "nav.reports": "Reportes",
    "nav.users": "Usuarios",
    "nav.notifications": "Notificaciones",
    "nav.admin": "Admin",
    "nav.account": "Mi cuenta",
    "nav.attendance": "Asistencia",
    "nav.faq": "Ayuda",
    "nav.explore": "Explorar",
    "common.signOut": "Cerrar sesión",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.approve": "Aprobar",
    "common.reject": "Rechazar",
    "common.back": "Atrás",
    "common.search": "Buscar",
    "common.loading": "Cargando…",
    "common.noData": "Sin datos",
    "common.viewAll": "Ver todas",
    "common.viewMore": "Ver más",
    "common.tapToEdit": "Tocar para editar",
    "status.active": "Activa",
    "status.completed": "Completada",
    "status.paused": "Pausada",
    "status.cancelled": "Cancelada",
    "status.pending": "Pendiente",
    "status.approved": "Aprobado",
    "status.rejected": "Rechazado",
    "stats.activeProjects": "Obras Activas",
    "stats.workers": "Trabajadores",
    "stats.workersField": "En campo",
    "stats.pendingMaterials": "Materiales Pend.",
    "stats.pendingApproval": "Por autorizar",
    "stats.budgetUsed": "Presupuesto Usado",
    "stats.executed": "En ejecución",
    "stats.noData": "Sin datos",
    "stats.budget": "Presupuesto",
    "stats.spent": "Gastado",
    "stats.keyStaff": "Personal Clave",
    "card.viewProject": "Ver Obra",
    "card.log": "Bitácora",
    "theme.light": "Día",
    "theme.dark": "Noche",
    "lang.es": "Español",
    "lang.en": "English",
    "footer.rights": "Todos los derechos reservados.",
    "footer.terms": "Términos",
    "footer.privacy": "Privacidad",
  },
  en: {
    "app.title": "Morán Control",
    "app.subtitle": "Construction management system",
    "nav.dashboard": "Dashboard",
    "nav.projects": "Projects",
    "nav.bitacora": "Site log",
    "nav.materials": "Materials",
    "nav.documents": "Documents",
    "nav.reports": "Reports",
    "nav.users": "Users",
    "nav.notifications": "Notifications",
    "nav.admin": "Admin",
    "nav.account": "Account",
    "nav.attendance": "Attendance",
    "nav.faq": "Help",
    "nav.explore": "Explore",
    "common.signOut": "Sign out",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.approve": "Approve",
    "common.reject": "Reject",
    "common.back": "Back",
    "common.search": "Search",
    "common.loading": "Loading…",
    "common.noData": "No data",
    "common.viewAll": "View all",
    "common.viewMore": "View more",
    "common.tapToEdit": "Tap to edit",
    "status.active": "Active",
    "status.completed": "Completed",
    "status.paused": "Paused",
    "status.cancelled": "Cancelled",
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "stats.activeProjects": "Active Projects",
    "stats.workers": "Workers",
    "stats.workersField": "On site",
    "stats.pendingMaterials": "Pending Materials",
    "stats.pendingApproval": "To approve",
    "stats.budgetUsed": "Budget Used",
    "stats.executed": "In progress",
    "stats.noData": "No data",
    "stats.budget": "Budget",
    "stats.spent": "Spent",
    "stats.keyStaff": "Key Staff",
    "card.viewProject": "View Project",
    "card.log": "Site log",
    "theme.light": "Day",
    "theme.dark": "Night",
    "lang.es": "Español",
    "lang.en": "English",
    "footer.rights": "All rights reserved.",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",
  },
};

function readLocale(): Locale {
  if (typeof window === "undefined") return "es";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch { /* ignore */ }
  const browser = navigator.language?.toLowerCase().startsWith("en") ? "en" : "es";
  return browser as Locale;
}

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nCtx | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "es-MX";
    try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* ignore */ }
  }, [locale]);

  const setLocale = (l: Locale) => setLocaleState(l);
  const t = (key: string, fallback?: string): string =>
    DICT[locale][key] ?? fallback ?? DICT.es[key] ?? key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
