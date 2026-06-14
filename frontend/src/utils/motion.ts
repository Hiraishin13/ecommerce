import type { Variants, Transition, Easing } from 'framer-motion'

// ── Transition de base ──────────────────────────────────────────────────────
export const ease: Easing = [0.25, 0.1, 0.25, 1]

export const fast: Transition  = { duration: 0.18, ease }
export const med:  Transition  = { duration: 0.25, ease }
export const slow: Transition  = { duration: 0.35, ease }

// ── Variants réutilisables ──────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: med },
  exit:    { opacity: 0, y: -8, transition: fast },
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: fast },
  exit:    { opacity: 0, transition: fast },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: 6 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: med },
  exit:    { opacity: 0, scale: 0.96, y: 6, transition: fast },
}

export const slideDown: Variants = {
  hidden:  { opacity: 0, y: -8, scaleY: 0.95 },
  visible: { opacity: 1, y:  0, scaleY: 1,    transition: { duration: 0.16, ease } },
  exit:    { opacity: 0, y: -8, scaleY: 0.95, transition: { duration: 0.12, ease } },
}

// Conteneur staggeré pour listes / grilles
export const stagger = (delay = 0.05): Variants => ({
  hidden:  {},
  visible: { transition: { staggerChildren: delay, delayChildren: 0.05 } },
})

// Variante enfant pour stagger
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0,  transition: med },
}

// Lignes de tableau
export const tableRow: Variants = {
  hidden:  { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0,  transition: fast },
}

// Messages d'erreur
export const errorSlide: Variants = {
  hidden:  { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: 'auto', marginTop: 4, transition: { duration: 0.2, ease } },
  exit:    { opacity: 0, height: 0, marginTop: 0,       transition: { duration: 0.15 } },
}
