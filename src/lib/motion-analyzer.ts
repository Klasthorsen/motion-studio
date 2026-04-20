import { presets } from "./store";

export interface MotionRecommendation {
  preset: string;
  reason: string;
  confidence: "high" | "medium" | "low";
}

interface ComponentPattern {
  patterns: RegExp[];
  recommendations: MotionRecommendation[];
}

const componentPatterns: ComponentPattern[] = [
  {
    patterns: [/button/i, /btn/i, /cta/i],
    recommendations: [
      { preset: "scaleIn", reason: "Buttons benefit from subtle scale for feedback", confidence: "high" },
      { preset: "fadeIn", reason: "Clean fade for minimal distraction", confidence: "medium" },
    ],
  },
  {
    patterns: [/card/i, /tile/i, /item/i],
    recommendations: [
      { preset: "slideUp", reason: "Cards look great sliding in from below", confidence: "high" },
      { preset: "scaleIn", reason: "Scale adds depth to card reveals", confidence: "medium" },
    ],
  },
  {
    patterns: [/modal/i, /dialog/i, /popup/i, /overlay/i],
    recommendations: [
      { preset: "scaleIn", reason: "Modals traditionally scale in from center", confidence: "high" },
      { preset: "fadeIn", reason: "Subtle fade for less intrusive modals", confidence: "medium" },
    ],
  },
  {
    patterns: [/nav/i, /menu/i, /sidebar/i, /drawer/i],
    recommendations: [
      { preset: "slideRight", reason: "Navigation typically slides in from the side", confidence: "high" },
      { preset: "slideLeft", reason: "Right-side navigation slides from right", confidence: "medium" },
    ],
  },
  {
    patterns: [/header/i, /hero/i, /banner/i],
    recommendations: [
      { preset: "slideDown", reason: "Headers naturally descend from top", confidence: "high" },
      { preset: "fadeIn", reason: "Elegant fade for hero sections", confidence: "medium" },
    ],
  },
  {
    patterns: [/footer/i],
    recommendations: [
      { preset: "slideUp", reason: "Footers rise into view", confidence: "high" },
      { preset: "fadeIn", reason: "Subtle reveal for footer content", confidence: "medium" },
    ],
  },
  {
    patterns: [/toast/i, /notification/i, /alert/i, /snackbar/i],
    recommendations: [
      { preset: "slideRight", reason: "Toasts typically slide in from edge", confidence: "high" },
      { preset: "bounce", reason: "Bouncy entrance grabs attention", confidence: "medium" },
    ],
  },
  {
    patterns: [/avatar/i, /profile/i, /icon/i, /logo/i],
    recommendations: [
      { preset: "scaleIn", reason: "Icons pop nicely with scale", confidence: "high" },
      { preset: "rotate", reason: "Playful rotation for icons", confidence: "low" },
    ],
  },
  {
    patterns: [/list/i, /row/i, /grid/i],
    recommendations: [
      { preset: "slideUp", reason: "List items stagger well with slide up", confidence: "high" },
      { preset: "fadeIn", reason: "Clean fade for grid layouts", confidence: "medium" },
    ],
  },
  {
    patterns: [/input/i, /field/i, /form/i, /search/i],
    recommendations: [
      { preset: "fadeIn", reason: "Forms should have subtle, non-distracting motion", confidence: "high" },
      { preset: "slideUp", reason: "Gentle slide for form fields", confidence: "low" },
    ],
  },
  {
    patterns: [/image/i, /img/i, /photo/i, /picture/i],
    recommendations: [
      { preset: "fadeIn", reason: "Images look best with clean fades", confidence: "high" },
      { preset: "scaleIn", reason: "Subtle zoom for image reveals", confidence: "medium" },
    ],
  },
  {
    patterns: [/dropdown/i, /select/i, /popover/i],
    recommendations: [
      { preset: "slideDown", reason: "Dropdowns naturally expand downward", confidence: "high" },
      { preset: "scaleIn", reason: "Scale from origin point", confidence: "medium" },
    ],
  },
  {
    patterns: [/tab/i, /segment/i],
    recommendations: [
      { preset: "fadeIn", reason: "Tabs transition smoothly with fade", confidence: "high" },
      { preset: "slideLeft", reason: "Slide for tab content switching", confidence: "medium" },
    ],
  },
  {
    patterns: [/loading/i, /spinner/i, /skeleton/i],
    recommendations: [
      { preset: "fadeIn", reason: "Loading states should be subtle", confidence: "high" },
    ],
  },
];

export function analyzeComponent(name: string, type?: string): MotionRecommendation[] {
  const searchText = `${name} ${type || ""}`.toLowerCase();
  const recommendations: MotionRecommendation[] = [];
  const seenPresets = new Set<string>();

  // Check against patterns
  for (const pattern of componentPatterns) {
    for (const regex of pattern.patterns) {
      if (regex.test(searchText)) {
        for (const rec of pattern.recommendations) {
          if (!seenPresets.has(rec.preset)) {
            recommendations.push(rec);
            seenPresets.add(rec.preset);
          }
        }
        break;
      }
    }
  }

  // Default recommendations if no patterns matched
  if (recommendations.length === 0) {
    recommendations.push(
      { preset: "fadeIn", reason: "Universal fade works for most components", confidence: "medium" },
      { preset: "slideUp", reason: "Subtle upward motion adds polish", confidence: "low" },
      { preset: "scaleIn", reason: "Scale adds depth and focus", confidence: "low" }
    );
  }

  // Limit to top 3
  return recommendations.slice(0, 3);
}

export function getPresetLabel(presetKey: string): string {
  return presetKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
