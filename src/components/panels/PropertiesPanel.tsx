"use client";

import { useStudioStore, presets, type EasingType, type TriggerType } from "@/lib/store";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { MotionRecommendations } from "@/components/MotionRecommendations";
import { StateEditor } from "@/components/StateEditor";
import { Settings2, Sparkles, Zap, Layers } from "lucide-react";

const easingOptions: { value: EasingType; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "easeIn", label: "Ease In" },
  { value: "easeOut", label: "Ease Out" },
  { value: "easeInOut", label: "Ease In Out" },
  { value: "circIn", label: "Circ In" },
  { value: "circOut", label: "Circ Out" },
  { value: "backIn", label: "Back In" },
  { value: "backOut", label: "Back Out" },
  { value: "backInOut", label: "Back In Out" },
];

const presetOptions = Object.keys(presets).map((key) => ({
  value: key,
  label: key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim(),
}));

const triggerOptions: { value: TriggerType; label: string }[] = [
  { value: "mount", label: "On Mount" },
  { value: "hover", label: "On Hover" },
  { value: "tap", label: "On Tap/Click" },
  { value: "inView", label: "In View (Scroll)" },
];

export function PropertiesPanel() {
  const {
    layers,
    selectedLayerId,
    mode,
    setMode,
    updateInitial,
    updateAnimate,
    updateTransition,
    updateLayerMotion,
    applyPreset,
  } = useStudioStore();

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="h-full flex items-center justify-center bg-panel border-l border-border text-muted p-4 text-center text-sm">
        Select a layer to edit motion properties
      </div>
    );
  }

  const { initial, animate, transition } = selectedLayer.motion;
  const hasMultipleStates = selectedLayer.states && selectedLayer.states.length > 1;

  return (
    <div className="h-full flex flex-col bg-panel border-l border-border overflow-y-auto">
      {/* State Editor for generated components */}
      {hasMultipleStates && (
        <div className="border-b border-border">
          <div className="p-4 pb-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              Component States
            </h2>
            <p className="text-xs text-muted mt-1">
              Edit motion for each interaction state
            </p>
          </div>
          <StateEditor />
        </div>
      )}

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            {hasMultipleStates ? "Global Motion" : "Motion"}
          </h2>
          <div className="flex bg-border rounded-md p-0.5">
            <button
              onClick={() => setMode("simple")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                mode === "simple" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setMode("advanced")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                mode === "advanced" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-xs text-muted uppercase tracking-wide">Presets</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {presetOptions.map((preset) => (
              <button
                key={preset.value}
                onClick={() => applyPreset(selectedLayer.id, preset.value)}
                className="px-2 py-1.5 text-xs bg-border hover:bg-border/80 rounded transition-colors text-left"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Timing */}
        <section>
          <h3 className="text-xs text-muted uppercase tracking-wide mb-3">Timing</h3>
          <div className="space-y-4">
            <Slider
              label="Duration"
              value={transition.duration}
              onChange={(v) => updateTransition(selectedLayer.id, { duration: v })}
              min={0.1}
              max={2}
              step={0.1}
              unit="s"
            />
            <Slider
              label="Delay"
              value={transition.delay}
              onChange={(v) => updateTransition(selectedLayer.id, { delay: v })}
              min={0}
              max={2}
              step={0.1}
              unit="s"
            />
            <Select
              label="Easing"
              value={transition.ease}
              onChange={(v) => updateTransition(selectedLayer.id, { ease: v as EasingType })}
              options={easingOptions}
            />
          </div>
        </section>

        {/* Transform - Initial */}
        <section>
          <h3 className="text-xs text-muted uppercase tracking-wide mb-3">Initial State</h3>
          <div className="space-y-4">
            <Slider
              label="Opacity"
              value={initial.opacity}
              onChange={(v) => updateInitial(selectedLayer.id, { opacity: v })}
              min={0}
              max={1}
              step={0.1}
            />
            <Slider
              label="X"
              value={initial.x}
              onChange={(v) => updateInitial(selectedLayer.id, { x: v })}
              min={-100}
              max={100}
              step={1}
              unit="px"
            />
            <Slider
              label="Y"
              value={initial.y}
              onChange={(v) => updateInitial(selectedLayer.id, { y: v })}
              min={-100}
              max={100}
              step={1}
              unit="px"
            />
            <Slider
              label="Scale"
              value={initial.scale}
              onChange={(v) => updateInitial(selectedLayer.id, { scale: v })}
              min={0}
              max={2}
              step={0.05}
            />
            <Slider
              label="Rotate"
              value={initial.rotate}
              onChange={(v) => updateInitial(selectedLayer.id, { rotate: v })}
              min={-180}
              max={180}
              step={1}
              unit="°"
            />
          </div>
        </section>

        {/* Transform - Animate */}
        <section>
          <h3 className="text-xs text-muted uppercase tracking-wide mb-3">Animate To</h3>
          <div className="space-y-4">
            <Slider
              label="Opacity"
              value={animate.opacity}
              onChange={(v) => updateAnimate(selectedLayer.id, { opacity: v })}
              min={0}
              max={1}
              step={0.1}
            />
            <Slider
              label="X"
              value={animate.x}
              onChange={(v) => updateAnimate(selectedLayer.id, { x: v })}
              min={-100}
              max={100}
              step={1}
              unit="px"
            />
            <Slider
              label="Y"
              value={animate.y}
              onChange={(v) => updateAnimate(selectedLayer.id, { y: v })}
              min={-100}
              max={100}
              step={1}
              unit="px"
            />
            <Slider
              label="Scale"
              value={animate.scale}
              onChange={(v) => updateAnimate(selectedLayer.id, { scale: v })}
              min={0}
              max={2}
              step={0.05}
            />
            <Slider
              label="Rotate"
              value={animate.rotate}
              onChange={(v) => updateAnimate(selectedLayer.id, { rotate: v })}
              min={-180}
              max={180}
              step={1}
              unit="°"
            />
          </div>
        </section>

        {/* Advanced: Trigger */}
        {mode === "advanced" && (
          <section>
            <h3 className="text-xs text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Trigger
            </h3>
            <div className="space-y-4">
              <Select
                label="Animation Trigger"
                value={selectedLayer.motion.trigger}
                onChange={(v) => updateLayerMotion(selectedLayer.id, { trigger: v as TriggerType })}
                options={triggerOptions}
              />
              <p className="text-xs text-muted">
                {selectedLayer.motion.trigger === "mount" && "Animation plays when component mounts"}
                {selectedLayer.motion.trigger === "hover" && "Animation plays on mouse hover (whileHover)"}
                {selectedLayer.motion.trigger === "tap" && "Animation plays on click/tap (whileTap)"}
                {selectedLayer.motion.trigger === "inView" && "Animation plays when element enters viewport"}
              </p>
            </div>
          </section>
        )}

        {/* Advanced: Spring Physics */}
        {mode === "advanced" && (
          <section>
            <h3 className="text-xs text-muted uppercase tracking-wide mb-3">Spring Physics</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={transition.useSpring}
                  onChange={(e) =>
                    updateTransition(selectedLayer.id, { useSpring: e.target.checked })
                  }
                  className="rounded border-border"
                />
                <span className="text-sm">Use Spring</span>
              </label>
              {transition.useSpring && (
                <>
                  <Slider
                    label="Stiffness"
                    value={transition.stiffness}
                    onChange={(v) => updateTransition(selectedLayer.id, { stiffness: v })}
                    min={10}
                    max={500}
                    step={10}
                  />
                  <Slider
                    label="Damping"
                    value={transition.damping}
                    onChange={(v) => updateTransition(selectedLayer.id, { damping: v })}
                    min={1}
                    max={50}
                    step={1}
                  />
                </>
              )}
            </div>
          </section>
        )}

        {/* Advanced: Stagger */}
        {mode === "advanced" && (
          <section>
            <h3 className="text-xs text-muted uppercase tracking-wide mb-3">Stagger Children</h3>
            <div className="space-y-4">
              <Slider
                label="Stagger Delay"
                value={transition.stagger}
                onChange={(v) => updateTransition(selectedLayer.id, { stagger: v })}
                min={0}
                max={0.5}
                step={0.05}
                unit="s"
              />
              <p className="text-xs text-muted">
                Delay between each child element animation
              </p>
            </div>
          </section>
        )}
      </div>

      {/* AI Recommendations */}
      <MotionRecommendations />
    </div>
  );
}
