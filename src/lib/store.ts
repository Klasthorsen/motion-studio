import { create } from "zustand";

export type EasingType =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "backIn"
  | "backOut"
  | "backInOut";

export type TriggerType = "mount" | "hover" | "tap" | "inView";

export interface MotionState {
  opacity: number;
  x: number;
  y: number;
  scale: number;
  rotate: number;
}

export interface TransitionConfig {
  duration: number;
  delay: number;
  ease: EasingType;
  stagger: number;
  stiffness: number;
  damping: number;
  useSpring: boolean;
}

export interface MotionConfig {
  initial: MotionState;
  animate: MotionState;
  transition: TransitionConfig;
  trigger: TriggerType;
}

export type ComponentStateName = "default" | "hover" | "active" | "focus" | "disabled" | "loading";

export interface ComponentState {
  name: ComponentStateName;
  description: string;
  motion: MotionConfig;
  cssChanges?: string;
}

export interface Layer {
  id: string;
  name: string;
  type: "image" | "figma" | "placeholder" | "generated";
  src?: string;
  html?: string;
  css?: string;
  states: ComponentState[];
  activeState: ComponentStateName;
  motion: MotionConfig; // Default/legacy motion
}

interface StudioState {
  layers: Layer[];
  selectedLayerId: string | null;
  mode: "simple" | "advanced";
  viewMode: "designer" | "developer";
  isPlaying: boolean;
  playKey: number;

  // Actions
  addLayer: (layer: Omit<Layer, "id" | "states" | "activeState"> & { states?: ComponentState[] }) => void;
  addGeneratedLayer: (data: {
    name: string;
    html: string;
    css: string;
    states: ComponentState[];
    src?: string;
  }) => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  updateLayerMotion: (id: string, motion: Partial<MotionConfig>) => void;
  updateInitial: (id: string, state: Partial<MotionState>) => void;
  updateAnimate: (id: string, state: Partial<MotionState>) => void;
  updateTransition: (id: string, config: Partial<TransitionConfig>) => void;
  setActiveState: (id: string, stateName: ComponentStateName) => void;
  updateStateMotion: (id: string, stateName: ComponentStateName, motion: Partial<MotionConfig>) => void;
  setMode: (mode: "simple" | "advanced") => void;
  setViewMode: (mode: "designer" | "developer") => void;
  play: () => void;
  reset: () => void;
  applyPreset: (id: string, preset: string) => void;
  applyPresetToState: (id: string, stateName: ComponentStateName, preset: string) => void;
}

const defaultMotionState: MotionState = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
};

const defaultTransition: TransitionConfig = {
  duration: 0.3,
  delay: 0,
  ease: "easeOut",
  stagger: 0,
  stiffness: 100,
  damping: 10,
  useSpring: false,
};

const defaultMotionConfig: MotionConfig = {
  initial: { ...defaultMotionState, opacity: 0 },
  animate: { ...defaultMotionState },
  transition: { ...defaultTransition },
  trigger: "mount",
};

