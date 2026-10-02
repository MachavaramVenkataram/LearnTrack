/**
 * LearnTrack Design System Tokens
 * Premium light-first SaaS aesthetics
 */

export const tokens = {
  colors: {
    primary: {
      blue: "#2563eb", // blue-600
      blueHover: "#1d4ed8", // blue-700
      blueLight: "#eff6ff", // blue-50
      blueBorder: "#bfdbfe", // blue-200
      indigo: "#4f46e5", // indigo-600
      indigoLight: "#eef2ff", // indigo-50
      navy: "#0f172a", // slate-900
    },
    neutral: {
      background: "#ffffff",
      surface: "#f8fafc", // slate-50
      surfaceSubtle: "#f1f5f9", // slate-100
      border: "#e2e8f0", // slate-200
      borderSubtle: "#f1f5f9", // slate-100
      textPrimary: "#0f172a", // slate-900
      textSecondary: "#334155", // slate-700
      textMuted: "#64748b", // slate-500
      textSubtle: "#94a3b8", // slate-400
    },
    semantic: {
      success: "#059669", // emerald-600
      successSurface: "#ecfdf5", // emerald-50
      successBorder: "#a7f3d0", // emerald-200
      warning: "#d97706", // amber-600
      warningSurface: "#fffbeb", // amber-50
      warningBorder: "#fde68a", // amber-200
      danger: "#dc2626", // rose-600
      dangerSurface: "#fef2f2", // rose-50
      dangerBorder: "#fecaca", // rose-200
      info: "#0284c7", // sky-600
      infoSurface: "#f0f9ff", // sky-50
      infoBorder: "#bae6fd", // sky-200
    },
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
  shadows: {
    subtle: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.02)",
    card: "0 2px 8px -1px rgba(15, 23, 42, 0.04), 0 1px 3px -1px rgba(15, 23, 42, 0.02)",
    cardHover: "0 12px 30px -4px rgba(15, 23, 42, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.03)",
    elevated: "0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.02)",
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    page: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type DesignTokens = typeof tokens;
