// src/theme/colors.ts
export const Colors = {
  // === PRIMARY PALETTE ===
  white:           '#FFFFFF',       // Pure white — backgrounds, cards
  offWhite:        '#F0F6FF',       // Slightly blue-tinted white — surface
  snow:            '#E8F2FF',       // Light blue-white — input backgrounds

  // === BLUE SPECTRUM ===
  electricBlue:    '#1A6FFF',       // Primary CTA, active states
  royalBlue:       '#1459CC',       // Pressed / active variant
  skyBlue:         '#3D8EFF',       // Secondary elements, gradients
  iceBlue:         '#A8CCFF',       // Subtle accents, dividers
  deepBlue:        '#0A2E6E',       // Dark navy — dark mode backgrounds
  midnightBlue:    '#071A45',       // Deepest background (dark mode)
  horizonBlue:     '#0D47A1',       // Dark surface (dark mode cards)

  // === NEUTRAL GREYS (Blue-tinted) ===
  grey100:         '#EBF2FF',       // Lightest
  grey200:         '#C8D9F0',
  grey300:         '#9AB4D4',
  grey400:         '#6A90B5',
  grey500:         '#4A6E94',
  grey600:         '#2E4D6E',
  grey700:         '#1C3352',
  grey800:         '#0F2238',
  grey900:         '#060F1E',       // Darkest

  // === SEMANTIC COLORS ===
  success:         '#00D4A0',       // Mint green — received / positive
  successLight:    '#E6FFF8',
  danger:          '#FF4B7D',       // Pink-red — error / sent
  dangerLight:     '#FFF0F4',
  warning:         '#FFC044',       // Amber — warnings / pending
  warningLight:    '#FFF8E6',

  // === GRADIENTS (use with LinearGradient) ===
  gradientPrimary: ['#1A6FFF', '#0A2E6E'],   // Electric → Deep Navy
  gradientCard:    ['#FFFFFF', '#EBF2FF'],   // White → Ice
  gradientDark:    ['#0D1F4A', '#071A45'],   // Dark blue gradient
  gradientSuccess: ['#00D4A0', '#00A07A'],
  gradientGold:    ['#FFD700', '#FFC044'],   // For premium accents

  // === GLASSMORPHISM ===
  glassWhite:      'rgba(255,255,255,0.12)',
  glassBorder:     'rgba(255,255,255,0.25)',
  glassShadow:     'rgba(26,111,255,0.15)',
};