export const presets: Record<string, { initial?: Partial<MotionState>; animate?: Partial<MotionState>; transition?: Partial<TransitionConfig> }> = {
  fadeIn: {
    initial: { opacity: 0, x: 0, y: 0, scale: 1, rotate: 0 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  slideUp: {
    initial: { opacity: 0, x: 0, y: 20, scale: 1, rotate: 0 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  slideDown: {
    initial: { opacity: 0, x: 0, y: -20, scale: 1, rotate: 0 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20, y: 0, scale: 1, rotate: 0 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  slideRight: {
    initial: { opacity: 0, x: -20, y: 0, scale: 1, rotate: 0 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  scaleIn: {
    initial: { opacity: 0, x: 0, y: 0, scale: 0.9, rotate: 0 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  bounce: {
    initial: { opacity: 0, x: 0, y: -30, scale: 1, rotate: 0 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { duration: 0.5, ease: "backOut" },
  },
  rotate: {
    initial: { opacity: 0, x: 0, y: 0, scale: 0.9, rotate: -10 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const defaultStates: ComponentState[] = [
  {
    name: "default",
    description: "Initial state",
    motion: { ...defaultMotionConfig },
  },
];

export const useStudioStore = create<StudioState>((set, get) => ({
  layers: [
    {
      id: "demo-button",
      name: "Button",
      type: "placeholder",
      states: [...defaultStates],
      activeState: "default",
      motion: { ...defaultMotionConfig },
    },
  ],
  selectedLayerId: "demo-button",
  mode: "simple",
  viewMode: "designer",
  isPlaying: false,
  playKey: 0,

  addLayer: (layer) =>
    set((state) => ({
      layers: [
        ...state.layers,
        {
          ...layer,
          id: `layer-${Date.now()}`,
          states: layer.states || [...defaultStates],
          activeState: "default" as ComponentStateName,
          motion: layer.motion || { ...defaultMotionConfig },
        },
      ],
    })),

  addGeneratedLayer: (data) =>
    set((state) => {
      const newLayer: Layer = {
        id: `layer-${Date.now()}`,
        name: data.name,
        type: "generated",
        html: data.html,
        css: data.css,
        src: data.src,
        states: data.states,
        activeState: "default",
        motion: data.states[0]?.motion || { ...defaultMotionConfig },
      };
      return {
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
      };
    }),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })),

  selectLayer: (id) => set({ selectedLayerId: id }),

  updateLayerMotion: (id, motion) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, motion: { ...l.motion, ...motion } } : l
      ),
    })),

  updateInitial: (id, initial) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id
          ? { ...l, motion: { ...l.motion, initial: { ...l.motion.initial, ...initial } } }
          : l
      ),
    })),

  updateAnimate: (id, animate) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id
          ? { ...l, motion: { ...l.motion, animate: { ...l.motion.animate, ...animate } } }
          : l
      ),
    })),

  updateTransition: (id, transition) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id
          ? {
              ...l,
              motion: { ...l.motion, transition: { ...l.motion.transition, ...transition } },
            }
          : l
      ),
    })),

  setActiveState: (id, stateName) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== id) return l;
        const stateConfig = l.states.find((s) => s.name === stateName);
        return {
          ...l,
          activeState: stateName,
          motion: stateConfig?.motion || l.motion,
        };
      }),
    })),

  updateStateMotion: (id, stateName, motionUpdate) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          states: l.states.map((s) =>
            s.name === stateName
              ? { ...s, motion: { ...s.motion, ...motionUpdate } }
              : s
          ),
          motion: l.activeState === stateName 
            ? { ...l.motion, ...motionUpdate }
            : l.motion,
        };
      }),
    })),

  setMode: (mode) => set({ mode }),
  setViewMode: (viewMode) => set({ viewMode }),

  play: () => set((state) => ({ isPlaying: true, playKey: state.playKey + 1 })),
  reset: () => set((state) => ({ isPlaying: false, playKey: state.playKey + 1 })),

  applyPreset: (id, presetName) => {
    const preset = presets[presetName];
    if (!preset) return;
    const layer = get().layers.find((l) => l.id === id);
    if (!layer) return;
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id
          ? {
              ...l,
              motion: {
                ...l.motion,
                initial: { ...l.motion.initial, ...preset.initial },
                animate: { ...l.motion.animate, ...preset.animate },
                transition: { ...l.motion.transition, ...preset.transition },
              },
            }
          : l
      ),
    }));
  },

  applyPresetToState: (id, stateName, presetName) => {
    const preset = presets[presetName];
    if (!preset) return;
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          states: l.states.map((s) =>
            s.name === stateName
              ? {
                  ...s,
                  motion: {
                    ...s.motion,
                    initial: { ...s.motion.initial, ...preset.initial },
                    animate: { ...s.motion.animate, ...preset.animate },
                    transition: { ...s.motion.transition, ...preset.transition },
                  },
                }
              : s
          ),
        };
      }),
    }));
  },
}));
