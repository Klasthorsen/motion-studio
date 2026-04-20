"use client";

import { useStudioStore, type ComponentStateName, presets, type EasingType } from "@/lib/store";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";

const stateLabels: Record<ComponentStateName, string> = {
  default: "Default",
  hover: "Hover",
  active: "Active",
  focus: "Focus",
  disabled: "Disabled",
  loading: "Loading",
};

const easingOptions: { value: EasingType; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "easeIn", label: "Ease In" },
  { value: "easeOut", label: "Ease Out" },
  { value: "easeInOut", label: "Ease In Out" },
  { value: "backIn", label: "Back In" },
  { value: "backOut", label: "Back Out" },
];

const presetOptions = Object.keys(presets).map((key) => ({
  value: key,
  label: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim(),
}));

export function StateEditor() {
  const { layers, selectedLayerId, setActiveState, applyPresetToState, updateStateMotion } = useStudioStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  if (!selectedLayer || selectedLayer.states.length === 0) {
    return null;
  }

  const { states, activeState } = selectedLayer;
  const currentState = states.find((s) => s.name === activeState);

  if (!currentState) return null;

  const { motion } = currentState;

  return (
    <div className="border-t border-border">
      {/* State Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {states.map((state) => (
          <button
            key={state.name}
            onClick={() => setActiveState(selectedLayer.id, state.name)}
            className={`px-4 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeState === state.name
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {stateLabels[state.name] || state.name}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* State Description */}
        <div className="text-xs text-muted">{currentState.description}</div>

        {/* Quick Preset */}
        <div>
          <label className="text-xs text-muted uppercase tracking-wide block mb-2">
            Quick Preset
          </label>
          <div className="grid grid-cols-4 gap-1">
            {presetOptions.slice(0, 8).map((preset) => (
              <button
                key={preset.value}
                onClick={() => applyPresetToState(selectedLayer.id, activeState, preset.value)}
                className="px-2 py-1 text-xs bg-background hover:bg-border rounded transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div className="space-y-3">
          <h4 className="text-xs text-muted uppercase tracking-wide">Timing</h4>
          <Slider
            label="Duration"
            value={motion.transition.duration}
            onChange={(v) =>
              updateStateMotion(selectedLayer.id, activeState, {
                transition: { ...motion.transition, duration: v },
              })
            }
            min={0.1}
            max={1}
            step={0.05}
            unit="s"
          />
          <Select
            label="Easing"
            value={motion.transition.ease}
            onChange={(v) =>
              updateStateMotion(selectedLayer.id, activeState, {
                transition: { ...motion.transition, ease: v as EasingType },
              })
            }
            options={easingOptions}
          />
        </div>

        {/* Transform */}
        <div className="space-y-3">
          <h4 className="text-xs text-muted uppercase tracking-wide">Transform</h4>
          <Slider
            label="Scale"
            value={motion.animate.scale}
            onChange={(v) =>
              updateStateMotion(selectedLayer.id, activeState, {
                animate: { ...motion.animate, scale: v },
              })
            }
            min={0.8}
            max={1.2}
            step={0.01}
          />
          <Slider
            label="Opacity"
            value={motion.animate.opacity}
            onChange={(v) =>
              updateStateMotion(selectedLayer.id, activeState, {
                animate: { ...motion.animate, opacity: v },
              })
            }
            min={0}
            max={1}
            step={0.1}
          />
          <Slider
            label="Y Offset"
            value={motion.animate.y}
            onChange={(v) =>
              updateStateMotion(selectedLayer.id, activeState, {
                animate: { ...motion.animate, y: v },
              })
            }
            min={-20}
            max={20}
            step={1}
            unit="px"
          />
        </div>
      </div>
    </div>
  );
}
