export type StylePreset = "professional" | "playful" | "standard";

export interface StyleConfig {
  id: StylePreset;
  name: string;
  tagline: string;
  previewColors: {
    bg: string;
    primary: string;
    accent: string;
  };
  inlineTheme: string;
  planDesignRules: string;
  styleRules: string;
  designPrinciples: string;
}

const professional: StyleConfig = {
  id: "professional",
  name: "Professional",
  tagline: "Clean, corporate, data-focused",
  previewColors: {
    bg: "#ffffff",
    primary: "#2563eb",
    accent: "#7c3aed",
  },
  inlineTheme: `const colors = {
  background: "#ffffff", foreground: "#0f172a", primary: "#2563eb",
  primaryLight: "#3b82f6", primaryDark: "#1d4ed8", accent: "#7c3aed",
  accentLight: "#8b5cf6", muted: "#f1f5f9", mutedForeground: "#64748b",
  border: "#e2e8f0", success: "#16a34a", destructive: "#dc2626",
  warning: "#d97706", white: "#ffffff",
};

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: 12, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
};

const gridBg: React.CSSProperties = {
  backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};`,
  planDesignRules: `- Design for 1920x1080 resolution on a pure white (#ffffff) background
- Clean, corporate, professional aesthetic — subtle shadows, clean cards, no glow effects
- Color palette: blue (#2563eb) primary, violet (#7c3aed) accent, green (#16a34a) success, red (#dc2626) error, amber (#d97706) warning
- ONLY smooth springs (damping: 200) — absolutely no bouncy effects, no overshoot
- Inter font for everything — clean, readable, minimal
- Monospace ('SF Mono', 'Fira Code') for numbers and code
- No decorative elements — data and content first
- Subtle entrance animations only — slide up 20px + fade, no scale pops, no rotation
- Think Bloomberg terminal, Stripe dashboard, corporate keynote`,
  styleRules: `## STYLE: PROFESSIONAL
- Use ONLY smooth springs: config: { damping: 200 }
- FORBIDDEN: damping below 100, scale animations, rotation, shake effects, wiggle
- Entrance animations: translateY(20px→0) + opacity fade ONLY
- Cards have subtle shadows, not glow effects
- No textShadow glow — clean text only
- Borders are thin (1px) and subtle
- Spacing is generous but not excessive
- Typography hierarchy: size and weight only, no color tricks`,
  designPrinciples: `- Background is always pure white #ffffff
- Subtle grid overlay at 0.03 opacity for texture
- Clean white cards with very subtle box-shadow
- Thin borders (#e2e8f0) for structure
- No text glow, no box glow, no neon effects
- Smooth springs only (damping 200) for all animations
- Keep all content within 1920x1080 bounds — don't overflow
- Stagger animations with delays, don't dump everything at once
- Physical slide-up transitions, not scale pops
- No emojis — use Lucide icons or styled divs
- No gradient text — solid colors only
- Always clamp interpolate extrapolation`,
};

const playful: StyleConfig = {
  id: "playful",
  name: "Playful",
  tagline: "Vibrant, bouncy, energetic",
  previewColors: {
    bg: "#fdf4ff",
    primary: "#ec4899",
    accent: "#f97316",
  },
  inlineTheme: `const colors = {
  background: "#fdf4ff", foreground: "#1e1b4b", primary: "#ec4899",
  primaryLight: "#f472b6", primaryDark: "#db2777", accent: "#f97316",
  accentLight: "#fb923c", muted: "#fce7f3", mutedForeground: "#6b7280",
  border: "#fbcfe8", success: "#14b8a6", destructive: "#ef4444",
  warning: "#f59e0b", white: "#ffffff",
};

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)", border: "3px solid rgba(236, 72, 153, 0.15)",
  borderRadius: 24, boxShadow: "0 4px 20px rgba(236, 72, 153, 0.08)",
};

const gridBg: React.CSSProperties = {};`,
  planDesignRules: `- Design for 1920x1080 resolution on a light warm background (#fdf4ff)
- Vibrant, energetic, playful aesthetic — thick borders, large corners, big fonts
- Color palette: pink (#ec4899) primary, orange (#f97316) accent, teal (#14b8a6) success, red (#ef4444) error
- Bouncy springs EVERYWHERE (damping: 8-12, stiffness: 120-200) — things should bounce, pop, and overshoot
- Large fonts, generous spacing, rounded corners (24px)
- Fun entrance effects — scale pops from 0.3→1, slight rotation, overshoot
- Use Montserrat 700/900 for headlines, Inter for body
- Think children's TV, product launch, social media content
- Each element should feel alive and energetic`,
  styleRules: `## STYLE: PLAYFUL
- Use bouncy springs for EVERYTHING: config: { damping: 10, stiffness: 150 }
- Scale pops: interpolate(spring, [0, 1], [0.3, 1])
- Add subtle rotation on entrance: interpolate(spring, [0, 1], [-8, 0]) degrees
- Cards have thick borders (3px), large borderRadius (24px)
- Use colorful shadows: boxShadow with primary/accent color at low opacity
- Text can be larger than normal — bold, impactful
- Pulsing/breathing effects are encouraged for idle elements
- Wiggle: Math.sin(frame * 0.3) * 2 for subtle idle animation
- Background has no grid — keep it clean and warm`,
  designPrinciples: `- Background is light warm #fdf4ff
- No grid overlay — clean warm background
- White cards with thick colorful borders and rounded corners (24px)
- Colorful shadows using primary/accent colors at low opacity
- Text glow via textShadow with warm colors is OK sparingly
- Bouncy springs (damping 8-12) for ALL animations
- Keep all content within 1920x1080 bounds — don't overflow
- Stagger animations with short delays (3-4 frame gaps)
- Scale pops and slight rotation for entrances
- No emojis — use Lucide icons or styled divs
- No gradient text — solid colors only
- Always clamp interpolate extrapolation`,
};

