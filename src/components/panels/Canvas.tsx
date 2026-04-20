"use client";

import { motion } from "motion/react";
import { useStudioStore } from "@/lib/store";
import { Play, RotateCcw } from "lucide-react";

export function Canvas() {
  const { layers, selectedLayerId, isPlaying, playKey, play, reset } = useStudioStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="h-full flex items-center justify-center bg-background text-muted">
        Select a layer to preview
      </div>
    );
  }

  const { initial, animate, transition } = selectedLayer.motion;

  const transitionConfig = transition.useSpring
    ? {
        type: "spring" as const,
        stiffness: transition.stiffness,
        damping: transition.damping,
        delay: transition.delay,
      }
    : {
        duration: transition.duration,
        delay: transition.delay,
        ease: transition.ease,
      };

  const initialState = isPlaying ? initial : animate;
  const animateState = animate;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative">
          {/* Grid background */}
          <div
            className="absolute inset-0 -m-20 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, var(--border) 1px, transparent 1px),
                linear-gradient(to bottom, var(--border) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Preview element */}
          <motion.div
            key={playKey}
            initial={{
              opacity: initialState.opacity,
              x: initialState.x,
              y: initialState.y,
              scale: initialState.scale,
              rotate: initialState.rotate,
            }}
            animate={{
              opacity: animateState.opacity,
              x: animateState.x,
              y: animateState.y,
              scale: animateState.scale,
              rotate: animateState.rotate,
            }}
            transition={transitionConfig}
            className="relative z-10"
          >
            {selectedLayer.type === "placeholder" ? (
              <div className="px-6 py-3 bg-accent text-white font-medium rounded-lg shadow-lg">
                {selectedLayer.name}
              </div>
            ) : selectedLayer.src ? (
              <img
                src={selectedLayer.src}
                alt={selectedLayer.name}
                className="max-w-[300px] max-h-[200px] object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-40 h-24 bg-panel border border-border rounded-lg flex items-center justify-center">
                {selectedLayer.name}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-border flex items-center justify-center gap-4">
        <button
          onClick={play}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          Play
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-border hover:bg-border/80 rounded-md text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
