export interface AvatarPreset {
  id: string;
  category: "INITIALS" | "ILLUSTRATED" | "MINIMAL" | "GRADIENT" | "ACADEMIC";
  label: string;
  iconName?: string;
  bgGradient: [string, string];
  textColor: string;
  svgDataUri: (name: string) => string;
}

export const AVATAR_COLOR_PALETTES = [
  { id: "blue-indigo", name: "LearnTrack Blue", from: "#2563EB", to: "#4F46E5", text: "#FFFFFF" },
  { id: "indigo-violet", name: "Royal Indigo", from: "#4F46E5", to: "#7C3AED", text: "#FFFFFF" },
  { id: "cyan-blue", name: "Deep Cyan", from: "#0284C7", to: "#2563EB", text: "#FFFFFF" },
  { id: "emerald-teal", name: "Academic Emerald", from: "#059669", to: "#0D9488", text: "#FFFFFF" },
  { id: "slate-zinc", name: "Technical Slate", from: "#334155", to: "#1E293B", text: "#FFFFFF" },
  { id: "amber-orange", name: "Scholar Amber", from: "#D97706", to: "#EA580C", text: "#FFFFFF" },
  { id: "violet-pink", name: "Creative Violet", from: "#7C3AED", to: "#C026D3", text: "#FFFFFF" },
];

export function getInitialsFromName(name: string): string {
  if (!name || !name.trim()) return "ST";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a standalone SVG data URI with initials and gradient background
 */
export function generateInitialsSvgUri(name: string, fromColor = "#2563EB", toColor = "#4F46E5"): string {
  const initials = getInitialsFromName(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${fromColor}" />
        <stop offset="100%" stop-color="${toColor}" />
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#grad)" />
    <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">
      ${initials}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Academic & Illustrated presets using clean SVG icons
 */
export const PRESET_AVATARS: Array<{
  id: string;
  category: "INITIALS" | "ILLUSTRATED" | "MINIMAL" | "GRADIENT" | "ACADEMIC";
  label: string;
  from: string;
  to: string;
  svgIcon: string;
}> = [
  // 1. ACADEMIC
  {
    id: "academic-scholar",
    category: "ACADEMIC",
    label: "Scholar",
    from: "#2563EB",
    to: "#4F46E5",
    svgIcon: `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>`,
  },
  {
    id: "academic-researcher",
    category: "ACADEMIC",
    label: "Researcher",
    from: "#4F46E5",
    to: "#7C3AED",
    svgIcon: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  },
  {
    id: "academic-honors",
    category: "ACADEMIC",
    label: "Honors",
    from: "#D97706",
    to: "#EA580C",
    svgIcon: `<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`,
  },

  // 2. ILLUSTRATED / STEM
  {
    id: "stem-engineer",
    category: "ILLUSTRATED",
    label: "Engineer",
    from: "#0284C7",
    to: "#2563EB",
    svgIcon: `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`,
  },
  {
    id: "stem-science",
    category: "ILLUSTRATED",
    label: "Scientist",
    from: "#059669",
    to: "#0D9488",
    svgIcon: `<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.4-2.4 2.4-6.3 0-8.7-2.4-2.4-6.3-2.4-8.7 0L4 19l7.5-7.5"/><path d="M12 2a10 10 0 1 0 10 10"/>`,
  },
  {
    id: "stem-systems",
    category: "ILLUSTRATED",
    label: "Computer Systems",
    from: "#334155",
    to: "#1E293B",
    svgIcon: `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/>`,
  },

  // 3. MINIMAL
  {
    id: "minimal-spark",
    category: "MINIMAL",
    label: "Intellect",
    from: "#7C3AED",
    to: "#C026D3",
    svgIcon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
  },
  {
    id: "minimal-geometric",
    category: "MINIMAL",
    label: "Symmetry",
    from: "#2563EB",
    to: "#0284C7",
    svgIcon: `<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>`,
  },

  // 4. GRADIENT
  {
    id: "gradient-aurora",
    category: "GRADIENT",
    label: "Aurora Mesh",
    from: "#2563EB",
    to: "#0D9488",
    svgIcon: `<circle cx="12" cy="12" r="8" fill="none" stroke-width="2"/>`,
  },
  {
    id: "gradient-indigo",
    category: "GRADIENT",
    label: "Twilight Core",
    from: "#4F46E5",
    to: "#0F172A",
    svgIcon: `<rect x="6" y="6" width="12" height="12" rx="3" fill="none" stroke-width="2"/>`,
  },
];

/**
 * Generate full SVG data URI from preset definition
 */
export function generatePresetSvgUri(preset: typeof PRESET_AVATARS[0]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="grad-${preset.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${preset.from}" />
        <stop offset="100%" stop-color="${preset.to}" />
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#grad-${preset.id})" />
    <g transform="translate(36, 36) scale(2.33)" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${preset.svgIcon}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