const standard: StyleConfig = {
  id: "standard",
  name: "Standard",
  tagline: "Modern tech, cyan & purple",
  previewColors: {
    bg: "#f8fafc",
    primary: "#00d4ff",
    accent: "#a855f7",
  },
  inlineTheme: `const colors = {
  background: "#f8fafc", foreground: "#0f172a", primary: "#00d4ff",
  primaryLight: "#38bdf8", primaryDark: "#0284c7", accent: "#a855f7",
  accentLight: "#c084fc", muted: "#f1f5f9", mutedForeground: "#64748b",
  border: "#cbd5e1", success: "#22c55e", destructive: "#ef4444",
  warning: "#f59e0b", white: "#ffffff",
};

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: 16, boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
};

const gridBg: React.CSSProperties = {
  backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};`,
  planDesignRules: `- Design for 1920x1080 resolution on a light gray (#f8fafc) background
- Modern tech aesthetic with glass-morphism cards and subtle grid overlay
- Color palette: cyan (#00d4ff) primary, purple (#a855f7) accent, green (#22c55e) success, red (#ef4444) error, yellow (#f59e0b) warning
- No emojis, no gradient text — use Lucide React icons and solid colors
- Use Montserrat 700/900 for headlines, Inter 400-700 for body text
- Monospace ('SF Mono', 'Fira Code') for numbers and code
- Mix of bouncy (damping 8-14) and smooth (damping 200) springs
- Glass-morphism cards for containers
- Think tech demo, developer tools, explainer content
- Physical transformations (shrinking, scaling, shaking) > simple fades
- Each phase should have a clear visual payoff, not just text appearing`,
  styleRules: `## STYLE: STANDARD
- Mix of smooth springs (damping: 200) for text/titles and bouncy springs (damping: 8-14) for impact moments
- Scale pops for cards/badges, smooth slides for text
- Glass-morphism cards with subtle borders
- Text glow via textShadow with cyan/purple is OK for emphasis
- Colored top/left borders on cards to indicate type
- Grid overlay at low opacity for texture
- Physical transformations are encouraged — shrinking blocks, scanning effects, counting numbers`,
  designPrinciples: `- Background is light gray #f8fafc
- Subtle grid overlay at 0.04 opacity for texture
- Glass-morphism cards with blur effect
- Colored top/left borders on cards to indicate type
- Text glow via textShadow for emphasis (subtle, not neon)
- Bouncy springs (damping 8-14) for impactful moments, smooth springs (damping 200) for text
- Keep all content within 1920x1080 bounds — don't overflow
- Stagger animations with delays, don't dump everything at once
- Physical transformations (shrinking, scaling, shaking) > simple fades
- No emojis — use Lucide icons or styled divs
- No gradient text — solid colors only
- Always clamp interpolate extrapolation`,
};

export const styleConfigs: Record<StylePreset, StyleConfig> = {
  professional,
  playful,
  standard,
};

export function getStyleConfig(style: StylePreset): StyleConfig {
  return styleConfigs[style];
}
