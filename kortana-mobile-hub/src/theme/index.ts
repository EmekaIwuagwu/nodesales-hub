import { COLORS, GRADIENTS } from './colors';
import { TYPE_SYSTEM, FONTS, SIZES, WEIGHTS, LINE_HEIGHTS } from './typography';
import { SPACING, RADIUS } from './spacing';
import { SHADOWS } from './shadows';

export const theme = {
    colors: COLORS,
    gradients: GRADIENTS,
    typography: TYPE_SYSTEM,
    fonts: FONTS,
    sizes: SIZES,
    weights: WEIGHTS,
    lineHeights: LINE_HEIGHTS,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
};

export type Theme = typeof theme;

export { COLORS, GRADIENTS, TYPE_SYSTEM, FONTS, SIZES, WEIGHTS, LINE_HEIGHTS, SPACING, RADIUS, SHADOWS };
