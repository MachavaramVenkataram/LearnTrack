import { Variants, Transition } from "framer-motion";

/**
 * LearnTrack Reusable Animation Patterns
 * Respects prefers-reduced-motion and keeps micro-interactions crisp (150-250ms).
 */

export const transitionFast: Transition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1],
};

export const transitionNormal: Transition = {
  duration: 0.24,
  ease: [0.16, 1, 0.3, 1],
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitionFast },
  exit: { opacity: 0, transition: transitionFast },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: transitionNormal },
  exit: { opacity: 0, y: -8, transition: transitionFast },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: transitionNormal },
  exit: { opacity: 0, scale: 0.96, transition: transitionFast },
};

export const staggerChildren = (staggerMs = 0.06): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerMs,
      delayChildren: 0.04,
    },
  },
});

export const cardHover: Variants = {
  initial: { y: 0 },
  hover: {
    y: -2,
    transition: transitionFast,
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
};
