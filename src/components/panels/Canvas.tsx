"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useStudioStore } from "@/lib/store";
import { Play, RotateCcw, MousePointer, Hand, Eye } from "lucide-react";

export function Canvas() {
  const { layers, selectedLayerId, isPlaying, playKey, play, reset } = useStudioStore();
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

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

  const trigger = selectedLayer.motion.trigger;
  const initialState = isPlaying ? initial : animate;
  const animateState = animate;

  // Build motion props based on trigger type
  const getMotionProps = () => {
    const baseInitial = {
      opacity: initial.opacity,
      x: initial.x,
      y: initial.y,
      scale: initial.scale,
      rotate: initial.rotate,
    };
    const baseAnimate = {
      opacity: animateState.opacity,
      x: animateState.x,
      y: animateState.y,
      scale: animateState.scale,
      rotate: animateState.rotate,
    };

    switch (trigger) {
      case "hover":
        return {
          initial: baseAnimate,
          whileHover: baseInitial,
          transition: transitionConfig,
        };
      case "tap":
        return {
          initial: baseAnimate,
          whileTap: baseInitial,
          transition: transitionConfig,
        };
      case "inView":
        return {
          initial: baseInitial,
          animate: isInView ? baseAnimate : baseInitial,
          transition: transitionConfig,
        };
      case "mount":
      default:
        return {
          initial: isPlaying ? baseInitial : baseAnimate,
          animate: baseAnimate,
          transition: transitionConfig,
        };
    }
  };

  const renderContent = () => {
    if (selectedLayer.type === "placeholder") {
      return (
        <div className="px-6 py-3 bg-accent text-white font-medium rounded-lg shadow-lg cursor-pointer select-none">
          {selectedLayer.name}
        </div>
      );
    } else if (selectedLayer.src) {
      return (
        <img
          src={selectedLayer.src}
          alt={selectedLayer.name}
          className="max-w-[300px] max-h-[200px] object-contain rounded-lg shadow-lg"
        />
      );
    } else {
      return (
        <div className="w-40 h-24 bg-panel border border-border rounded-lg flex items-center justify-center">
          {selectedLayer.name}
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Trigger indicator */}
      {trigger !== "mount" && (
        <div className="px-4 py-2 border-b border-border flex items-center justify-center gap-2 text-sm text-muted">
          {trigger === "hover" && (
            <>
              <MousePointer className="w-4 h-4" />
              Hover over element to see animation
            </>
          )}
          {trigger === "tap" && (
            <>
              <Hand className="w-4 h-4" />
              Click/tap element to see animation
            </>
          )}
          {trigger === "inView" && (
            <>
              <Eye className="w-4 h-4" />
              Scroll element into view to trigger
            </>
          )}
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto" ref={ref}>
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
            {...getMotionProps()}
            className="relative z-10"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-border flex items-center justify-center gap-4">
        {trigger === "mount" && (
          <>
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
          </>
        )}
        {trigger !== "mount" && (
          <span className="text-sm text-muted">
            Interact with the element above to preview
          </span>
        )}
      </div>
    </div>
  );
}
