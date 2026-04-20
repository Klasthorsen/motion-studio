import type { MotionConfig, EasingType, ComponentState, Layer } from "./store";

const easingToCSS: Record<EasingType, string> = {
  linear: "linear",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: "cubic-bezier(0.55, 0, 1, 0.45)",
  circOut: "cubic-bezier(0, 0.55, 0.45, 1)",
  circInOut: "cubic-bezier(0.85, 0, 0.15, 1)",
  backIn: "cubic-bezier(0.36, 0, 0.66, -0.56)",
  backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  backInOut: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
};

const easingToGSAP: Record<EasingType, string> = {
  linear: "none",
  easeIn: "power2.in",
  easeOut: "power2.out",
  easeInOut: "power2.inOut",
  circIn: "circ.in",
  circOut: "circ.out",
  circInOut: "circ.inOut",
  backIn: "back.in",
  backOut: "back.out",
  backInOut: "back.inOut",
};

export function generateMotionReact(config: MotionConfig, componentName = "Component"): string {
  const { initial, animate, transition, trigger } = config;
  
  const initialStr = JSON.stringify(initial, null, 2).replace(/"/g, "").replace(/\n/g, "\n    ");
  const animateStr = JSON.stringify(animate, null, 2).replace(/"/g, "").replace(/\n/g, "\n    ");
  
  let transitionStr = `duration: ${transition.duration}`;
  if (transition.delay > 0) transitionStr += `, delay: ${transition.delay}`;
  transitionStr += `, ease: "${transition.ease}"`;

  if (trigger === "hover") {
    return `import { motion } from "motion/react"

export function ${componentName}() {
  return (
    <motion.div
      initial={${animateStr}}
      whileHover={${initialStr}}
      transition={{ ${transitionStr} }}
    >
      {/* Your content */}
    </motion.div>
  )
}`;
  }

  if (trigger === "tap") {
    return `import { motion } from "motion/react"

export function ${componentName}() {
  return (
    <motion.div
      initial={${animateStr}}
      whileTap={${initialStr}}
      transition={{ ${transitionStr} }}
    >
      {/* Your content */}
    </motion.div>
  )
}`;
  }

  if (trigger === "inView") {
    return `import { motion } from "motion/react"

export function ${componentName}() {
  return (
    <motion.div
      initial={${initialStr}}
      whileInView={${animateStr}}
      viewport={{ once: true }}
      transition={{ ${transitionStr} }}
    >
      {/* Your content */}
    </motion.div>
  )
}`;
  }

  return `import { motion } from "motion/react"

export function ${componentName}() {
  return (
    <motion.div
      initial={${initialStr}}
      animate={${animateStr}}
      transition={{ ${transitionStr} }}
    >
      {/* Your content */}
    </motion.div>
  )
}`;
}

export function generateMotionVue(config: MotionConfig): string {
  const { initial, animate, transition } = config;
  
  return `<script setup>
import { Motion } from "motion/vue"
</script>

<template>
  <Motion
    :initial="{ opacity: ${initial.opacity}, x: ${initial.x}, y: ${initial.y}, scale: ${initial.scale}, rotate: ${initial.rotate} }"
    :animate="{ opacity: ${animate.opacity}, x: ${animate.x}, y: ${animate.y}, scale: ${animate.scale}, rotate: ${animate.rotate} }"
    :transition="{ duration: ${transition.duration}, delay: ${transition.delay}, ease: '${transition.ease}' }"
  >
    <!-- Your content -->
  </Motion>
</template>`;
}

export function generateCSS(config: MotionConfig, className = "element"): string {
  const { initial, animate, transition } = config;
  const cssEase = easingToCSS[transition.ease];
  const durationMs = Math.round(transition.duration * 1000);
  const delayMs = Math.round(transition.delay * 1000);

  return `@keyframes motionAnimation {
  from {
    opacity: ${initial.opacity};
    transform: translateX(${initial.x}px) translateY(${initial.y}px) scale(${initial.scale}) rotate(${initial.rotate}deg);
  }
  to {
    opacity: ${animate.opacity};
    transform: translateX(${animate.x}px) translateY(${animate.y}px) scale(${animate.scale}) rotate(${animate.rotate}deg);
  }
}

.${className} {
  animation: motionAnimation ${durationMs}ms ${cssEase}${delayMs > 0 ? ` ${delayMs}ms` : ""} forwards;
}`;
}

export function generateGSAP(config: MotionConfig, selector = ".element"): string {
  const { initial, animate, transition } = config;
  const gsapEase = easingToGSAP[transition.ease];

  return `import gsap from "gsap"

gsap.fromTo("${selector}",
  {
    opacity: ${initial.opacity},
    x: ${initial.x},
    y: ${initial.y},
    scale: ${initial.scale},
    rotation: ${initial.rotate}
  },
  {
    opacity: ${animate.opacity},
    x: ${animate.x},
    y: ${animate.y},
    scale: ${animate.scale},
    rotation: ${animate.rotate},
    duration: ${transition.duration},
    delay: ${transition.delay},
    ease: "${gsapEase}"
  }
)`;
}

export function generateJSON(config: MotionConfig): string {
  return JSON.stringify(config, null, 2);
}

export function generateDesignTokens(config: MotionConfig): string {
  const { transition } = config;
  
  return `:root {
  --motion-duration: ${transition.duration}s;
  --motion-delay: ${transition.delay}s;
  --motion-ease: ${easingToCSS[transition.ease]};
}`;
}

// Multi-state export for generated components
export function generateMultiStateReact(layer: Layer): string {
  if (!layer.states || layer.states.length <= 1) {
    return generateMotionReact(layer.motion, layer.name.replace(/\s/g, ""));
  }

  const defaultState = layer.states.find((s) => s.name === "default");
  const hoverState = layer.states.find((s) => s.name === "hover");
  const activeState = layer.states.find((s) => s.name === "active");
  const focusState = layer.states.find((s) => s.name === "focus");

  const componentName = layer.name.replace(/\s/g, "");
  
  let code = `import { motion } from "motion/react"

export function ${componentName}() {
  return (
    <motion.div`;

  // Initial state
  if (defaultState) {
    const { animate } = defaultState.motion;
    code += `
      initial={{ opacity: ${animate.opacity}, scale: ${animate.scale}, y: ${animate.y} }}`;
  }

  // Animate (same as initial for interactive components)
  if (defaultState) {
    const { animate } = defaultState.motion;
    code += `
      animate={{ opacity: ${animate.opacity}, scale: ${animate.scale}, y: ${animate.y} }}`;
  }

  // Hover state
  if (hoverState) {
    const { animate } = hoverState.motion;
    code += `
      whileHover={{ opacity: ${animate.opacity}, scale: ${animate.scale}, y: ${animate.y} }}`;
  }

  // Active/Tap state
  if (activeState) {
    const { animate } = activeState.motion;
    code += `
      whileTap={{ opacity: ${animate.opacity}, scale: ${animate.scale}, y: ${animate.y} }}`;
  }

  // Focus state
  if (focusState) {
    const { animate } = focusState.motion;
    code += `
      whileFocus={{ opacity: ${animate.opacity}, scale: ${animate.scale}, y: ${animate.y} }}`;
  }

  // Transition
  const transition = defaultState?.motion.transition || layer.motion.transition;
  code += `
      transition={{ duration: ${transition.duration}, ease: "${transition.ease}" }}
    >
      {/* ${layer.html ? "Generated HTML content" : "Your content"} */}
    </motion.div>
  )
}`;

  return code;
}

export function generateMultiStateCSS(layer: Layer): string {
  if (!layer.states || layer.states.length <= 1) {
    return generateCSS(layer.motion, layer.name.toLowerCase().replace(/\s/g, "-"));
  }

  const className = layer.name.toLowerCase().replace(/\s/g, "-");
  const defaultState = layer.states.find((s) => s.name === "default");
  const hoverState = layer.states.find((s) => s.name === "hover");
  const activeState = layer.states.find((s) => s.name === "active");
  const focusState = layer.states.find((s) => s.name === "focus");

  let css = `.${className} {`;
  
  if (defaultState) {
    const { animate, transition } = defaultState.motion;
    css += `
  opacity: ${animate.opacity};
  transform: scale(${animate.scale}) translateY(${animate.y}px);
  transition: all ${transition.duration}s ${easingToCSS[transition.ease]};`;
  }
  
  css += `\n}\n`;

  if (hoverState) {
    const { animate } = hoverState.motion;
    css += `
.${className}:hover {
  opacity: ${animate.opacity};
  transform: scale(${animate.scale}) translateY(${animate.y}px);
}
`;
  }

  if (activeState) {
    const { animate } = activeState.motion;
    css += `
.${className}:active {
  opacity: ${animate.opacity};
  transform: scale(${animate.scale}) translateY(${animate.y}px);
}
`;
  }

  if (focusState) {
    const { animate } = focusState.motion;
    css += `
.${className}:focus {
  opacity: ${animate.opacity};
  transform: scale(${animate.scale}) translateY(${animate.y}px);
}
`;
  }

  return css;
}
